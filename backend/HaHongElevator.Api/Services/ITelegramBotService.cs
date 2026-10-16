using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public interface ITelegramBotService
{
    /// <summary>
    /// Gửi thông báo tức thì khi có khách hàng tạo dự toán báo giá thang máy.
    /// </summary>
    Task SendEstimateLeadNotificationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi thông báo tức thì khi có khách hàng gửi form liên hệ hoặc yêu cầu khảo sát.
    /// </summary>
    Task SendContactLeadNotificationAsync(ContactRequest contact, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gửi tin nhắn kiểm tra kết nối Telegram Bot.
    /// </summary>
    Task<(bool Success, string Message)> SendTestNotificationAsync(string? customMessage = null, CancellationToken cancellationToken = default);
}
