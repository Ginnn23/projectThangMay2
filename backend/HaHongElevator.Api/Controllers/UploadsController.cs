using HaHongElevator.Api.DTOs.Uploads;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize(Roles = "Admin")]
public class UploadsController : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public UploadsController(IWebHostEnvironment environment, IConfiguration configuration)
    {
        _environment = environment;
        _configuration = configuration;
    }

    [HttpPost("image")]
    [EnableRateLimiting("upload")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<object>> UploadImage([FromForm] UploadImageRequestDto request, CancellationToken cancellationToken)
    {
        var file = request.File;

        if (file == null)
        {
            return BadRequest(new { message = "File is required." });
        }

        if (file.Length == 0)
        {
            return BadRequest(new { message = "File is required." });
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(new { message = "File size must be less than 5 MB." });
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Only jpg, jpeg, png and webp files are allowed." });
        }

        if (string.IsNullOrWhiteSpace(file.ContentType) || !AllowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Invalid image content type." });
        }

        var uploadsPath = _configuration["Uploads:Path"];
        if (string.IsNullOrWhiteSpace(uploadsPath))
        {
            uploadsPath = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads");
        }
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var filePath = Path.Combine(uploadsPath, fileName);

        try
        {
            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream, cancellationToken);
        }
        catch
        {
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            throw;
        }

        var imageUrl = $"/uploads/{fileName}";
        return Ok(new { imageUrl });
    }
}
