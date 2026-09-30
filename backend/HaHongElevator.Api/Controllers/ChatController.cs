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

    public ChatController(AiConsultantService aiConsultantService, ApplicationDbContext dbContext)
    {
        _aiConsultantService = aiConsultantService;
        _dbContext = dbContext;
    }

    [HttpPost("consult")]
    [EnableRateLimiting("public-read")]
    public async Task<ActionResult<ConsultResponseDto>> Consult([FromBody] ConsultRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Tin nhắn không được để trống." });
        }

        var clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
            ?? HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        var response = await _aiConsultantService.ConsultAsync(request, clientIp, _dbContext, cancellationToken);
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
}

public class TestGeminiRequest
{
    public string ApiKey { get; set; } = string.Empty;
}
