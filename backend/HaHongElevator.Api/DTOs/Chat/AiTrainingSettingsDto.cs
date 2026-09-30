namespace HaHongElevator.Api.DTOs.Chat;

public class AiKnowledgeItemDto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Question { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
}

public class AiTrainingSettingsDto
{
    public string SystemPrompt { get; set; } = string.Empty;
    public string CustomApiKey { get; set; } = string.Empty;
    public string DefaultGreeting { get; set; } = string.Empty;
    public List<AiKnowledgeItemDto> KnowledgeBase { get; set; } = [];
}
