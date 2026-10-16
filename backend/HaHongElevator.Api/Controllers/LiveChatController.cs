using HaHongElevator.Api.DTOs.LiveChat;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/livechat")]
public class LiveChatController : ControllerBase
{
    private readonly ITelegramLiveChatService _liveChatService;

    public LiveChatController(ITelegramLiveChatService liveChatService)
    {
        _liveChatService = liveChatService;
    }

    /// <summary>
    /// Khách hàng gửi tin nhắn từ khung live chat trên website.
    /// </summary>
    [HttpPost("send")]
    [EnableRateLimiting("public-read")]
    public async Task<ActionResult<LiveChatMessageDto>> SendMessage([FromBody] SendLiveChatMessageRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Nội dung tin nhắn không được để trống." });
        }

        var result = await _liveChatService.SendCustomerMessageAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Lấy lịch sử tin nhắn của một phiên chat (cho cả khách và admin).
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<LiveChatMessageDto>>> GetHistory(
        [FromQuery] string sessionId,
        [FromQuery] long? afterId = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return BadRequest(new { message = "Thiếu mã phiên sessionId." });
        }

        var history = await _liveChatService.GetHistoryAsync(sessionId, afterId, cancellationToken);
        return Ok(history);
    }

    /// <summary>
    /// Cập nhật thông tin khách hàng (Họ tên, SĐT) cho phiên chat.
    /// </summary>
    [HttpPost("customer-info")]
    public async Task<IActionResult> UpdateCustomerInfo([FromBody] UpdateCustomerInfoDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.SessionId))
        {
            return BadRequest(new { message = "Thiếu mã phiên sessionId." });
        }

        await _liveChatService.UpdateCustomerInfoAsync(dto, cancellationToken);
        return Ok(new { success = true });
    }

    /// <summary>
    /// Lấy danh sách các phiên chat gần nhất (Dành cho trang Admin Dashboard).
    /// </summary>
    [HttpGet("admin/sessions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<LiveChatSessionSummaryDto>>> GetSessions([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
    {
        var list = await _liveChatService.GetRecentSessionsAsync(limit, cancellationToken);
        return Ok(list);
    }
}
