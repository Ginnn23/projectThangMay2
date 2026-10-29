using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Auth;
using HaHongElevator.Api.Models;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(ApplicationDbContext dbContext, JwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        request.Username = request.Username.Trim();

        var user = await _dbContext.AdminUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Username == request.Username && x.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không chính xác." });
        }

        var (token, expiresAt) = _jwtTokenService.GenerateToken(user);

        return Ok(new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new AdminUserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role
            }
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var currentPwd = request.CurrentPassword?.Trim() ?? string.Empty;
        var newPwd = request.NewPassword?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(currentPwd) || string.IsNullOrWhiteSpace(newPwd))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." });
        }

        if (newPwd.Length < 3)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có tối thiểu 3 ký tự." });
        }

        var username = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name);
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

        AdminUser? user = null;
        if (int.TryParse(userIdClaim, out var userId))
        {
            user = await _dbContext.AdminUsers.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        }

        if (user == null && !string.IsNullOrWhiteSpace(username))
        {
            user = await _dbContext.AdminUsers.FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
        }

        if (user == null)
        {
            return Unauthorized(new { message = "Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại." });
        }

        // Kiểm tra khớp mật khẩu hiện tại (chấp nhận cả trim, hash hiện tại, hoặc mật khẩu khởi tạo 123)
        var isCurrentMatch = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash)
                          || BCrypt.Net.BCrypt.Verify(currentPwd, user.PasswordHash)
                          || (currentPwd == "123");

        if (!isCurrentMatch)
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không chính xác. Mật khẩu ban đầu của hệ thống là 123." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPwd);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật an toàn." });
    }

    /// <summary>
    /// Khôi phục mật khẩu tài khoản admin về mặc định: 123
    /// </summary>
    [HttpPost("reset-default-password")]
    public async Task<IActionResult> ResetDefaultPassword()
    {
        var admin = await _dbContext.AdminUsers.FirstOrDefaultAsync(u => u.Username == "admin");
        if (admin == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản admin." });
        }

        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123");
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Đã khôi phục mật khẩu tài khoản admin về mặc định: 123" });
    }
}
