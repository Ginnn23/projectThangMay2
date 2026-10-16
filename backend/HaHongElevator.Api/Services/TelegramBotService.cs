using System.Net.Http.Json;
using System.Text.Json;
using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public class TelegramBotService : ITelegramBotService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TelegramBotService> _logger;

    public TelegramBotService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<TelegramBotService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        _httpClient.Timeout = TimeSpan.FromSeconds(8);
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

    public async Task SendEstimateLeadNotificationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default)
    {
        var (botToken, chatId, enabled) = GetTelegramConfig();

        if (!enabled)
        {
            _logger.LogInformation("Telegram notification is disabled by configuration.");
            return;
        }

        if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(chatId))
        {
            _logger.LogWarning("Telegram BotToken or ChatId is not configured. Skipping estimate notification for #{EstimateId}.", estimate.Id);
            return;
        }

        try
        {
            var vnTime = ToVietnamTime(estimate.CreatedAt);

            var cleanPhone = new string(estimate.PhoneNumber.Where(char.IsDigit).ToArray());
            var building = EscapeHtml(estimate.BuildingType);
            var elevator = EscapeHtml(estimate.ElevatorType);
            var motor = EscapeHtml(estimate.MotorBrand);
            var door = EscapeHtml(estimate.DoorType);
            var notes = string.IsNullOrWhiteSpace(estimate.AdminNotes) ? "Không có" : EscapeHtml(estimate.AdminNotes);
            var address = string.IsNullOrWhiteSpace(estimate.Address) ? "TP.HCM & Lân cận" : EscapeHtml(estimate.Address);
            var email = string.IsNullOrWhiteSpace(estimate.Email) ? "Chưa cung cấp" : EscapeHtml(estimate.Email);

            var messageText =
$@"🚨 <b>CÓ KHÁCH HÀNG DỰ TOÁN THANG MÁY MỚI!</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> {EscapeHtml(estimate.CustomerName)}
📞 <b>Số điện thoại:</b> <a href=""tel:{cleanPhone}"">{cleanPhone}</a> (Bấm để gọi ngay)
📧 <b>Email:</b> {email}
📍 <b>Địa chỉ / Công trình:</b> {address}

🏗️ <b>THÔNG SỐ KỸ THUẬT:</b>
• <b>Loại công trình:</b> {building}
• <b>Số tầng / Điểm dừng:</b> {estimate.Stops} tầng
• <b>Tải trọng:</b> {estimate.CapacityKg} kg (~{Math.Round(estimate.CapacityKg / 75.0)} người)
• <b>Dòng thang:</b> {elevator}
• <b>Động cơ:</b> {motor}
• <b>Kiểu cửa:</b> {door}

💰 <b>DỰ TOÁN TRỌN GÓI:</b>
👉 <b>{estimate.EstimatedPriceMin:N0} - {estimate.EstimatedPriceMax:N0} VNĐ</b>

🎨 <b>GHI CHÚ / NỘI THẤT CABIN:</b>
<i>{notes}</i>

⏰ <b>Thời gian:</b> {vnTime:dd/MM/yyyy HH:mm:ss} (Giờ VN)
━━━━━━━━━━━━━━━━━━━
🌐 <i>Website Thang Máy Hà Hồng • <a href=""https://thangmayhahong.xyz/admin"">Xem trên Admin</a></i>";

            await PostToTelegramAsync(botToken, chatId, messageText, cancellationToken);
            _logger.LogInformation("Telegram notification sent successfully for estimate #{EstimateId}.", estimate.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram notification for estimate #{EstimateId}.", estimate.Id);
        }
    }

    public async Task SendContactLeadNotificationAsync(ContactRequest contact, CancellationToken cancellationToken = default)
    {
        var (botToken, chatId, enabled) = GetTelegramConfig();

        if (!enabled)
        {
            _logger.LogInformation("Telegram notification is disabled by configuration.");
            return;
        }

        if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(chatId))
        {
            _logger.LogWarning("Telegram BotToken or ChatId is not configured. Skipping contact notification for #{ContactId}.", contact.Id);
            return;
        }

        try
        {
            var vnTime = ToVietnamTime(contact.CreatedAt);

            var cleanPhone = new string(contact.PhoneNumber.Where(char.IsDigit).ToArray());
            var email = string.IsNullOrWhiteSpace(contact.Email) ? "Chưa cung cấp" : EscapeHtml(contact.Email);
            var subject = string.IsNullOrWhiteSpace(contact.Subject) ? "Tư vấn & Khảo sát thang máy" : EscapeHtml(contact.Subject);
            var message = EscapeHtml(contact.Message);

            var messageText =
$@"📩 <b>CÓ YÊU CẦU LIÊN HỆ / TƯ VẤN MỚI!</b>
━━━━━━━━━━━━━━━━━━━
👤 <b>Họ và tên:</b> {EscapeHtml(contact.FullName)}
📞 <b>Số điện thoại:</b> <a href=""tel:{cleanPhone}"">{cleanPhone}</a> (Bấm để gọi ngay)
📧 <b>Email:</b> {email}
📋 <b>Chủ đề:</b> {subject}

💬 <b>NỘI DUNG LỜI NHẮN:</b>
<i>""{message}""</i>

⏰ <b>Thời gian:</b> {vnTime:dd/MM/yyyy HH:mm:ss} (Giờ VN)
━━━━━━━━━━━━━━━━━━━
🌐 <i>Website Thang Máy Hà Hồng • <a href=""https://thangmayhahong.xyz/admin"">Xem trên Admin</a></i>";

            await PostToTelegramAsync(botToken, chatId, messageText, cancellationToken);
            _logger.LogInformation("Telegram notification sent successfully for contact #{ContactId}.", contact.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram notification for contact #{ContactId}.", contact.Id);
        }
    }

    public async Task<(bool Success, string Message)> SendTestNotificationAsync(string? customMessage = null, CancellationToken cancellationToken = default)
    {
        var (botToken, chatId, enabled) = GetTelegramConfig();

        if (string.IsNullOrWhiteSpace(botToken))
        {
            return (false, "Chưa cấu hình Telegram BotToken (cần cung cấp TELEGRAM_BOT_TOKEN).");
        }

        if (string.IsNullOrWhiteSpace(chatId))
        {
            return (false, "Chưa cấu hình Telegram ChatId (cần cung cấp TELEGRAM_CHAT_ID).");
        }

        var text = customMessage ??
$@"🔔 <b>[KIỂM TRA KẾT NỐI TELEGRAM BOT HÀ HỒNG]</b>
━━━━━━━━━━━━━━━━━━━
✅ Kết nối giữa <b>Backend Thang Máy Hà Hồng</b> và Telegram thành công!
⏰ Thời gian: {DateTime.Now:dd/MM/yyyy HH:mm:ss}
Tất cả các yêu cầu dự toán và liên hệ mới sẽ tự động được thông báo tức thì vào nhóm này.";

        try
        {
            var success = await PostToTelegramAsync(botToken, chatId, text, cancellationToken);
            return success
                ? (true, "Đã gửi thông báo thử nghiệm thành công tới Telegram!")
                : (false, "Gửi tin nhắn tới Telegram thất bại. Vui lòng kiểm tra lại BotToken và ChatId.");
        }
        catch (Exception ex)
        {
            return (false, $"Lỗi kết nối Telegram: {ex.Message}");
        }
    }

    private async Task<bool> PostToTelegramAsync(string botToken, string chatId, string messageText, CancellationToken cancellationToken)
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
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogWarning("Telegram API returned non-success code {StatusCode}: {ErrorResponse}", response.StatusCode, err);
            return false;
        }

        return true;
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
