using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Chat;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AiConsultantService _aiConsultantService;
    private readonly ApplicationDbContext _dbContext;
    private readonly ITelegramBotService _telegramService;

    public ChatController(
        AiConsultantService aiConsultantService,
        ApplicationDbContext dbContext,
        ITelegramBotService telegramService)
    {
        _aiConsultantService = aiConsultantService;
        _dbContext = dbContext;
        _telegramService = telegramService;
    }

    [HttpPost("consult")]
    [EnableRateLimiting("public-read")]
    public async Task<ActionResult<ConsultResponseDto>> Consult([FromBody] ConsultRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Tin nhắn không được để trống." });
        }

        var response = await _aiConsultantService.ConsultAsync(request, _dbContext, cancellationToken);

        // Bắn thông báo lên Telegram cho Admin biết khách đang hỏi trên web
        _ = Task.Run(async () =>
        {
            try
            {
                var question = EscapeHtml(request.Message.Trim());
                var previewReply = EscapeHtml(response.Reply.Length > 200 ? response.Reply[..200] + "..." : response.Reply);

                var telegramText =
$@"💬 <b>KHÁCH ĐANG HỎI TRỢ LÝ AI TRÊN WEBSITE:</b>
━━━━━━━━━━━━━━━━━━━
💭 <b>Câu hỏi của khách:</b>
<i>""{question}""</i>

🤖 <b>Trợ lý AI đã trả lời:</b>
<i>""{previewReply}""</i>
━━━━━━━━━━━━━━━━━━━
🌐 <i>Website Thang Máy Hà Hồng • Trợ lý AI trực tuyến</i>";

                await _telegramService.SendTestNotificationAsync(telegramText);
            }
            catch
            {
                // fail-safe background notification
            }
        });

        return Ok(response);
    }

    [HttpGet("init")]
    [EnableRateLimiting("public-read")]
    public async Task<ActionResult> GetInitialState(CancellationToken cancellationToken)
    {
        var training = await _aiConsultantService.GetTrainingSettingsAsync(_dbContext, cancellationToken);
        var suggestions = training.KnowledgeBase?
            .Where(k => !string.IsNullOrWhiteSpace(k.Question))
            .Select(k => k.Question)
            .Take(4)
            .ToList() ?? [];

        return Ok(new
        {
            greeting = string.IsNullOrWhiteSpace(training.DefaultGreeting)
                ? "Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng 🏢\n\nAnh/chị đang cần tư vấn kích thước hố thang, tải trọng hay báo giá dòng thang nào cho công trình của mình ạ?"
                : training.DefaultGreeting,
            suggestions = suggestions.Count > 0 ? suggestions : new List<string>
            {
                "Báo giá thang máy gia đình 4 tầng",
                "Tư vấn kích thước hố thang nhỏ nhất",
                "Nên chọn thang kính hay thang inox?",
                "Chính sách bảo trì và bảo hành"
            }
        });
    }

    [HttpGet("admin/training")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AiTrainingSettingsDto>> GetTrainingSettings(CancellationToken cancellationToken)
    {
        var settings = await _aiConsultantService.GetTrainingSettingsAsync(_dbContext, cancellationToken);
        return Ok(settings);
    }

    [HttpPut("admin/training")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AiTrainingSettingsDto>> UpdateTrainingSettings([FromBody] AiTrainingSettingsDto request, CancellationToken cancellationToken)
    {
        var updated = await _aiConsultantService.SaveTrainingSettingsAsync(request, _dbContext, cancellationToken);
        return Ok(updated);
    }

    [HttpPost("admin/test-gemini")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> TestGemini([FromBody] TestGeminiRequest request, CancellationToken cancellationToken)
    {
        var (success, message, modelName) = await _aiConsultantService.TestGeminiKeyAsync(request.ApiKey, cancellationToken);
        return Ok(new { success, message, modelName });
    }

    private static string EscapeHtml(string? input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;
        return input
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;");
    }
}

public class TestGeminiRequest
{
    public string ApiKey { get; set; } = string.Empty;
}
