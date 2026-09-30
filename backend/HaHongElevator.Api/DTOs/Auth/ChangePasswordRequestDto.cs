using System.ComponentModel.DataAnnotations;

namespace HaHongElevator.Api.DTOs.Auth;

public class ChangePasswordRequestDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(6, ErrorMessage = "Mật khẩu mới phải có tối thiểu 6 ký tự.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(NewPassword), ErrorMessage = "Xác nhận mật khẩu mới không khớp.")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
