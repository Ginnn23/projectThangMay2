using System.Text.Json;
using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Estimates;
using HaHongElevator.Api.Models;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/estimates")]
public class EstimatesController : ControllerBase
{
    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "New",
        "Contacted",
        "SurveyScheduled",
        "DealClosed",
        "Cancelled"
    };

    private readonly ApplicationDbContext _dbContext;
    private readonly ElevatorEstimatorService _estimatorService;
    private readonly IEmailService _emailService;

    public EstimatesController(
        ApplicationDbContext dbContext,
        ElevatorEstimatorService estimatorService,
        IEmailService emailService)
    {
        _dbContext = dbContext;
        _estimatorService = estimatorService;
        _emailService = emailService;
    }

    /// <summary>
    /// Calculate technical specifications and estimated cost breakdown in real-time.
    /// </summary>
    [HttpPost("calculate")]
    public ActionResult<EstimateCalculationResult> CalculateEstimate([FromBody] EstimateCalculationRequest request)
    {
        var result = _estimatorService.Calculate(request);
        return Ok(result);
    }

    /// <summary>
    /// Save customer estimate and create lead.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("contact-submit")]
    public async Task<ActionResult<EstimateResponse>> CreateEstimate([FromBody] CreateEstimateRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var customerName = request.CustomerName.Trim();
        var phoneNumber = request.PhoneNumber.Trim();

        // Calculate official specs & prices
        var calcReq = new EstimateCalculationRequest
        {
            BuildingType = request.BuildingType,
            Stops = request.Stops,
            CapacityKg = request.CapacityKg,
            ElevatorType = request.ElevatorType,
            MotorBrand = request.MotorBrand,
            DoorType = request.DoorType
        };
        var calcResult = _estimatorService.Calculate(calcReq);

        var estimate = new ElevatorEstimate
        {
            CustomerName = customerName,
            PhoneNumber = phoneNumber,
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
            Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim(),
            BuildingType = request.BuildingType,
            Stops = request.Stops,
            CapacityKg = request.CapacityKg,
            ElevatorType = request.ElevatorType,
            MotorBrand = request.MotorBrand,
            DoorType = request.DoorType,
            SpeedMps = calcResult.SpeedMps,
            EstimatedPriceMin = calcResult.EstimatedPriceMin,
            EstimatedPriceMax = calcResult.EstimatedPriceMax,
            ShaftWidth = calcResult.ShaftWidth,
            ShaftDepth = calcResult.ShaftDepth,
            CabinWidth = calcResult.CabinWidth,
            CabinDepth = calcResult.CabinDepth,
            PitDepth = calcResult.PitDepth,
            OverheadHeight = calcResult.OverheadHeight,
            MotorPowerKw = calcResult.MotorPowerKw,
            PowerSupply = calcResult.PowerSupply,
            BreakdownJson = JsonSerializer.Serialize(calcResult.BreakdownItems),
            Status = "New",
            AdminNotes = request.CustomerNotes
        };

        _dbContext.ElevatorEstimates.Add(estimate);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Tự động gửi email bảng báo giá kèm tài liệu kỹ thuật về Gmail của khách hàng
        if (!string.IsNullOrWhiteSpace(estimate.Email))
        {
            try
            {
                await _emailService.SendEstimateQuotationAsync(estimate, cancellationToken);
            }
            catch
            {
                // logged inside email service
            }
        }

        return CreatedAtAction(nameof(GetEstimateById), new { id = estimate.Id }, MapToResponse(estimate));
    }

    /// <summary>
    /// Get an estimate by ID (used for PDF generation or customer preview).
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EstimateResponse>> GetEstimateById(int id, CancellationToken cancellationToken)
    {
        var estimate = await _dbContext.ElevatorEstimates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy bản dự toán." });
        }

        return Ok(MapToResponse(estimate));
    }

    /// <summary>
    /// Admin: List all estimates with optional status filtering and search.
    /// </summary>
    [HttpGet("admin")]
    [HttpGet("/api/admin/estimates")]
    [HttpGet("/api/estimates/admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<EstimateResponse>>> GetAdminEstimates(
        [FromQuery] string? status,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.ElevatorEstimates.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.CustomerName.ToLower().Contains(term) ||
                x.PhoneNumber.Contains(term) ||
                (x.Email != null && x.Email.ToLower().Contains(term)));
        }

        var estimates = await query
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        return Ok(estimates.Select(MapToResponse).ToList());
    }

    /// <summary>
    /// Admin: Update estimate processing status and notes.
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [HttpPatch("admin/{id:int}/status")]
    [HttpPatch("/api/admin/estimates/{id:int}/status")]
    [HttpPatch("/api/estimates/{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EstimateResponse>> UpdateEstimateStatus(
        int id,
        [FromBody] UpdateEstimateStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!ValidStatuses.Contains(request.Status))
        {
            return BadRequest(new { message = "Trạng thái không hợp lệ." });
        }

        var estimate = await _dbContext.ElevatorEstimates.FindAsync([id], cancellationToken);
        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy bản dự toán." });
        }

        estimate.Status = request.Status;
        if (request.AdminNotes != null)
        {
            estimate.AdminNotes = request.AdminNotes;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(estimate));
    }

    /// <summary>
    /// Admin: Delete estimate.
    /// </summary>
    [HttpDelete("{id:int}")]
    [HttpDelete("admin/{id:int}")]
    [HttpDelete("/api/admin/estimates/{id:int}")]
    [HttpDelete("/api/estimates/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEstimate(int id, CancellationToken cancellationToken)
    {
        var estimate = await _dbContext.ElevatorEstimates.FindAsync([id], cancellationToken);
        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy bản dự toán." });
        }

        _dbContext.ElevatorEstimates.Remove(estimate);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Admin: Resend quotation email to customer's Gmail
    /// </summary>
    [HttpPost("admin/{id:int}/resend-email")]
    [HttpPost("{id:int}/resend-email")]
    [HttpPost("/api/admin/estimates/{id:int}/resend-email")]
    [HttpPost("/api/estimates/{id:int}/resend-email")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResendQuotationEmail(int id, CancellationToken cancellationToken)
    {
        var estimate = await _dbContext.ElevatorEstimates.FindAsync([id], cancellationToken);
        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy bản dự toán." });
        }

        if (string.IsNullOrWhiteSpace(estimate.Email))
        {
            return BadRequest(new { message = "Khách hàng này chưa cung cấp địa chỉ Gmail." });
        }

        var result = await _emailService.SendEstimateQuotationAsync(estimate, cancellationToken);
        if (!result.Success)
        {
            return StatusCode(500, new { message = $"Chưa thể gửi email: {result.ErrorMessage}" });
        }

        return Ok(new { message = $"Đã gửi thành công bảng báo giá kèm file PDF tới {estimate.Email}" });
    }

    /// <summary>
    /// Download quotation as official PDF.
    /// </summary>
    [HttpGet("{id:int}/pdf")]
    [HttpGet("admin/{id:int}/pdf")]
    [HttpGet("/api/admin/estimates/{id:int}/pdf")]
    [HttpGet("/api/estimates/{id:int}/pdf")]
    public async Task<IActionResult> DownloadEstimatePdf(int id, CancellationToken cancellationToken)
    {
        var estimate = await _dbContext.ElevatorEstimates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy bản dự toán." });
        }

        try
        {
            var pdfBytes = _emailService.GenerateQuotationPdf(estimate);
            return File(pdfBytes, "application/pdf", $"Bang_Bao_Gia_Thang_May_Ha_Hong_HH-{estimate.Id:D5}.pdf");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Không thể xuất file PDF lúc này: {ex.Message}" });
        }
    }

    private static EstimateResponse MapToResponse(ElevatorEstimate x) => new()
    {
        Id = x.Id,
        CustomerName = x.CustomerName,
        PhoneNumber = x.PhoneNumber,
        Email = x.Email,
        Address = x.Address,
        BuildingType = x.BuildingType,
        Stops = x.Stops,
        CapacityKg = x.CapacityKg,
        ElevatorType = x.ElevatorType,
        MotorBrand = x.MotorBrand,
        DoorType = x.DoorType,
        SpeedMps = x.SpeedMps,
        EstimatedPriceMin = x.EstimatedPriceMin,
        EstimatedPriceMax = x.EstimatedPriceMax,
        ShaftWidth = x.ShaftWidth,
        ShaftDepth = x.ShaftDepth,
        CabinWidth = x.CabinWidth,
        CabinDepth = x.CabinDepth,
        PitDepth = x.PitDepth,
        OverheadHeight = x.OverheadHeight,
        MotorPowerKw = x.MotorPowerKw,
        PowerSupply = x.PowerSupply,
        BreakdownJson = x.BreakdownJson,
        Status = x.Status,
        AdminNotes = x.AdminNotes,
        CreatedAt = x.CreatedAt,
        UpdatedAt = x.UpdatedAt
    };
}
