using System.ComponentModel.DataAnnotations;

namespace HaHongElevator.Api.DTOs.Chat;

public class ChatMessageDto
{
    public string Role { get; set; } = "user"; // "user" or "model"
    public string Text { get; set; } = string.Empty;
}

public class ConsultRequestDto
{
    [Required]
    public string Message { get; set; } = string.Empty;

    public List<ChatMessageDto>? History { get; set; }

    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
}
