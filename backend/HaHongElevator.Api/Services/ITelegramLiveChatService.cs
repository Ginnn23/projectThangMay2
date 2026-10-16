using HaHongElevator.Api.DTOs.LiveChat;

namespace HaHongElevator.Api.Services;

public interface ITelegramLiveChatService
{
    Task<LiveChatMessageDto> SendCustomerMessageAsync(SendLiveChatMessageRequest request, CancellationToken cancellationToken = default);
    Task<List<LiveChatMessageDto>> GetHistoryAsync(string sessionId, long? afterId = null, CancellationToken cancellationToken = default);
    Task UpdateCustomerInfoAsync(UpdateCustomerInfoDto dto, CancellationToken cancellationToken = default);
    Task<List<LiveChatSessionSummaryDto>> GetRecentSessionsAsync(int limit = 50, CancellationToken cancellationToken = default);
    Task<List<TelegramUpdateItem>?> FetchUpdatesAsync(long offset, CancellationToken cancellationToken = default);
    Task ProcessIncomingUpdateAsync(TelegramUpdateItem update, CancellationToken cancellationToken = default);
    Task EnsureTablesAsync(CancellationToken cancellationToken = default);
}

public class TelegramUpdateResponse
{
    public bool Ok { get; set; }
    public List<TelegramUpdateItem>? Result { get; set; }
}

public class TelegramUpdateItem
{
    public long UpdateId { get; set; }
    public TelegramMessageItem? Message { get; set; }
}

public class TelegramMessageItem
{
    public long MessageId { get; set; }
    public TelegramUserItem? From { get; set; }
    public TelegramChatItem? Chat { get; set; }
    public long Date { get; set; }
    public string? Text { get; set; }
    public TelegramMessageItem? ReplyToMessage { get; set; }
}

public class TelegramUserItem
{
    public long Id { get; set; }
    public bool IsBot { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Username { get; set; }
}

public class TelegramChatItem
{
    public long Id { get; set; }
    public string? Type { get; set; }
    public string? Title { get; set; }
}
