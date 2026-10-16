namespace HaHongElevator.Api.DTOs.LiveChat;

public class SendLiveChatMessageRequest
{
    public string SessionId { get; set; } = string.Empty;
    public string? SenderName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? PageUrl { get; set; }
}

public class LiveChatMessageDto
{
    public long Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public string Sender { get; set; } = string.Empty; // "customer" or "agent"
    public string SenderName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

public class UpdateCustomerInfoDto
{
    public string SessionId { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
}

public class LiveChatSessionSummaryDto
{
    public string SessionId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastActiveAt { get; set; }
    public int UnreadCount { get; set; }
}
