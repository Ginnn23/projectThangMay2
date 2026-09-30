using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Chat;
using HaHongElevator.Api.Services;
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

        var response = await _aiConsultantService.ConsultAsync(request, _dbContext, cancellationToken);
        return Ok(response);
    }
}
