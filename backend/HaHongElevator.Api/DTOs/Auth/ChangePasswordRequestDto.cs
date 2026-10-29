using System.ComponentModel.DataAnnotations;

namespace HaHongElevator.Api.DTOs.Auth;

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [MinLength(3, ErrorMessage = "Mật khẩu mới phải có ít nhất 3 ký tự.")]
    public string NewPassword { get; set; } = string.Empty;
}
