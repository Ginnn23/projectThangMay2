using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Contacts;
using HaHongElevator.Api.Models;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "New",
        "Contacted",
        "Processed",
        "Cancelled"
    };

    private readonly ApplicationDbContext _dbContext;
    private readonly ITelegramBotService _telegramService;

    public ContactsController(
        ApplicationDbContext dbContext,
        ITelegramBotService telegramService)
    {
        _dbContext = dbContext;
        _telegramService = telegramService;
    }

    [HttpPost]
    [EnableRateLimiting("contact-submit")]
    public async Task<ActionResult<ContactRequestDto>> CreateContact(CreateContactRequestDto request, CancellationToken cancellationToken)
    {
        var fullName = request.FullName.Trim();
        var phoneNumber = NormalizePhoneNumber(request.PhoneNumber);
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        var subject = string.IsNullOrWhiteSpace(request.Subject) ? null : request.Subject.Trim();
        var message = request.Message.Trim();

        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(phoneNumber) || string.IsNullOrWhiteSpace(message))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin bắt buộc." });
        }

        var duplicateSince = DateTime.UtcNow.AddMinutes(-2);
        var recentContacts = await _dbContext.ContactRequests
            .AsNoTracking()
            .Where(x => x.CreatedAt >= duplicateSince)
            .Select(x => new { x.PhoneNumber, x.Email, x.Message })
            .ToListAsync(cancellationToken);

        var normalizedMessage = NormalizeText(message);
        var isDuplicate = recentContacts.Any(x =>
            NormalizePhoneNumber(x.PhoneNumber) == phoneNumber ||
            (!string.IsNullOrWhiteSpace(email) && string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase)) ||
            NormalizeText(x.Message) == normalizedMessage);

        if (isDuplicate)
        {
            return Ok(new { message = "Yêu cầu của bạn đã được ghi nhận. Hà Hồng sẽ liên hệ lại sớm." });
        }

        var contact = new ContactRequest
        {
            FullName = fullName,
            PhoneNumber = phoneNumber,
            Email = email,
            Subject = subject,
            Message = message,
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ContactRequests.Add(contact);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Tự động gửi thông báo Telegram trong nền cho đội ngũ kinh doanh
        _ = Task.Run(async () =>
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(8));
                await _telegramService.SendContactLeadNotificationAsync(contact, cts.Token);
            }
            catch
            {
                // logged inside telegram service
            }
        });

        return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, ToDto(contact));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactRequestDto>>> GetContacts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.ContactRequests.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && ValidStatuses.Contains(status))
        {
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            query = query.Where(x =>
                x.FullName.ToLower().Contains(keyword) ||
                x.PhoneNumber.ToLower().Contains(keyword) ||
                (x.Email != null && x.Email.ToLower().Contains(keyword)));
        }

        var contacts = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToDto(x))
            .ToListAsync(cancellationToken);

        return Ok(contacts);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContactRequestDto>> GetContact(int id, CancellationToken cancellationToken)
    {
        var contact = await _dbContext.ContactRequests.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        return contact == null ? NotFound() : Ok(ToDto(contact));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<ContactRequestDto>> UpdateStatus(int id, UpdateContactStatusDto request, CancellationToken cancellationToken)
    {
        if (!ValidStatuses.Contains(request.Status))
        {
            return BadRequest(new { message = "Invalid status." });
        }

        var contact = await _dbContext.ContactRequests.FindAsync([id], cancellationToken);
        if (contact == null)
        {
            return NotFound();
        }

        contact.Status = ValidStatuses.First(x => x.Equals(request.Status, StringComparison.OrdinalIgnoreCase));
        contact.ProcessedAt = contact.Status is "Processed" or "Cancelled" ? DateTime.UtcNow : null;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(contact));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContact(int id, CancellationToken cancellationToken)
    {
        var contact = await _dbContext.ContactRequests.FindAsync([id], cancellationToken);
        if (contact == null)
        {
            return NotFound();
        }

        _dbContext.ContactRequests.Remove(contact);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static string NormalizePhoneNumber(string value)
    {
        return new string(value.Trim().Where(character => char.IsDigit(character) || character == '+').ToArray());
    }

    private static string NormalizeText(string value)
    {
        return string.Join(' ', value.Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));
    }

    private static ContactRequestDto ToDto(ContactRequest contact) => new()
    {
        Id = contact.Id,
        FullName = contact.FullName,
        PhoneNumber = contact.PhoneNumber,
        Email = contact.Email,
        Subject = contact.Subject,
        Message = contact.Message,
        Status = contact.Status,
        CreatedAt = contact.CreatedAt,
        ProcessedAt = contact.ProcessedAt
    };
}
