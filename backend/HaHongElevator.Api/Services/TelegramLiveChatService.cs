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

    // Fast in-memory cache for mapping Telegram MessageId -> Web SessionId
    private static readonly ConcurrentDictionary<long, string> MsgToSessionCache = new();
    // Fast in-memory cache for mapping Admin Forwarded MessageId -> Customer's Telegram ChatId
    private static readonly ConcurrentDictionary<long, string> MsgToCustomerChatMap = new();
    // Track last acknowledgment sent to customer to send it only ONCE per chat session
    private static readonly ConcurrentDictionary<string, DateTime> CustomerLastAckMap = new();
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
                    customer_chat_id VARCHAR(100),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
                ALTER TABLE live_chat_telegram_maps ADD COLUMN IF NOT EXISTS customer_chat_id VARCHAR(100);
                CREATE INDEX IF NOT EXISTS ix_live_chat_maps_session ON live_chat_telegram_maps(session_id);

                CREATE TABLE IF NOT EXISTS live_chat_sessions (
                    session_id VARCHAR(100) PRIMARY KEY,
                    customer_name VARCHAR(150) NOT NULL,
                    phone_number VARCHAR(50),
                    email VARCHAR(150),
                    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );

                CREATE TABLE IF NOT EXISTS telegram_customer_sessions (
                    chat_id VARCHAR(100) PRIMARY KEY,
                    last_ack_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
            ";

            await dbContext.Database.ExecuteSqlRawAsync(sql, cancellationToken);
            _logger.LogInformation("Live chat database tables verified.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not verify live_chat database tables.");
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

        // 2. Forward to Telegram for Admin
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
$@"💬 <b>TIN NHẮN TỪ KHÁCH TRÊN WEBSITE:</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>Khách:</b> {EscapeHtml(senderName)} (Mã: <code>#{GetShortId(sessionId)}</code>){phoneLine}{pageLine}
⏰ <b>Thời gian:</b> {vnTime:HH:mm:ss}
💭 <b>Nội dung:</b>
<blockquote>{EscapeHtml(messageText)}</blockquote>
━━━━━━━━━━━━━━━━━━━
👉 <i>Bấm <b>Reply (Trả lời)</b> tin nhắn này để gửi câu trả lời về website cho khách!</i>";

                    var sentMsgId = await PostTelegramMessageAsync(botToken, chatId, text, cts.Token);
                    if (sentMsgId.HasValue)
                    {
                        MsgToSessionCache[sentMsgId.Value] = sessionId;

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

    private static readonly JsonSerializerOptions TelegramJsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<List<TelegramUpdateItem>?> FetchUpdatesAsync(long offset, CancellationToken cancellationToken = default)
    {
        var (botToken, _, enabled) = GetTelegramConfig();
        if (!enabled || string.IsNullOrWhiteSpace(botToken)) return null;

        var url = $"https://api.telegram.org/bot{botToken}/getUpdates?offset={offset}&timeout=20";
        try
        {
            var res = await _httpClient.GetFromJsonAsync<TelegramUpdateResponse>(url, TelegramJsonOpts, cancellationToken);
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
        if (update.Message == null) return;
        var msg = update.Message;

        // 1. NEVER PROCESS MESSAGES SENT BY BOTS (Prevents all self-loops!)
        if (msg.From?.IsBot == true) return;
        if (string.IsNullOrWhiteSpace(msg.Text)) return;

        var (botToken, configuredChatId, enabled) = GetTelegramConfig();
        if (!enabled || string.IsNullOrWhiteSpace(botToken)) return;

        var senderChatId = msg.Chat?.Id.ToString();
        var senderUserId = msg.From?.Id.ToString() ?? senderChatId;
        var text = msg.Text.Trim();

        // 2. CHECK SENDER: IS IT THE ADMIN (YOU) OR A CUSTOMER?
        bool isAdmin = !string.IsNullOrWhiteSpace(configuredChatId) &&
                       (senderChatId == configuredChatId || senderUserId == configuredChatId);

        // Khởi tạo bàn phím điều hướng nhanh cho khách hàng
        var customerKeyboard = GetCustomerReplyMarkup();

        // NẾU LÀ LỆNH /START HOẶC /MENU (DÙ LÀ ADMIN TEST HAY KHÁCH HÀNG ĐỀU GỬI MENU TƯ VẤN)
        if (text.StartsWith("/start", StringComparison.OrdinalIgnoreCase) ||
            text.Equals("/menu", StringComparison.OrdinalIgnoreCase) ||
            text.Equals("/test", StringComparison.OrdinalIgnoreCase))
        {
            await TouchCustomerRepliedAsync(senderChatId!, cancellationToken);
            var welcomeMessage =
@"🏢 <b>CHÀO MỪNG BẠN ĐẾN VỚI THANG MÁY HÀ HỒNG!</b>
━━━━━━━━━━━━━━━━━━━
Dạ em là <b>Trợ lý Tư vấn Kỹ thuật & Báo giá tự động</b> của Công ty Thang Máy Hà Hồng.

Anh/chị vui lòng chọn các mục bên dưới hoặc nhắn tin trực tiếp nhu cầu tại đây để được hỗ trợ tức thì:
• 📊 <b>Báo giá thang máy gia đình</b> (Liên doanh & Nhập khẩu)
• 📐 <b>Kích thước hố thang & hố PIT</b> (Tối ưu nhà phố hẹp)
• 🏠 <b>Thang máy kính Homelift Panorama</b>
• 👨‍🔧 <b>Yêu cầu Kỹ sư trưởng gọi lại tư vấn</b>

📞 Hotline Kỹ thuật 24/7 / Zalo: <b>0909 9333 58</b>";

            await PostTelegramMessageAsync(botToken, senderChatId!, welcomeMessage, cancellationToken, customerKeyboard);

            // Nếu là khách thật (không phải admin test), thông báo cho Admin biết có khách vừa vào bot
            if (!isAdmin && !string.IsNullOrWhiteSpace(configuredChatId))
            {
                var customerName = $"{msg.From?.FirstName} {msg.From?.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(customerName)) customerName = "Khách hàng";
                var username = !string.IsNullOrWhiteSpace(msg.From?.Username) ? $"@{msg.From.Username}" : "Chưa đặt username";

                var noticeAdmin =
$@"🔔 <b>KHÁCH HÀNG VỪA KẾT NỐI TELEGRAM BOT!</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>Khách:</b> {EscapeHtml(customerName)} ({username})
🆔 <b>Chat ID:</b> <code>{senderChatId}</code>
⏰ <b>Thời gian:</b> {ToVietnamTime(DateTime.UtcNow):HH:mm:ss dd/MM}
👉 <i>Khách vừa bấm Bắt đầu chat trên Bot.</i>";

                await PostTelegramMessageAsync(botToken, configuredChatId, noticeAdmin, cancellationToken);
            }
            return;
        }

        if (isAdmin)
        {
            // ==========================================
            // TIN NHẮN TỪ ADMIN (BẠN)
            // ==========================================
            if (msg.ReplyToMessage != null)
            {
                var replyToId = msg.ReplyToMessage.MessageId;

                // A. Nếu đang trả lời Khách hàng chat qua Telegram
                string? customerChatId = null;
                if (MsgToCustomerChatMap.TryGetValue(replyToId, out var cachedCustChat))
                {
                    customerChatId = cachedCustChat;
                }
                else
                {
                    customerChatId = await FindCustomerChatIdByMsgIdDbAsync(replyToId, cancellationToken);
                }

                if (!string.IsNullOrWhiteSpace(customerChatId))
                {
                    var customerNotice = $"👨‍🔧 <b>Kỹ sư Thang Máy Hà Hồng:</b>\n\n{EscapeHtml(text)}";
                    await PostTelegramMessageAsync(botToken, customerChatId, customerNotice, cancellationToken, customerKeyboard);
                    await SendTelegramReplyAsync(botToken, configuredChatId!, "✅ <i>Đã gửi câu trả lời đến khách hàng trên Telegram!</i>", msg.MessageId, cancellationToken);
                    await TouchCustomerRepliedAsync(customerChatId, cancellationToken);
                    return;
                }

                // B. Nếu đang trả lời Khách hàng chat trên Website
                string? targetWebSession = null;
                if (MsgToSessionCache.TryGetValue(replyToId, out var cachedSession))
                {
                    targetWebSession = cachedSession;
                }
                else
                {
                    targetWebSession = await FindSessionByMsgIdDbAsync(replyToId, cancellationToken);
                }

                if (!string.IsNullOrWhiteSpace(targetWebSession))
                {
                    await SaveAgentReplyAsync(targetWebSession, text, cancellationToken);
                    await SendTelegramReplyAsync(botToken, configuredChatId!, $"✅ <i>Đã gửi câu trả lời về website cho Khách #{GetShortId(targetWebSession)}!</i>", msg.MessageId, cancellationToken);
                    return;
                }
            }
            else
            {
                // Admin gửi tin nhắn nhưng không bấm Reply: Hướng dẫn Admin cách sử dụng
                var adminGuide =
@"👋 <b>Xin chào Kỹ sư / Admin Thang Máy Hà Hồng!</b>
━━━━━━━━━━━━━━━━━━━
✅ Bot trung gian 2 chiều đang hoạt động hoàn toàn bình thường!

💡 <b>Cách trả lời tin nhắn của khách:</b>
Khi có tin nhắn từ khách (trên Website hoặc Telegram) gửi về đây:
1. Bạn hãy <b>chuột phải</b> (trên máy tính) hoặc <b>vuốt/nhấn giữ</b> (trên điện thoại) vào tin nhắn của khách
2. Chọn <b>Reply (Trả lời)</b>
3. Nhập câu trả lời rồi gửi đi.

Bot sẽ tự động chuyển tiếp câu trả lời về đúng khách hàng đó ngay lập tức! ✨
<i>(Gõ /menu hoặc /start để kiểm tra giao diện bot của khách hàng)</i>";

                await PostTelegramMessageAsync(botToken, configuredChatId!, adminGuide, cancellationToken, customerKeyboard);
                return;
            }

            return;
        }
        else
        {
            // ==========================================
            // TIN NHẮN TỪ KHÁCH HÀNG (CUSTOMER)
            // ==========================================
            if (string.IsNullOrWhiteSpace(configuredChatId) || string.IsNullOrWhiteSpace(senderChatId)) return;

            var now = DateTime.UtcNow;
            var vnTime = ToVietnamTime(now);
            var lowerText = text.ToLowerInvariant();

            var customerName = $"{msg.From?.FirstName} {msg.From?.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(customerName)) customerName = "Khách hàng Telegram";
            var username = !string.IsNullOrWhiteSpace(msg.From?.Username) ? $"@{msg.From.Username}" : "Chưa đặt username";

            // Kiểm tra xem khách có để lại Số điện thoại không
            var phoneMatch = System.Text.RegularExpressions.Regex.Match(text, @"(0|\+84)[35789][0-9]{8}");
            bool hasPhone = phoneMatch.Success;

            // 1. Phản hồi tự động thông minh theo nội dung khách chọn/hỏi
            string? botAutoReply = null;

            if (lowerText.Contains("báo giá") || lowerText.Contains("chi phí") || lowerText.Contains("giá bao nhiêu") || lowerText.Contains("giá thang"))
            {
                botAutoReply =
@"💰 <b>BẢNG GIÁ THAM KHẢO THANG MÁY HÀ HỒNG (2026):</b>
━━━━━━━━━━━━━━━━━━━
1️⃣ <b>Thang máy gia đình liên doanh (Fuji / Montanari / Mitsubishi):</b>
• Tải trọng 250kg - 450kg: Dao động từ <b>280 - 450 triệu VNĐ</b>.
• Động cơ & tủ điều khiển nhập khẩu chính hãng, vách cabin Inox gương/sọc nhuyễn hoặc phối vân gỗ cao cấp.

2️⃣ <b>Thang máy kính Homelift Panorama cao cấp:</b>
• Giá hoàn thiện: Từ <b>550 - 850+ triệu VNĐ</b> (Khung nhôm định hình cao cấp hoặc Inox PVD, 4 mặt kính cường lực an toàn).

💡 <i>Để nhận file báo giá chi tiết và bản vẽ kỹ thuật theo đúng số tầng & kích thước nhà anh/chị, anh/chị nhắn giúp em <b>Số tầng</b> hoặc để lại <b>Số điện thoại</b> tại đây nhé!</i>";
            }
            else if (lowerText.Contains("kích thước") || lowerText.Contains("hố thang") || lowerText.Contains("hố pit") || lowerText.Contains("chiều cao") || lowerText.Contains("oh"))
            {
                botAutoReply =
@"📐 <b>KÍCH THƯỚC HỐ THANG THAM KHẢO:</b>
━━━━━━━━━━━━━━━━━━━
• <b>Thang Homelift mini siêu nhỏ (3-4 người):</b>
  - Kích thước phủ bì: từ <b>1000 x 1000 mm</b> đến <b>1200 x 1200 mm</b>
  - Chiều sâu hố PIT: chỉ từ <b>200 - 300 mm</b> (hoàn toàn không cần đào sâu, không chạm móng nhà phố)
  - Chiều cao tầng trên cùng (OH): từ <b>2600 - 2800 mm</b>

• <b>Thang máy tiêu chuẩn (4-6 người - 450kg):</b>
  - Kích thước phủ bì: khoảng <b>1500 x 1500 mm</b>
  - Hố PIT: <b>450 - 600 mm</b> | OH: <b>3400 - 3800 mm</b>

💡 <i>Hà Hồng hỗ trợ kỹ sư đến khảo sát vị trí và đo đạc thực tế tại công trình <b>MIỄN PHÍ 100%</b>. Anh/chị nhắn địa chỉ hoặc SĐT để đặt lịch nhé!</i>";
            }
            else if (lowerText.Contains("kính") || lowerText.Contains("homelift"))
            {
                botAutoReply =
@"🏠 <b>THANG MÁY KÍNH HOMELIFT PANORAMA HÀ HỒNG:</b>
━━━━━━━━━━━━━━━━━━━
• Thiết kế 4 mặt kính cường lực an toàn 2 lớp, tầm nhìn rộng mở, lấy sáng giếng trời cực tốt.
• Khung hợp kim nhôm chịu lực hàng không hoặc Inox mạ PVD Gold/Black sang trọng.
• Vận hành êm ái dưới 50dB, công nghệ biến tần tiết kiệm điện năng tới 40%.
• Lắp đặt nhanh gọn chỉ trong 7 - 10 ngày làm việc.";
            }
            else if (hasPhone)
            {
                botAutoReply =
$@"✅ <b>DẠ EM ĐÃ GHI NHẬN SỐ ĐIỆN THOẠI CỦA ANH/CHỊ!</b>
━━━━━━━━━━━━━━━━━━━
📱 <b>Số điện thoại:</b> {phoneMatch.Value}

Kỹ sư trưởng Thang Máy Hà Hồng đã nhận được thông báo và sẽ liên hệ trực tiếp cho anh/chị qua Điện thoại / Zalo trong vòng <b>5 - 10 phút</b> để tư vấn chu đáo nhất ạ!

📞 Hotline kỹ thuật khẩn cấp 24/7: <b>0909 9333 58</b>";
            }
            else if (lowerText.Contains("kỹ sư") || lowerText.Contains("gọi lại") || lowerText.Contains("tư vấn") || lowerText.Contains("liên hệ"))
            {
                botAutoReply =
@"👨‍🔧 <b>DẠ KỸ SƯ HÀ HỒNG SẴN SÀNG HỖ TRỢ ANH/CHỊ!</b>
━━━━━━━━━━━━━━━━━━━
Anh/chị vui lòng để lại <b>Số điện thoại</b> hoặc nhắn nội dung công trình (địa chỉ, số tầng, tình trạng nhà xây mới hay cải tạo).

Kỹ sư bên em sẽ gọi lại ngay hoặc tư vấn chi tiết qua Zalo cho anh/chị ạ! 📞";
            }
            else if (lowerText.Contains("hotline") || lowerText.Contains("điện thoại") || lowerText.Contains("sđt"))
            {
                botAutoReply =
@"📞 <b>HOTLINE TƯ VẤN & CỨU HỘ 24/7:</b>
━━━━━━━━━━━━━━━━━━━
• Trực tiếp Kỹ sư trưởng: <b>0909 9333 58</b>
• Zalo tư vấn: <b>0909 9333 58</b>
• Email: <b>hahongco@gmail.com</b>
• Website: <b>thangmayhahong.xyz</b>

Anh/chị có thể gọi điện trực tiếp bất cứ lúc nào để được hỗ trợ nhanh nhất ạ!";
            }

            // Gửi câu trả lời cho khách nếu có nội dung phù hợp
            if (!string.IsNullOrWhiteSpace(botAutoReply))
            {
                await PostTelegramMessageAsync(botToken, senderChatId, botAutoReply, cancellationToken, customerKeyboard);
            }
            else
            {
                // Nếu là tin nhắn bình thường khác, gửi xác nhận tiếp nhận
                var ackToCustomer = "Dạ em đã chuyển tin nhắn của anh/chị đến Kỹ sư Thang Máy Hà Hồng. Kỹ sư sẽ phản hồi anh/chị ngay tại đây trong giây lát ạ! 👨‍🔧 (Hotline hỗ trợ nhanh: 0909 9333 58)";
                await PostTelegramMessageAsync(botToken, senderChatId, ackToCustomer, cancellationToken, customerKeyboard);
            }

            // Chuyển tiếp tin nhắn của khách hàng về cho ADMIN (Bạn)
            var forwardHeader = hasPhone ? "🚨 <b>CÓ KHÁCH ĐỂ LẠI SỐ ĐIỆN THOẠI TRÊN TELEGRAM!</b>" : "💬 <b>CÓ KHÁCH HÀNG CHAT QUA TELEGRAM!</b>";
            var forwardToAdmin =
$@"{forwardHeader}
━━━━━━━━━━━━━━━━━━━
👤 <b>Khách:</b> {EscapeHtml(customerName)} ({username})
🆔 <b>Chat ID:</b> <code>{senderChatId}</code>
⏰ <b>Thời gian:</b> {vnTime:HH:mm:ss dd/MM}
💭 <b>Nội dung tin nhắn:</b>
<blockquote>{EscapeHtml(text)}</blockquote>
━━━━━━━━━━━━━━━━━━━
👉 <i>Bấm <b>Reply (Trả lời)</b> tin nhắn này để chat trực tiếp lại với khách!</i>";

            var adminMsgId = await PostTelegramMessageAsync(botToken, configuredChatId, forwardToAdmin, cancellationToken);
            if (adminMsgId.HasValue)
            {
                MsgToCustomerChatMap[adminMsgId.Value] = senderChatId;
                await SaveCustomerChatMapDbAsync(adminMsgId.Value, senderChatId, cancellationToken);
            }
        }
    }

    private async Task SaveCustomerChatMapDbAsync(long telegramMessageId, string customerChatId, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);
            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                INSERT INTO live_chat_telegram_maps (telegram_message_id, session_id, customer_chat_id, created_at)
                VALUES (@msg_id, '', @customer_chat_id, NOW() AT TIME ZONE 'UTC')
                ON CONFLICT (telegram_message_id) DO UPDATE SET customer_chat_id = EXCLUDED.customer_chat_id;
            ";
            cmd.Parameters.Add(new NpgsqlParameter("msg_id", telegramMessageId));
            cmd.Parameters.Add(new NpgsqlParameter("customer_chat_id", customerChatId));
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to persist customer telegram chat map for message {MsgId}.", telegramMessageId);
        }
    }

    private async Task<bool> ShouldSendCustomerAckAsync(string chatId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        // 1. In-memory check first (fastest)
        if (CustomerLastAckMap.TryGetValue(chatId, out var lastMemory) && (now - lastMemory).TotalMinutes < 60)
        {
            return false;
        }

        // 2. Database check (persists across restarts/redeployments)
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS telegram_customer_sessions (
                    chat_id VARCHAR(100) PRIMARY KEY,
                    last_ack_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
                SELECT last_ack_at FROM telegram_customer_sessions WHERE chat_id = @chat_id LIMIT 1;
            ";
            cmd.Parameters.Add(new NpgsqlParameter("chat_id", chatId));
            var dbVal = await cmd.ExecuteScalarAsync(cancellationToken);

            if (dbVal != null && dbVal != DBNull.Value && DateTime.TryParse(dbVal.ToString(), out var dbLastAck))
            {
                if ((now - dbLastAck).TotalMinutes < 60)
                {
                    CustomerLastAckMap[chatId] = dbLastAck;
                    return false;
                }
            }

            // Save new ack time
            using var upsertCmd = conn.CreateCommand();
            upsertCmd.CommandText = @"
                INSERT INTO telegram_customer_sessions (chat_id, last_ack_at)
                VALUES (@chat_id, @now)
                ON CONFLICT (chat_id) DO UPDATE SET last_ack_at = EXCLUDED.last_ack_at;
            ";
            upsertCmd.Parameters.Add(new NpgsqlParameter("chat_id", chatId));
            upsertCmd.Parameters.Add(new NpgsqlParameter("now", now));
            await upsertCmd.ExecuteNonQueryAsync(cancellationToken);

            CustomerLastAckMap[chatId] = now;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to verify telegram customer session in DB.");
            CustomerLastAckMap[chatId] = now;
            return true;
        }
    }

    private async Task TouchCustomerRepliedAsync(string customerChatId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        CustomerLastAckMap[customerChatId] = now;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS telegram_customer_sessions (
                    chat_id VARCHAR(100) PRIMARY KEY,
                    last_ack_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
                );
                INSERT INTO telegram_customer_sessions (chat_id, last_ack_at)
                VALUES (@chat_id, @now)
                ON CONFLICT (chat_id) DO UPDATE SET last_ack_at = EXCLUDED.last_ack_at;
            ";
            cmd.Parameters.Add(new NpgsqlParameter("chat_id", customerChatId));
            cmd.Parameters.Add(new NpgsqlParameter("now", now));
            await cmd.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to touch customer session in DB.");
        }
    }

    private async Task<string?> FindCustomerChatIdByMsgIdDbAsync(long replyToId, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var conn = dbContext.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT customer_chat_id FROM live_chat_telegram_maps WHERE telegram_message_id = @id AND customer_chat_id IS NOT NULL AND customer_chat_id <> '' LIMIT 1;";
            cmd.Parameters.Add(new NpgsqlParameter("id", replyToId));
            var dbRes = await cmd.ExecuteScalarAsync(cancellationToken);
            return dbRes?.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying live_chat_telegram_maps for customer chat ID {ReplyId}", replyToId);
            return null;
        }
    }

    private async Task<string?> FindSessionByMsgIdDbAsync(long replyToId, CancellationToken cancellationToken)
    {
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
            return dbRes?.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error querying live_chat_telegram_maps for reply ID {ReplyId}", replyToId);
            return null;
        }
    }

    private async Task SaveAgentReplyAsync(string targetSessionId, string text, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var conn = dbContext.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open) await conn.OpenAsync(cancellationToken);

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO live_chat_messages (session_id, sender, sender_name, message, created_at, is_read)
            VALUES (@session_id, 'agent', 'Kỹ sư Thang Máy Hà Hồng', @message, @created_at, false);

            UPDATE live_chat_sessions
            SET last_active_at = @created_at
            WHERE session_id = @session_id;
        ";
        cmd.Parameters.Add(new NpgsqlParameter("session_id", targetSessionId));
        cmd.Parameters.Add(new NpgsqlParameter("message", text));
        cmd.Parameters.Add(new NpgsqlParameter("created_at", now));

        await cmd.ExecuteNonQueryAsync(cancellationToken);
    }

    private static object GetCustomerReplyMarkup()
    {
        return new
        {
            keyboard = new[]
            {
                new[] { new { text = "📊 Báo giá thang máy gia đình" }, new { text = "📐 Kích thước hố thang & PIT" } },
                new[] { new { text = "🏠 Thang máy kính Homelift" }, new { text = "👨‍🔧 Yêu cầu Kỹ sư gọi lại" } },
                new[] { new { text = "📞 Hotline: 0909 9333 58" } }
            },
            resize_keyboard = true,
            one_time_keyboard = false
        };
    }

    private async Task<long?> PostTelegramMessageAsync(
        string botToken,
        string chatId,
        string messageText,
        CancellationToken cancellationToken,
        object? replyMarkup = null)
    {
        var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
        var payload = new Dictionary<string, object?>
        {
            ["chat_id"] = chatId,
            ["text"] = messageText,
            ["parse_mode"] = "HTML",
            ["disable_web_page_preview"] = true
        };

        if (replyMarkup != null)
        {
            payload["reply_markup"] = replyMarkup;
        }

        try
        {
            using var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Telegram API returned non-success: {Status} {Error}", response.StatusCode, err);
                return null;
            }

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
            if (json.TryGetProperty("result", out var result) && result.TryGetProperty("message_id", out var msgId))
            {
                return msgId.GetInt64();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Failed to post message to Telegram: {Message}", ex.Message);
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
