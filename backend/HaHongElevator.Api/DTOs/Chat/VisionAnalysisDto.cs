namespace HaHongElevator.Api.DTOs.Chat;

public class VisionAnalysisResponseDto
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string ImageType { get; set; } = "Bản vẽ kiến trúc mặt bằng";
    public bool IsElevatorDetected { get; set; } = true;
    public double ConfidenceScore { get; set; } = 0.95;

    // Kích thước hố thang nhận diện được (mm)
    public int? ShaftWidthMm { get; set; }
    public int? ShaftDepthMm { get; set; }
    public int? PitDepthMm { get; set; }
    public int? OverheadMm { get; set; }
    public int? Stops { get; set; }

    // Cấu hình thang máy đề xuất (khớp với công cụ dự toán)
    public string BuildingType { get; set; } = "nha-pho-xay-moi";
    public int SuggestedCapacityKg { get; set; } = 350;
    public string SuggestedElevatorType { get; set; } = "homelift-kinh";
    public string SuggestedMotorBrand { get; set; } = "Fuji";
    public string SuggestedDoorType { get; set; } = "2CO";

    public string CabinDimensions { get; set; } = "1000 x 950 x 2200 mm";
    public decimal EstimatedPriceMin { get; set; } = 320000000;
    public decimal EstimatedPriceMax { get; set; } = 380000000;

    // Nhận xét chuyên môn của kỹ sư AI
    public string SummaryAnalysis { get; set; } = string.Empty;
    public List<string> TechnicalHighlights { get; set; } = new();
    public List<string> SuitableCabinStyles { get; set; } = new();
    public string? RawAiResponse { get; set; }
}

public class VisionAnalysisRequestDto
{
    public string? UserPrompt { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerName { get; set; }
    public string? ImageBase64 { get; set; }
    public string? MimeType { get; set; }
}
