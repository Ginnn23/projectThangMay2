namespace HaHongElevator.Api.DTOs.Chat;

public class ConsultResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public string? ExtractedPhoneNumber { get; set; }
    public bool LeadSaved { get; set; }
    public List<string> SuggestedQuestions { get; set; } = [];
}
