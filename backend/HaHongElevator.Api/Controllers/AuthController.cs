using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Auth;
using HaHongElevator.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [Authorize(Roles = "Admin")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username))
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập lại." });
        }

        var user = await _dbContext.AdminUsers.FirstOrDefaultAsync(x => x.Username == username && x.IsActive);
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản quản trị." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return BadRequest(new { message = "Mật khẩu mới không được trùng với mật khẩu hiện tại." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công. Hãy ghi nhớ mật khẩu mới của bạn." });
    }
}
