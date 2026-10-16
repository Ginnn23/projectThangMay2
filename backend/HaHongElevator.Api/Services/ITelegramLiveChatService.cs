using System.Text.Json.Serialization;
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
    [JsonPropertyName("ok")]
    public bool Ok { get; set; }

    [JsonPropertyName("result")]
    public List<TelegramUpdateItem>? Result { get; set; }
}

public class TelegramUpdateItem
{
    [JsonPropertyName("update_id")]
    public long UpdateId { get; set; }

    [JsonPropertyName("message")]
    public TelegramMessageItem? Message { get; set; }
}

public class TelegramMessageItem
{
    [JsonPropertyName("message_id")]
    public long MessageId { get; set; }

    [JsonPropertyName("from")]
    public TelegramUserItem? From { get; set; }

    [JsonPropertyName("chat")]
    public TelegramChatItem? Chat { get; set; }

    [JsonPropertyName("date")]
    public long Date { get; set; }

    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("reply_to_message")]
    public TelegramMessageItem? ReplyToMessage { get; set; }
}

public class TelegramUserItem
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("is_bot")]
    public bool IsBot { get; set; }

    [JsonPropertyName("first_name")]
    public string? FirstName { get; set; }

    [JsonPropertyName("last_name")]
    public string? LastName { get; set; }

    [JsonPropertyName("username")]
    public string? Username { get; set; }
}

public class TelegramChatItem
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("title")]
    public string? Title { get; set; }
}

