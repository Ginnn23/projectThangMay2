using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Auth;
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
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Phiên làm việc không hợp lệ, vui lòng đăng nhập lại." });
        }

        var user = await _dbContext.AdminUsers.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản quản trị." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công! Hãy lưu lại mật khẩu mới để đăng nhập." });
    }
}
