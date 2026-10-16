using System.Collections.Concurrent;
using System.Net.Http.Json;
using System.Text.Json;
using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.LiveChat;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace HaHongElevator.Api.Services;

public class TelegramLiveChatService : ITelegramLiveChatService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TelegramLiveChatService> _logger;

    // Fast in-memory cache for mapping Telegram MessageId -> SessionId
    private static readonly ConcurrentDictionary<long, string> MsgToSessionCache = new();
    private static string? _lastActiveSessionId;

    public TelegramLiveChatService(
        HttpClient httpClient,
        IConfiguration configuration,
        IServiceScopeFactory scopeFactory,
        ILogger<TelegramLiveChatService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _scopeFactory = scopeFactory;
        _logger = logger;

        _httpClient.Timeout = TimeSpan.FromSeconds(35);
    }

    private (string? BotToken, string? ChatId, bool Enabled) GetTelegramConfig()
    {
        var botToken = _configuration["Telegram:BotToken"]
            ?? Environment.GetEnvironmentVariable("TELEGRAM_BOT_TOKEN");

        var chatId = _configuration["Telegram:ChatId"]
            ?? Environment.GetEnvironmentVariable("TELEGRAM_CHAT_ID");

        var enabledStr = _configuration["Telegram:EnableNotification"]
            ?? Environment.GetEnvironmentVariable("TELEGRAM_ENABLE_NOTIFICATION");

        var enabled = true;
        if (!string.IsNullOrWhiteSpace(enabledStr) && bool.TryParse(enabledStr, out var parsed))
        {
            enabled = parsed;
        }

        return (botToken?.Trim(), chatId?.Trim(), enabled);
    }

    public async Task EnsureTablesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            const string sql = @"
                CREATE TABLE IF NOT EXISTS live_chat_messages (
                    id BIGSERIAL PRIMARY KEY,
                    session_id VARCHAR(100) NOT NULL,
                    sender VARCHAR(20) NOT NULL,
                    sender_name VARCHAR(150) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC'),
                    is_read BOOLEAN DEFAULT FALSE
                );
                CREATE INDEX IF NOT EXISTS ix_live_chat_messages_session ON live_chat_messages(session_id);

                CREATE TABLE IF NOT EXISTS live_chat_telegram_maps (
                    telegram_message_id BIGINT PRIMARY KEY,
                    session_id VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
                CREATE INDEX IF NOT EXISTS ix_live_chat_maps_session ON live_chat_telegram_maps(session_id);

                CREATE TABLE IF NOT EXISTS live_chat_sessions (
                    session_id VARCHAR(100) PRIMARY KEY,
                    customer_name VARCHAR(150) NOT NULL,
                    phone_number VARCHAR(50),
                    email VARCHAR(150),
                    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
            ";

            await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
            _logger.LogInformation("Live chat database tables verified.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not verify live_chat database tables. Live chat may use in-memory fallback.");
        }
    }

    public async Task<LiveChatMessageDto> SendCustomerMessageAsync(SendLiveChatMessageRequest request, CancellationToken cancellationToken = default)
    {
        var sessionId = string.IsNullOrWhiteSpace(request.SessionId)
            ? $"guest_{Guid.NewGuid():N}"[..18]
            : request.SessionId.Trim();

        var senderName = string.IsNullOrWhiteSpace(request.SenderName)
            ? $"Khách #{GetShortId(sessionId)}"
            : request.SenderName.Trim();

        var messageText = request.Message.Trim();
        var now = DateTime.UtcNow;

        _lastActiveSessionId = sessionId;

        // 1. Save to database
        long savedId = 0;
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO live_chat_messages (session_id, sender, sender_name, message, created_at, is_read)
                VALUES (@session_id, 'customer', @sender_name, @message, @created_at, false)
                RETURNING id;

                INSERT INTO live_chat_sessions (session_id, customer_name, phone_number, email, last_active_at)
                VALUES (@session_id, @sender_name, @phone, @email, @created_at)
                ON CONFLICT (session_id) DO UPDATE SET
                    customer_name = CASE WHEN EXCLUDED.customer_name <> '' THEN EXCLUDED.customer_name ELSE live_chat_sessions.customer_name END,
                    phone_number = COALESCE(EXCLUDED.phone_number, live_chat_sessions.phone_number),
                    email = COALESCE(EXCLUDED.email, live_chat_sessions.email),
                    last_active_at = EXCLUDED.last_active_at;
            ";

            cmd.Parameters.Add(new NpgsqlParameter("session_id", sessionId));
            cmd.Parameters.Add(new NpgsqlParameter("sender_name", senderName));
            cmd.Parameters.Add(new NpgsqlParameter("message", messageText));
            cmd.Parameters.Add(new NpgsqlParameter("created_at", now));
            cmd.Parameters.Add(new NpgsqlParameter("phone", (object?)request.CustomerPhone ?? DBNull.Value));
            cmd.Parameters.Add(new NpgsqlParameter("email", (object?)request.CustomerEmail ?? DBNull.Value));

            var res = await cmd.ExecuteScalarAsync(cancellationToken);
            if (res != null && long.TryParse(res.ToString(), out var id))
            {
                savedId = id;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist live chat message to PostgreSQL.");
            savedId = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        // 2. Forward to Telegram
        var (botToken, chatId, enabled) = GetTelegramConfig();
        if (enabled && !string.IsNullOrWhiteSpace(botToken) && !string.IsNullOrWhiteSpace(chatId))
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(8));
                    var vnTime = ToVietnamTime(now);

                    var phoneLine = !string.IsNullOrWhiteSpace(request.CustomerPhone)
                        ? $"\n📞 <b>SĐT:</b> <a href='tel:{request.CustomerPhone}'>{request.CustomerPhone}</a>"
                        : "";

                    var pageLine = !string.IsNullOrWhiteSpace(request.PageUrl)
                        ? $"\n📍 <b>Trang:</b> {EscapeHtml(request.PageUrl)}"
                        : "";

                    var text =
$@"💬 <b>TIN NHẮN MỚI TỪ KHÁCH HÀNG</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>Khách:</b> {EscapeHtml(senderName)} (Mã: <code>#{GetShortId(sessionId)}</code>){phoneLine}{pageLine}
⏰ <b>Thời gian:</b> {vnTime:HH:mm:ss}
💭 <b>Nội dung:</b>
<blockquote>{EscapeHtml(messageText)}</blockquote>
━━━━━━━━━━━━━━━━━━━
👉 <i>Bấm <b>Reply (Trả lời)</b> tin nhắn này trên Telegram để gửi câu trả lời về website cho khách!</i>";

                    var sentMsgId = await PostTelegramMessageAsync(botToken, chatId, text, cts.Token);
                    if (sentMsgId.HasValue)
                    {
                        MsgToSessionCache[sentMsgId.Value] = sessionId;

                        // Save mapping to DB
                        try
                        {
                            using var mapScope = _scopeFactory.CreateScope();
                            var mapDb = mapScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            var mapConn = mapDb.Database.GetDbConnection();
                            if (mapConn.State != System.Data.ConnectionState.Open) await mapConn.OpenAsync(cts.Token);
                            using var mapCmd = mapConn.CreateCommand();
                            mapCmd.CommandText = @"
                                INSERT INTO live_chat_telegram_maps (telegram_message_id, session_id, created_at)
                                VALUES (@msg_id, @session_id, @created_at)
                                ON CONFLICT (telegram_message_id) DO NOTHING;
                            ";
                            mapCmd.Parameters.Add(new NpgsqlParameter("msg_id", sentMsgId.Value));
                            mapCmd.Parameters.Add(new NpgsqlParameter("session_id", sessionId));
                            mapCmd.Parameters.Add(new NpgsqlParameter("created_at", now));
                            await mapCmd.ExecuteNonQueryAsync(cts.Token);
                        }
                        catch (Exception mapEx)
                        {
                            _logger.LogWarning(mapEx, "Failed to persist telegram message map.");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to forward customer message to Telegram.");
                }
            });
        }

        return new LiveChatMessageDto
        {
            Id = savedId,
            SessionId = sessionId,
            Sender = "customer",
            SenderName = senderName,
            Message = messageText,
            CreatedAt = now,
            IsRead = false
        };
    }

    public async Task<List<LiveChatMessageDto>> GetHistoryAsync(string sessionId, long? afterId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId)) return [];

        var list = new List<LiveChatMessageDto>();
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            if (afterId.HasValue && afterId.Value > 0)
            {
                cmd.CommandText = @"
                    SELECT id, session_id, sender, sender_name, message, created_at, is_read
                    FROM live_chat_messages
                    WHERE session_id = @session_id AND id > @after_id
                    ORDER BY id ASC;
                ";
                cmd.Parameters.Add(new NpgsqlParameter("session_id", sessionId.Trim()));
                cmd.Parameters.Add(new NpgsqlParameter("after_id", afterId.Value));
            }
            else
            {
                cmd.CommandText = @"
                    SELECT id, session_id, sender, sender_name, message, created_at, is_read
                    FROM live_chat_messages
                    WHERE session_id = @session_id
                    ORDER BY id ASC
                    LIMIT 100;
                ";
                cmd.Parameters.Add(new NpgsqlParameter("session_id", sessionId.Trim()));
            }

            using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                list.Add(new LiveChatMessageDto
                {
                    Id = reader.GetInt64(0),
                    SessionId = reader.GetString(1),
                    Sender = reader.GetString(2),
                    SenderName = reader.GetString(3),
                    Message = reader.GetString(4),
                    CreatedAt = reader.GetDateTime(5),
                    IsRead = reader.GetBoolean(6)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch live chat history for session {SessionId}.", sessionId);
        }

        return list;
    }

    public async Task UpdateCustomerInfoAsync(UpdateCustomerInfoDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.SessionId)) return;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO live_chat_sessions (session_id, customer_name, phone_number, email, last_active_at)
                VALUES (@session_id, @customer_name, @phone, @email, NOW() AT TIME ZONE 'UTC')
                ON CONFLICT (session_id) DO UPDATE SET
                    customer_name = COALESCE(NULLIF(@customer_name, ''), live_chat_sessions.customer_name),
                    phone_number = COALESCE(NULLIF(@phone, ''), live_chat_sessions.phone_number),
                    email = COALESCE(NULLIF(@email, ''), live_chat_sessions.email),
                    last_active_at = NOW() AT TIME ZONE 'UTC';
            ";
            cmd.Parameters.Add(new NpgsqlParameter("session_id", dto.SessionId.Trim()));
            cmd.Parameters.Add(new NpgsqlParameter("customer_name", dto.FullName?.Trim() ?? ""));
            cmd.Parameters.Add(new NpgsqlParameter("phone", (object?)dto.PhoneNumber?.Trim() ?? DBNull.Value));
            cmd.Parameters.Add(new NpgsqlParameter("email", (object?)dto.Email?.Trim() ?? DBNull.Value));

            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update customer info for session {SessionId}.", dto.SessionId);
        }
    }

    public async Task<List<LiveChatSessionSummaryDto>> GetRecentSessionsAsync(int limit = 50, CancellationToken cancellationToken = default)
    {
        var list = new List<LiveChatSessionSummaryDto>();
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                SELECT s.session_id, s.customer_name, s.phone_number, s.last_active_at,
                       COALESCE((SELECT m.message FROM live_chat_messages m WHERE m.session_id = s.session_id ORDER BY m.id DESC LIMIT 1), '') as last_msg,
                       COALESCE((SELECT COUNT(*) FROM live_chat_messages m WHERE m.session_id = s.session_id AND m.sender = 'customer' AND m.is_read = false), 0) as unread
                FROM live_chat_sessions s
                ORDER BY s.last_active_at DESC
                LIMIT @limit;
            ";
            cmd.Parameters.Add(new NpgsqlParameter("limit", Math.Clamp(limit, 1, 100)));

            using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                list.Add(new LiveChatSessionSummaryDto
                {
                    SessionId = reader.GetString(0),
                    CustomerName = reader.GetString(1),
                    CustomerPhone = reader.IsDBNull(2) ? null : reader.GetString(2),
                    LastActiveAt = reader.GetDateTime(3),
                    LastMessage = reader.GetString(4),
                    UnreadCount = Convert.ToInt32(reader.GetInt64(5))
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch recent live chat sessions.");
        }

        return list;
    }

    public async Task<List<TelegramUpdateItem>?> FetchUpdatesAsync(long offset, CancellationToken cancellationToken = default)
    {
        var (botToken, _, enabled) = GetTelegramConfig();
        if (!enabled || string.IsNullOrWhiteSpace(botToken)) return null;

        var url = $"https://api.telegram.org/bot{botToken}/getUpdates?offset={offset}&timeout=20";
        try
        {
            var res = await _httpClient.GetFromJsonAsync<TelegramUpdateResponse>(url, cancellationToken);
            return res?.Ok == true ? res.Result : null;
        }
        catch (OperationCanceledException)
        {
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Telegram getUpdates exception: {Message}", ex.Message);
            return null;
        }
    }

    public async Task ProcessIncomingUpdateAsync(TelegramUpdateItem update, CancellationToken cancellationToken = default)
    {
        if (update.Message == null || string.IsNullOrWhiteSpace(update.Message.Text)) return;

        var (botToken, configuredChatId, _) = GetTelegramConfig();
        if (string.IsNullOrWhiteSpace(botToken)) return;

        var msg = update.Message;
        var incomingChatId = msg.Chat?.Id.ToString();

        // Optional security: only respond if from configured chat or group
        if (!string.IsNullOrWhiteSpace(configuredChatId) && incomingChatId != configuredChatId)
        {
            _logger.LogWarning("Received Telegram message from unauthorized chatId {ChatId}.", incomingChatId);
            return;
        }

        var text = msg.Text.Trim();

        // Check if this is a reply to a previous customer notification
        string? targetSessionId = null;

        if (msg.ReplyToMessage != null)
        {
            var replyToId = msg.ReplyToMessage.MessageId;

            // Check cache
            if (MsgToSessionCache.TryGetValue(replyToId, out var cachedSession))
            {
                targetSessionId = cachedSession;
            }
            else
            {
                // Check DB
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var conn = dbContext.Database.GetDbConnection();
                    if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = "SELECT session_id FROM live_chat_telegram_maps WHERE telegram_message_id = @id LIMIT 1;";
                    cmd.Parameters.Add(new NpgsqlParameter("id", replyToId));
                    var dbRes = await cmd.ExecuteScalarAsync(cancellationToken);
                    if (dbRes != null)
                    {
                        targetSessionId = dbRes.ToString();
                        if (!string.IsNullOrWhiteSpace(targetSessionId))
                        {
                            MsgToSessionCache[replyToId] = targetSessionId;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error querying live_chat_telegram_maps for reply ID {ReplyId}", replyToId);
                }
            }
        }

        // Fallback: Check if message text starts with session code e.g. #3849
        if (string.IsNullOrWhiteSpace(targetSessionId) && text.StartsWith('#') && text.Length > 5)
        {
            var parts = text.Split(' ', 2);
            var code = parts[0].Trim('#');
            if (parts.Length > 1)
            {
                targetSessionId = await FindSessionByCodeAsync(code, cancellationToken);
                if (!string.IsNullOrWhiteSpace(targetSessionId))
                {
                    text = parts[1].Trim();
                }
            }
        }

        // Fallback: Route to last active session
        if (string.IsNullOrWhiteSpace(targetSessionId))
        {
            targetSessionId = _lastActiveSessionId;
        }

        if (string.IsNullOrWhiteSpace(targetSessionId))
        {
            await SendTelegramReplyAsync(botToken, incomingChatId ?? configuredChatId!,
                "⚠️ Không tìm thấy phiên chat tương ứng.\n👉 Hãy bấm <b>Reply (Trả lời)</b> đúng tin nhắn của khách hàng để gửi phản hồi.",
                msg.MessageId, cancellationToken);
            return;
        }

        // Save Agent Reply to Database
        var now = DateTime.UtcNow;
        var agentName = !string.IsNullOrWhiteSpace(msg.From?.FirstName)
            ? $"Kỹ sư {msg.From.FirstName}"
            : "Kỹ sư Thang Máy Hà Hồng";

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO live_chat_messages (session_id, sender, sender_name, message, created_at, is_read)
                VALUES (@session_id, 'agent', @sender_name, @message, @created_at, false);

                UPDATE live_chat_sessions
                SET last_active_at = @created_at
                WHERE session_id = @session_id;
            ";
            cmd.Parameters.Add(new NpgsqlParameter("session_id", targetSessionId));
            cmd.Parameters.Add(new NpgsqlParameter("sender_name", agentName));
            cmd.Parameters.Add(new NpgsqlParameter("message", text));
            cmd.Parameters.Add(new NpgsqlParameter("created_at", now));

            await cmd.ExecuteNonQueryAsync(cancellationToken);

            // Send confirmation back to Telegram
            var confirmText = $"✅ <b>Đã gửi phản hồi đến Khách #{GetShortId(targetSessionId)} trên website:</b>\n<i>\"{EscapeHtml(text)}\"</i>";
            await SendTelegramReplyAsync(botToken, incomingChatId ?? configuredChatId!, confirmText, msg.MessageId, cancellationToken);
            _logger.LogInformation("Agent reply sent to customer session {SessionId}.", targetSessionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save agent message for session {SessionId}.", targetSessionId);
            await SendTelegramReplyAsync(botToken, incomingChatId ?? configuredChatId!, "❌ Không thể lưu tin nhắn do lỗi hệ thống.", msg.MessageId, cancellationToken);
        }
    }

    private async Task<string?> FindSessionByCodeAsync(string code, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT session_id FROM live_chat_sessions WHERE session_id LIKE @pattern ORDER BY last_active_at DESC LIMIT 1;";
            cmd.Parameters.Add(new NpgsqlParameter("pattern", $"%{code}%"));
            var res = await cmd.ExecuteScalarAsync(cancellationToken);
            return res?.ToString();
        }
        catch
        {
            return null;
        }
    }

    private async Task<long?> PostTelegramMessageAsync(string botToken, string chatId, string messageText, CancellationToken cancellationToken)
    {
        var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
        var payload = new
        {
            chat_id = chatId,
            text = messageText,
            parse_mode = "HTML",
            disable_web_page_preview = true
        };

        using var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        if (json.TryGetProperty("result", out var result) && result.TryGetProperty("message_id", out var msgId))
        {
            return msgId.GetInt64();
        }

        return null;
    }

    private async Task SendTelegramReplyAsync(string botToken, string chatId, string messageText, long replyToMessageId, CancellationToken cancellationToken)
    {
        var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
        var payload = new
        {
            chat_id = chatId,
            text = messageText,
            parse_mode = "HTML",
            reply_to_message_id = replyToMessageId,
            disable_web_page_preview = true
        };

        try
        {
            await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to send telegram reply confirmation: {Message}", ex.Message);
        }
    }

    private static string GetShortId(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId)) return "0000";
        var clean = new string(sessionId.Where(char.IsLetterOrDigit).ToArray());
        return clean.Length > 6 ? clean[^4..] : clean;
    }

    private static string EscapeHtml(string? input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        return input
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;");
    }

    private static DateTime ToVietnamTime(DateTime utcTime)
    {
        try
        {
            var tzId = OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh";
            return TimeZoneInfo.ConvertTimeFromUtc(
                utcTime == default ? DateTime.UtcNow : utcTime,
                TimeZoneInfo.FindSystemTimeZoneById(tzId));
        }
        catch
        {
            return (utcTime == default ? DateTime.UtcNow : utcTime).AddHours(7);
        }
    }
}
