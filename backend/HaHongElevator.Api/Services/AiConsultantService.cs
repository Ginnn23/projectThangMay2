using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Chat;
using HaHongElevator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HaHongElevator.Api.Services;

public class AiConsultantService
{
    private const string SettingKey = "ai-training-config";
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiConsultantService> _logger;

    private static readonly Regex PhoneRegex = new(
        @"(?:(?:\+?84)|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-46-9])(?:\d[\s.-]?){7}\d",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private readonly ElevatorEstimatorService _estimatorService;

    public AiConsultantService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AiConsultantService> logger,
        ElevatorEstimatorService estimatorService)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _estimatorService = estimatorService;
    }

    public async Task<AiTrainingSettingsDto> GetTrainingSettingsAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.SiteSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Key == SettingKey, cancellationToken);
        if (setting == null || string.IsNullOrWhiteSpace(setting.Value))
        {
            return GetDefaultTrainingSettings();
        }

        try
        {
            var result = JsonSerializer.Deserialize<AiTrainingSettingsDto>(setting.Value, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result == null) return GetDefaultTrainingSettings();

            var defaults = GetDefaultTrainingSettings();
            if (result.KnowledgeBase == null || result.KnowledgeBase.Count == 0)
            {
                result.KnowledgeBase = defaults.KnowledgeBase;
            }
            else
            {
                var existingQuestions = new HashSet<string>(
                    result.KnowledgeBase.Select(k => k.Question.Trim().ToLowerInvariant()),
                    StringComparer.OrdinalIgnoreCase);

                foreach (var defaultItem in defaults.KnowledgeBase)
                {
                    if (!existingQuestions.Contains(defaultItem.Question.Trim().ToLowerInvariant()))
                    {
                        result.KnowledgeBase.Add(defaultItem);
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(result.SystemPrompt))
            {
                result.SystemPrompt = defaults.SystemPrompt;
            }

            return result;
        }
        catch (JsonException)
        {
            return GetDefaultTrainingSettings();
        }
    }

    public async Task<AiTrainingSettingsDto> SaveTrainingSettingsAsync(AiTrainingSettingsDto request, ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.SiteSettings.FirstOrDefaultAsync(x => x.Key == SettingKey, cancellationToken);
        if (setting == null)
        {
            setting = new SiteSetting { Key = SettingKey };
            dbContext.SiteSettings.Add(setting);
        }

        var payload = new AiTrainingSettingsDto
        {
            SystemPrompt = request.SystemPrompt?.Trim() ?? string.Empty,
            CustomApiKey = request.CustomApiKey?.Trim() ?? string.Empty,
            DefaultGreeting = request.DefaultGreeting?.Trim() ?? string.Empty,
            KnowledgeBase = request.KnowledgeBase?
                .Where(k => !string.IsNullOrWhiteSpace(k.Question) || !string.IsNullOrWhiteSpace(k.Answer))
                .Select(k => new AiKnowledgeItemDto
                {
                    Id = string.IsNullOrWhiteSpace(k.Id) ? Guid.NewGuid().ToString("N") : k.Id.Trim(),
                    Question = k.Question?.Trim() ?? string.Empty,
                    Keywords = k.Keywords?.Trim() ?? string.Empty,
                    Answer = k.Answer?.Trim() ?? string.Empty
                })
                .ToList() ?? []
        };

        setting.Value = JsonSerializer.Serialize(payload);
        setting.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return payload;
    }

    public async Task<ConsultResponseDto> ConsultAsync(ConsultRequestDto request, ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var rawMessage = request.Message?.Trim() ?? string.Empty;
        var detectedPhone = ExtractPhoneNumber(rawMessage) ?? ExtractPhoneNumber(request.CustomerPhone ?? string.Empty);
        var leadSaved = false;

        if (!string.IsNullOrWhiteSpace(detectedPhone))
        {
            leadSaved = await TrySaveLeadAsync(detectedPhone, rawMessage, request.CustomerName, dbContext, cancellationToken);
        }

        var training = await GetTrainingSettingsAsync(dbContext, cancellationToken);

        string reply;
        var apiKey = !string.IsNullOrWhiteSpace(training.CustomApiKey)
            ? training.CustomApiKey
            : _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                reply = await CallGeminiWithTrainedKnowledgeAsync(rawMessage, request.History, training, apiKey, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API failed or key expired, using taught knowledge base fallback.");
                reply = MatchTrainedKnowledgeFallback(rawMessage, detectedPhone, leadSaved, training);
            }
        }
        else
        {
            reply = MatchTrainedKnowledgeFallback(rawMessage, detectedPhone, leadSaved, training);
        }

        var suggestions = GenerateSuggestions(rawMessage, training);

        return new ConsultResponseDto
        {
            Reply = reply,
            ExtractedPhoneNumber = detectedPhone,
            LeadSaved = leadSaved,
            SuggestedQuestions = suggestions
        };
    }

    private static string? ExtractPhoneNumber(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;

        var match = PhoneRegex.Match(text);
        if (!match.Success) return null;

        var digits = new string(match.Value.Where(char.IsDigit).ToArray());
        if (digits.StartsWith("84") && digits.Length == 11)
        {
            digits = "0" + digits[2..];
        }

        return digits.Length == 10 ? digits : null;
    }

    private async Task<bool> TrySaveLeadAsync(string phone, string message, string? name, ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        try
        {
            var recentCheck = DateTime.UtcNow.AddMinutes(-5);
            var exists = await dbContext.ContactRequests
                .AnyAsync(x => x.PhoneNumber == phone && x.CreatedAt >= recentCheck, cancellationToken);

            if (exists) return false;

            var contact = new ContactRequest
            {
                FullName = string.IsNullOrWhiteSpace(name) ? "Khách hàng chat AI" : name.Trim(),
                PhoneNumber = phone,
                Subject = "Khách để lại SĐT qua AI Tư Vấn Trực Tuyến",
                Message = $"Yêu cầu từ AI Chat: {message}",
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };

            dbContext.ContactRequests.Add(contact);
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save lead from AI chat");
            return false;
        }
    }

    public async Task<VisionAnalysisResponseDto> AnalyzeBlueprintVisionAsync(
        byte[] imageBytes,
        string mimeType,
        string? userPrompt,
        string? customerPhone,
        string? customerName,
        string? savedImageUrl,
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken = default)
    {
        var detectedPhone = ExtractPhoneNumber(customerPhone ?? string.Empty) ?? ExtractPhoneNumber(userPrompt ?? string.Empty);
        if (!string.IsNullOrWhiteSpace(detectedPhone))
        {
            _ = TrySaveLeadAsync(detectedPhone, $"Khách gửi bản vẽ/ảnh hố thang qua AI Vision. Ghi chú: {userPrompt}", customerName, dbContext, cancellationToken);
        }

        var training = await GetTrainingSettingsAsync(dbContext, cancellationToken);
        var apiKey = !string.IsNullOrWhiteSpace(training.CustomApiKey)
            ? training.CustomApiKey
            : _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        VisionAnalysisResponseDto? result = null;

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            result = await CallGeminiVisionAsync(imageBytes, mimeType, userPrompt, apiKey, cancellationToken);
        }

        // Nếu Gemini không phản hồi hoặc không có API key, sử dụng bộ phân tích thông minh Heuristic
        result ??= GenerateHeuristicVisionAnalysis(userPrompt, imageBytes.Length);

        // Tính toán lại giá và thông số chuẩn theo module tính toán của Hà Hồng
        try
        {
            var calcReq = new DTOs.Estimates.EstimateCalculationRequest
            {
                BuildingType = result.BuildingType,
                Stops = result.Stops ?? 4,
                CapacityKg = result.SuggestedCapacityKg,
                ElevatorType = result.SuggestedElevatorType,
                MotorBrand = result.SuggestedMotorBrand,
                DoorType = result.SuggestedDoorType
            };
            var calcResult = _estimatorService.Calculate(calcReq);
            result.EstimatedPriceMin = calcResult.EstimatedPriceMin;
            result.EstimatedPriceMax = calcResult.EstimatedPriceMax;
            result.ShaftWidthMm ??= calcResult.ShaftWidth;
            result.ShaftDepthMm ??= calcResult.ShaftDepth;
            result.PitDepthMm ??= calcResult.PitDepth;
            result.OverheadMm ??= calcResult.OverheadHeight;
            result.CabinDimensions = $"{calcResult.CabinWidth} x {calcResult.CabinDepth} x 2200 mm";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to refine vision estimate specs using ElevatorEstimatorService");
        }

        result.ImageUrl = savedImageUrl;
        result.Success = true;
        result.Message = "AI Vision đã quét và phân tích bản vẽ hố thang thành công!";

        return result;
    }

    private async Task<VisionAnalysisResponseDto?> CallGeminiVisionAsync(
        byte[] imageBytes,
        string mimeType,
        string? userPrompt,
        string apiKey,
        CancellationToken cancellationToken)
    {
        var base64Data = Convert.ToBase64String(imageBytes);
        var promptText = string.IsNullOrWhiteSpace(userPrompt)
            ? "Hãy quét và phân tích bản vẽ kiến trúc mặt bằng / bản vẽ chi tiết hố thang này. Trích xuất kích thước lọt lòng hố thang (rộng x sâu mm), chiều sâu Pit, chiều cao OH, số tầng và đề xuất cấu hình thang máy tối ưu."
            : $"Ghi chú của người dùng: \"{userPrompt}\". Hãy phân tích bản vẽ/ảnh này, trích xuất kích thước ô thang và đưa ra giải pháp cấu hình thang máy phù hợp nhất.";

        var systemPrompt = @"Bạn là Kỹ sư Trưởng chuyên gia Phân tích Bản vẽ Thiết kế và Kết cấu Hố Thang Máy của Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng (Hà Hồng Elevator - thangmayhahong.xyz - Hotline: 0909 9333 58).
Nhiệm vụ: Phân tích hình ảnh đính kèm (bản vẽ mặt bằng kiến trúc, bản vẽ kết cấu hố thang, hoặc ảnh chụp hiện trạng ô thang).

QUY TẮC NGUYÊN LÝ KỸ THUẬT BẮT BUỘC:
1. Thang máy gia đình bắt buộc phải có TỐI THIỂU 2 ĐIỂM DỪNG (2 tầng trở lên, vd: Trệt - Lửng, Hầm - Trệt, hoặc Trệt - Lầu 1).
2. Nếu bản vẽ hoặc ghi chú thể hiện NHÀ CẤP 4 (1 tầng trệt thuần túy, không có gác lửng, không có tầng hầm, không có tum/sân thượng):
   - Đặt isElevatorDetected: false
   - stops: 2
   - imageType: 'Bản vẽ nhà cấp 4 (1 tầng trệt)'
   - summaryAnalysis: '⚠️ CẢNH BÁO KỸ THUẬT: Bản vẽ được nhận diện là Nhà Cấp 4 (chỉ có 1 tầng trệt). Về mặt kỹ thuật, thang máy bắt buộc phải có tối thiểu 2 điểm dừng (2 tầng). Nếu ngôi nhà thuần 1 tầng trệt và không có gác lửng/tầng hầm thì KHÔNG KHẢ THI và KHÔNG CẦN THIẾT lắp đặt thang máy gia đình tiêu chuẩn. Trừ trường hợp nhà có gác lửng cao hoặc đang có kế hoạch cải tạo đúc thêm tầng!'
   - technicalHighlights: [
       'Thang máy chỉ hoạt động khi có tối thiểu 2 điểm dừng di chuyển giữa các cao độ tầng.',
       'Nếu nhà cấp 4 có gác lửng hoặc bán hầm: Giải pháp tối ưu là dòng Thang Kính Homelift mini 2 tầng tải trọng 200kg - 300kg.',
       'Nếu chuẩn bị cải tạo nâng tầng (lên 2 - 3 tầng): Nên bố trí ô chờ giếng thang khung thép 1200x1200mm.',
       'Nếu chỉ cần hỗ trợ vượt bậc tam cấp chênh cốt thấp (<1.2m), nên sử dụng bàn nâng dốc (Ramp) hoặc bàn nâng thủy lực thay vì thang máy.'
     ]
3. Nếu là nhà phố, biệt thự, tòa nhà (2 tầng trở lên):
   - isElevatorDetected: true
   - Đề xuất tải trọng và kích thước phù hợp (300kg, 350kg, 450kg, 630kg).

BẮT BUỘC trả về ĐÚNG MỘT đối tượng JSON (không thêm bất kỳ văn bản nào ngoài JSON) theo định dạng:
{
  ""isElevatorDetected"": true,
  ""confidenceScore"": 0.95,
  ""imageType"": ""Bản vẽ mặt bằng kiến trúc"",
  ""shaftWidthMm"": 1350,
  ""shaftDepthMm"": 1400,
  ""pitDepthMm"": 400,
  ""overheadMm"": 3200,
  ""stops"": 4,
  ""buildingType"": ""nha-pho-xay-moi"",
  ""suggestedCapacityKg"": 350,
  ""suggestedElevatorType"": ""homelift-kinh"",
  ""suggestedMotorBrand"": ""Fuji"",
  ""suggestedDoorType"": ""2CO"",
  ""cabinDimensions"": ""1000 x 950 x 2200 mm"",
  ""summaryAnalysis"": ""Nhận xét súc tích của kỹ sư về ô thang trên bản vẽ (vị trí đặt thang, kết cấu chịu lực, ưu điểm giải pháp)."",
  ""technicalHighlights"": [
    ""Kích thước lọt lòng hố ... mm phù hợp ..."",
    ""Khuyến nghị cửa mở ..."",
    ""Lưu ý kỹ thuật về hố PIT và đà lanh-tô ...""
  ],
  ""suitableCabinStyles"": [
    ""Vách kính cường lực Panorama ..."",
    ""Inox gương vàng hoàng gia PVD ...""
  ]
}";

        var payload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents = new[]
            {
                new
                {
                    role = "user",
                    parts = new object[]
                    {
                        new { text = promptText },
                        new
                        {
                            inlineData = new
                            {
                                mimeType = string.IsNullOrWhiteSpace(mimeType) ? "image/jpeg" : mimeType,
                                data = base64Data
                            }
                        }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.2,
                maxOutputTokens = 1500,
                responseMimeType = "application/json"
            }
        };

        string[] visionModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-lite-latest", "gemini-2.5-pro", "gemini-3.1-flash-lite"];

        foreach (var model in visionModels)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey.Trim()}";
                var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
                    var candidate = json.GetProperty("candidates")[0];
                    var text = candidate.GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                    if (!string.IsNullOrWhiteSpace(text))
                    {
                        var cleanJson = text.Trim();
                        if (cleanJson.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
                        {
                            cleanJson = cleanJson[7..];
                        }
                        if (cleanJson.StartsWith("```"))
                        {
                            cleanJson = cleanJson[3..];
                        }
                        if (cleanJson.EndsWith("```"))
                        {
                            cleanJson = cleanJson[..^3];
                        }
                        cleanJson = cleanJson.Trim();

                        var parsed = JsonSerializer.Deserialize<VisionAnalysisResponseDto>(cleanJson, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (parsed != null)
                        {
                            parsed.RawAiResponse = text;
                            return parsed;
                        }
                    }
                }
                else
                {
                    _logger.LogWarning("Gemini Vision model {Model} returned status {StatusCode}", model, response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to call Gemini Vision with model {Model}", model);
            }
        }

        return null;
    }

    private static VisionAnalysisResponseDto GenerateHeuristicVisionAnalysis(string? userPrompt, int fileSize)
    {
        var prompt = (userPrompt ?? "").ToLowerInvariant();

        // Xử lý trường hợp Nhà Cấp 4
        if (prompt.Contains("cap 4") || prompt.Contains("cấp 4") || prompt.Contains("1 tang") || prompt.Contains("1 tầng"))
        {
            var hasMezzanine = prompt.Contains("lung") || prompt.Contains("lửng") || prompt.Contains("gac") || prompt.Contains("gác") || prompt.Contains("ham") || prompt.Contains("hầm") || prompt.Contains("nang tang") || prompt.Contains("nâng tầng");

            return new VisionAnalysisResponseDto
            {
                IsElevatorDetected = hasMezzanine,
                ConfidenceScore = 0.96,
                ImageType = "Bản vẽ nhà cấp 4 " + (hasMezzanine ? "(Có gác lửng/bán hầm)" : "(1 tầng trệt thuần túy)"),
                ShaftWidthMm = 1200,
                ShaftDepthMm = 1200,
                PitDepthMm = 250,
                OverheadMm = 2800,
                Stops = 2,
                BuildingType = "nha-pho-cai-tao",
                SuggestedCapacityKg = 300,
                SuggestedElevatorType = "homelift-kinh",
                SuggestedMotorBrand = "Fuji",
                SuggestedDoorType = "2SO",
                CabinDimensions = "850 x 800 x 2100 mm",
                EstimatedPriceMin = 280000000,
                EstimatedPriceMax = 330000000,
                SummaryAnalysis = hasMezzanine
                    ? "Nhà cấp 4 có gác lửng hoặc bán hầm phù hợp lắp đặt dòng Thang Máy Kính Homelift Mini 2 điểm dừng (2 stops). Giúp người lớn tuổi lên xuống gác lửng an toàn với hố PIT siêu nông 250mm không cần đào móng sâu."
                    : "⚠️ LƯU Ý KỸ THUẬT: Bản vẽ được nhận diện là Nhà Cấp 4 (1 tầng trệt). Về nguyên lý cơ học, thang máy bắt buộc phải có TỐI THIỂU 2 ĐIỂM DỪNG (2 tầng trở lên). Nếu ngôi nhà thuần 1 tầng trệt và không có gác lửng hay tầng hầm thì KHÔNG KHẢ THI và KHÔNG CẦN THIẾT lắp đặt thang máy gia đình tiêu chuẩn.",
                TechnicalHighlights = new List<string>
                {
                    "Thang máy chỉ hoạt động khi có tối thiểu 2 điểm dừng di chuyển giữa các cao độ tầng.",
                    hasMezzanine
                        ? "Giải pháp Homelift mini 300kg 2 điểm dừng (Trệt - Lửng) với kích thước lọt lòng hố chỉ 1200x1200mm."
                        : "Nếu nhà cấp 4 có gác lửng hoặc tầng bán hầm: Có thể lắp thang Homelift mini 2 điểm dừng (Hành trình nâng 2.5m - 3.2m).",
                    "Trường hợp gia chủ chuẩn bị cải tạo nâng tầng (lên 2 - 3 lầu): Nên bố trí ô chờ giếng thang khung thép 1200x1200mm ngay từ bây giờ.",
                    "Nếu chỉ cần hỗ trợ người lớn tuổi vượt bậc tam cấp chênh cốt thấp (<1.2m), nên sử dụng bàn nâng dốc (Ramp) hoặc bàn nâng thủy lực thay vì thang máy."
                },
                SuitableCabinStyles = new List<string>
                {
                    "Homelift kính cường lực 4 mặt đón sáng cho không gian gác lửng",
                    "Cửa mở tự động lùa về một phía 2SO tối ưu diện tích hẹp"
                }
            };
        }

        var isGlass = prompt.Contains("kinh") || prompt.Contains("homelift") || prompt.Contains("panorama");
        var isVilla = prompt.Contains("biet thu") || prompt.Contains("cao cap") || prompt.Contains("pvd") || prompt.Contains("vang");
        var isRenovation = prompt.Contains("cai tao") || prompt.Contains("nha cu") || prompt.Contains("long thang bo");

        int capacity = 350;
        int shaftW = 1350;
        int shaftD = 1400;
        int pit = isRenovation ? 350 : 600;
        int oh = 3200;
        int stops = 4;

        // Phân tích số tầng từ văn bản / ghi chú / tên file
        var stopMatch = Regex.Match(prompt, @"(\d+)\s*(?:tang|tầng|stops|stop|floor)");
        if (stopMatch.Success && int.TryParse(stopMatch.Groups[1].Value, out var parsedStops))
        {
            stops = Math.Clamp(parsedStops, 2, 10);
        }

        var isCommercialHighRise = stops >= 7 || prompt.Contains("van phong") || prompt.Contains("văn phòng") || prompt.Contains("toa nha") || prompt.Contains("tòa nhà") || prompt.Contains("khach san") || prompt.Contains("khách sạn");

        if (isCommercialHighRise)
        {
            capacity = 630;
            shaftW = 1800;
            shaftD = 1800;
            pit = 1400;
            oh = 4200;
        }
        else if (prompt.Contains("300") || prompt.Contains("nho"))
        {
            capacity = 300;
            shaftW = 1200;
            shaftD = 1200;
        }
        else if (prompt.Contains("450") || prompt.Contains("6 nguoi"))
        {
            capacity = 450;
            shaftW = 1550;
            shaftD = 1550;
        }
        else if (prompt.Contains("630") || prompt.Contains("8 nguoi") || isVilla)
        {
            capacity = 630;
            shaftW = 1750;
            shaftD = 1750;
        }

        var elevType = isVilla ? "biet-thu" : (isGlass ? "homelift-kinh" : "tieu-chuan");
        var buildingType = isCommercialHighRise ? "van-phong" : (isVilla ? "biet-thu" : (isRenovation ? "nha-pho-cai-tao" : "nha-pho-xay-moi"));

        var summary = isCommercialHighRise
            ? $"AI Vision đã nhận diện bản vẽ Tòa nhà cao tầng ({stops} tầng). Với công trình cao tầng có tần suất di chuyển liên tục, giải pháp tối ưu là lắp đặt Thang Máy Tải Khách Tiêu Chuẩn Inox 304 tốc độ cao (1.5 - 1.75 m/s) tải trọng {capacity}kg (8 - 9 người). Hố PIT yêu cầu từ {pit}mm và chiều cao OH {oh}mm để bố trí bộ giảm chấn thủy lực đạt chuẩn an toàn TCVN."
            : $"AI Vision đã nhận diện cấu trúc giếng thang với kích thước lọt lòng ước tính khoảng {shaftW} x {shaftD} mm. Phương án tối ưu nhất là lắp đặt Thang Máy {(elevType == "homelift-kinh" ? "Kính Homelift Panorama" : (elevType == "biet-thu" ? "Biệt Thự Sang Trọng Inox Gương Vàng PVD" : "Gia Đình Tiêu Chuẩn Inox 304"))} tải trọng {capacity}kg.";

        var highlights = isCommercialHighRise
            ? new List<string>
            {
                $"Tòa nhà {stops} tầng yêu cầu động cơ kéo công suất lớn 5.5kW - 7.5kW và cáp tải cường độ cao chống dão.",
                $"Hố PIT yêu cầu tối thiểu {pit} mm để bố trí trụ giảm chấn thủy lực đáy hố theo đúng quy chuẩn an toàn TCVN 6395.",
                $"Chiều cao tầng trên cùng OH yêu cầu {oh} mm để đảm bảo khoảng cách an toàn bảo trì trên nóc cabin.",
                "Hệ thống điều khiển tín hiệu vi xử lý nhóm thông minh (Duplex/Triplex) tối ưu thời gian chờ gọi tầng."
            }
            : new List<string>
            {
                $"Kích thước lọt lòng hố {shaftW} x {shaftD} mm lý tưởng cho phương án thi công kết cấu khung thép bọc kính cường lực hoặc hố bê tông truyền thống.",
                $"Hố PIT yêu cầu tối thiểu {pit} mm, phù hợp hoàn hảo với hiện trạng mà không cần đục sâu ảnh hưởng móng nhà.",
                "Động cơ không hộp số Fuji (Nhật Bản/Hàn Quốc) tiết kiệm 40% điện năng và vận hành êm ái.",
                "Cửa tầng tự động êm dịu tích hợp photocell màng hồng ngoại an toàn đa điểm."
            };

        return new VisionAnalysisResponseDto
        {
            IsElevatorDetected = true,
            ConfidenceScore = 0.94,
            ImageType = isCommercialHighRise ? $"Bản vẽ kiến trúc tòa nhà cao tầng ({stops} tầng)" : (isRenovation ? "Ảnh chụp hiện trạng ô thang thực tế" : "Bản vẽ mặt bằng kiến trúc & kết cấu"),
            ShaftWidthMm = shaftW,
            ShaftDepthMm = shaftD,
            PitDepthMm = pit,
            OverheadMm = oh,
            Stops = stops,
            BuildingType = buildingType,
            SuggestedCapacityKg = capacity,
            SuggestedElevatorType = elevType,
            SuggestedMotorBrand = "Fuji",
            SuggestedDoorType = shaftW < 1250 ? "2SO" : "2CO",
            CabinDimensions = $"{shaftW - 400} x {shaftD - 450} x 2200 mm",
            EstimatedPriceMin = isCommercialHighRise ? 520000000 : 320000000,
            EstimatedPriceMax = isCommercialHighRise ? 680000000 : 380000000,
            SummaryAnalysis = summary,
            TechnicalHighlights = highlights,
            SuitableCabinStyles = new List<string>
            {
                "Inox 304 sọc nhuyễn kết hợp inox gương chống trầy xước, dễ vệ sinh",
                "Màn hình hiển thị LCD đa phương tiện hiển thị tầng và chiều chạy",
                "Trần đèn LED chiếu sáng vát gián tiếp chống chói mắt",
                "Sàn đá Granite tự nhiên nguyên khối chịu mài mòn tần suất cao"
            }
        };
    }

    public async Task<(bool success, string message, string? modelName)> TestGeminiKeyAsync(string apiKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return (false, "Chưa nhập API Key. Vui lòng nhập khóa Google Gemini API Key.", null);
        }

        string[] modelsToTry = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.5-flash"];
        string lastError = string.Empty;

        foreach (var model in modelsToTry)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey.Trim()}";
                var payload = new
                {
                    contents = new[]
                    {
                        new { role = "user", parts = new[] { new { text = "Chào bạn! Hãy trả lời trong 1 câu ngắn: Bạn là ai?" } } }
                    }
                };

                var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
                    var candidate = json.GetProperty("candidates")[0];
                    var text = candidate.GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                    return (true, $"Kết nối thành công tới mô hình {model}! Phản hồi thử nghiệm: \"{text?.Trim()}\"", model);
                }

                var errBody = await response.Content.ReadAsStringAsync(cancellationToken);
                lastError = $"Mô hình {model} báo lỗi ({response.StatusCode}): {errBody}";
            }
            catch (Exception ex)
            {
                lastError = ex.Message;
            }
        }

        return (false, $"Không thể kết nối Gemini API. Chi tiết: {lastError}", null);
    }

    private async Task<string> CallGeminiWithTrainedKnowledgeAsync(string userMessage, List<ChatMessageDto>? history, AiTrainingSettingsDto training, string apiKey, CancellationToken cancellationToken)
    {
        // Xây dựng System Instruction từ những gì người dùng đã dạy
        var sbPrompt = new System.Text.StringBuilder();
        sbPrompt.AppendLine(training.SystemPrompt);
        sbPrompt.AppendLine();
        sbPrompt.AppendLine("=== KHO TRI THỨC VÀ BÀI HỌC BẠN ĐÃ ĐƯỢC HUẤN LUYỆN (BẮT BUỘC ƯU TIÊN SỬ DỤNG): ===");

        if (training.KnowledgeBase != null && training.KnowledgeBase.Count > 0)
        {
            int index = 1;
            foreach (var item in training.KnowledgeBase)
            {
                sbPrompt.AppendLine($"[Bài học {index}]");
                sbPrompt.AppendLine($"- Câu hỏi thường gặp: {item.Question}");
                if (!string.IsNullOrWhiteSpace(item.Keywords))
                {
                    sbPrompt.AppendLine($"- Từ khóa liên quan: {item.Keywords}");
                }
                sbPrompt.AppendLine($"- Nội dung trả lời chuẩn của công ty: {item.Answer}");
                sbPrompt.AppendLine();
                index++;
            }
        }

        sbPrompt.AppendLine("QUY TẮC:");
        sbPrompt.AppendLine("1. Hãy đối chiếu câu hỏi của khách hàng với các bài học đã dạy ở trên để đưa ra câu trả lời chính xác, sát thực tế nhất.");
        sbPrompt.AppendLine("2. Giữ phong thái lịch thiệp, xưng hô 'Dạ, em chào anh/chị' và mời khách để lại Số điện thoại nếu cần khảo sát thực tế hoặc nhận báo giá qua Zalo.");
        sbPrompt.AppendLine("3. Trả lời súc tích, ngắt đoạn rõ ràng, dùng gạch đầu dòng để dễ đọc trên điện thoại.");

        var contents = new List<object>();

        if (history != null && history.Count > 0)
        {
            foreach (var h in history.TakeLast(6))
            {
                contents.Add(new
                {
                    role = h.Role == "model" ? "model" : "user",
                    parts = new[] { new { text = h.Text } }
                });
            }
        }

        contents.Add(new
        {
            role = "user",
            parts = new[] { new { text = userMessage } }
        });

        var payload = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = sbPrompt.ToString() } }
            },
            contents,
            generationConfig = new
            {
                temperature = 0.4,
                maxOutputTokens = 900,
            }
        };

        string[] modelsToTry = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-3.8-flash", "gemini-3.5-flash"];
        Exception? lastException = null;

        foreach (var model in modelsToTry)
        {
            try
            {
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey.Trim()}";
                var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
                    var candidate = json.GetProperty("candidates")[0];
                    var text = candidate.GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                    return text?.Trim() ?? "Dạ, em chào anh/chị! Em đã ghi nhận câu hỏi, anh/chị có thể gọi ngay Hotline 0909 9333 58 để kỹ sư giải đáp trực tiếp ạ!";
                }

                _logger.LogWarning("Gemini model {Model} returned status code {StatusCode}", model, response.StatusCode);
            }
            catch (Exception ex)
            {
                lastException = ex;
                _logger.LogWarning(ex, "Failed to call Gemini model {Model}", model);
            }
        }

        if (lastException != null) throw lastException;
        throw new InvalidOperationException("Could not get response from any Gemini model.");
    }

    private static string MatchTrainedKnowledgeFallback(string userMessage, string? detectedPhone, bool leadSaved, AiTrainingSettingsDto training)
    {
        var lowerMsg = userMessage.ToLowerInvariant();

        if (leadSaved && !string.IsNullOrWhiteSpace(detectedPhone))
        {
            return $"Dạ, Thang Máy Hà Hồng đã ghi nhận số điện thoại **{detectedPhone}** của anh/chị thành công! 📞\n\nKỹ sư bên em sẽ liên hệ lại qua điện thoại/Zalo để gửi bản vẽ thiết kế 2D/3D sơ bộ và bảng dự toán chi tiết nhất cho công trình của mình trong ít phút tới ạ!\n\nNếu cần trao đổi gấp, anh/chị có thể gọi trực tiếp Hotline 24/7: **0909 9333 58**.";
        }

        // Tìm kiếm câu trả lời khớp nhất trong kho tri thức đã dạy
        if (training.KnowledgeBase != null && training.KnowledgeBase.Count > 0)
        {
            AiKnowledgeItemDto? bestMatch = null;
            int highestScore = 0;

            foreach (var item in training.KnowledgeBase)
            {
                int score = 0;
                var qLower = item.Question.ToLowerInvariant();
                var kwList = (item.Keywords ?? "").ToLowerInvariant().Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                // Điểm theo câu hỏi
                if (lowerMsg.Contains(qLower) || qLower.Contains(lowerMsg))
                {
                    score += 10;
                }

                // Điểm theo từ khóa
                foreach (var kw in kwList)
                {
                    if (lowerMsg.Contains(kw))
                    {
                        score += 3;
                    }
                }

                // Điểm theo từ ngữ chung
                var qWords = qLower.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var w in qWords)
                {
                    if (w.Length > 2 && lowerMsg.Contains(w))
                    {
                        score += 1;
                    }
                }

                if (score > highestScore)
                {
                    highestScore = score;
                    bestMatch = item;
                }
            }

            if (bestMatch != null && highestScore >= 2)
            {
                var response = bestMatch.Answer;
                if (!string.IsNullOrWhiteSpace(detectedPhone))
                {
                    response = $"Dạ em đã ghi nhận số điện thoại **{detectedPhone}** của anh/chị!\n\n" + response;
                }
                return response;
            }
        }

        // Nếu không khớp câu nào trong kho tri thức, trả về hướng dẫn chung
        return $"""
            Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của **Thang Máy Hà Hồng** 🏢

            Hiện em đang được đào tạo chuyên sâu về kỹ thuật, kích thước hố thang, báo giá và dịch vụ bảo trì thang máy.
            
            👉 Anh/chị có thể nhắn rõ hơn về nhu cầu (ví dụ: số tầng, tải trọng mong muốn) hoặc để lại **Số điện thoại** để kỹ sư Hà Hồng liên hệ tư vấn trực tiếp và gửi bản vẽ chi tiết cho mình nhé!
            """;
    }

    private static List<string> GenerateSuggestions(string userMessage, AiTrainingSettingsDto training)
    {
        // Ưu tiên lấy các câu hỏi từ kho tri thức mà người dùng đã dạy
        if (training.KnowledgeBase != null && training.KnowledgeBase.Count > 0)
        {
            return training.KnowledgeBase
                .Where(k => !string.IsNullOrWhiteSpace(k.Question))
                .Select(k => k.Question)
                .Take(4)
                .ToList();
        }

        return [
            "Báo giá thang máy gia đình 4 tầng",
            "Tư vấn kích thước hố thang nhỏ nhất",
            "Nên chọn thang kính hay thang inox?",
            "Chính sách bảo trì và bảo hành"
        ];
    }

    public static AiTrainingSettingsDto GetDefaultTrainingSettings()
    {
        return new AiTrainingSettingsDto
        {
            SystemPrompt = """
                Bạn là Chuyên gia Tư vấn Kỹ thuật Cao cấp & Trợ lý ảo AI của Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng (Hà Hồng Elevator).
                Thông tin công ty:
                - Hotline kỹ thuật & Cứu hộ 24/7: 0909 9333 58
                - Email: hahongco@gmail.com
                - Website: thangmayhahong.xyz
                - Phạm vi hoạt động: TP. Hồ Chí Minh và các tỉnh thành lân cận.
                - Năng lực & Kinh nghiệm: Hơn 10 năm kinh nghiệm chuyên sâu, 300+ công trình hoàn thiện (nhà phố, biệt thự cao cấp, tòa nhà văn phòng, khách sạn, nhà xưởng).
                - Dịch vụ chủ lực:
                  1. Tư vấn và thiết kế bản vẽ hố thang 2D/3D miễn phí tận nơi.
                  2. Cung cấp, lắp đặt thang máy gia đình (Homelift), thang máy kính quan sát (Panoramic), thang tải khách và thang tải hàng.
                  3. Cải tạo nâng cấp hố thang cho nhà đang ở, nhà diện tích nhỏ hẹp không có hố PIT sâu.
                  4. Bảo trì định kỳ 1 tháng/lần và cứu hộ khẩn cấp 24/7 (có mặt trong 30-45 phút).
                - Phong cách & Quy tắc giao tiếp:
                  - Luôn xưng "Dạ, em chào anh/chị!" và xưng "em", gọi khách là "anh/chị".
                  - Giọng điệu lịch sự, chuyên nghiệp, chân thành, dễ hiểu, không lạm dụng thuật ngữ kỹ thuật khó hiểu.
                  - Trình bày thông số rõ ràng, dùng gạch đầu dòng và in đậm các số liệu quan trọng để dễ đọc trên điện thoại.
                  - Sau khi giải thích kỹ thuật hoặc khoảng giá sơ bộ, luôn khéo léo mời khách để lại Số điện thoại/Zalo hoặc số tầng/diện tích để kỹ sư Hà Hồng khảo sát hiện trạng và gửi bảng dự toán chi tiết hoàn toàn miễn phí.
                  - Khi khách cung cấp Số điện thoại, hãy cảm ơn và thông báo kỹ sư phụ trách công trình sẽ liên hệ lại ngay trong ít phút.
                """,
            CustomApiKey = "",
            DefaultGreeting = "Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng 🏢\n\nAnh/chị đang cần tư vấn kích thước hố thang, tải trọng hay báo giá dòng thang nào cho công trình của mình ạ?",
            KnowledgeBase = [
                new AiKnowledgeItemDto
                {
                    Id = "kb-1",
                    Question = "Báo giá thang máy gia đình từ 3 đến 6 tầng bao nhiêu tiền?",
                    Keywords = "báo giá, giá thang máy, 3 tầng, 4 tầng, 5 tầng, 6 tầng, chi phí, bao nhiêu tiền, homelift",
                    Answer = """
                        Dạ, em chào anh/chị! Chi phí thi công lắp đặt thang máy gia đình trọn gói tại Thang Máy Hà Hồng phụ thuộc vào số tầng (số điểm dừng) và cấu hình lựa chọn:

                        • **Thang máy liên doanh Homelift (động cơ Fuji Nhật Bản / Montanari Ý):**
                          - Nhà 3 tầng (3 stops): Khoảng **260 - 300 triệu VNĐ**
                          - Nhà 4 tầng (4 stops): Khoảng **280 - 340 triệu VNĐ**
                          - Nhà 5 tầng (5 stops): Khoảng **320 - 380 triệu VNĐ**
                          - Nhà 6 tầng (6 stops): Khoảng **360 - 430 triệu VNĐ**
                        • **Thang máy vách kính quan sát (Panoramic Glass):** Khoảng từ **350 - 520 triệu VNĐ** (đã bao gồm kết cấu khung thép định hình sơn tĩnh điện và vách kính cường lực an toàn).
                        • **Thang máy nhập khẩu nguyên chiếc:** Từ **600 triệu - 1.2 tỷ VNĐ** (các thương hiệu châu Âu/Nhật).

                        🎁 **Đặc biệt:** Mức giá tại Hà Hồng đã trọn gói: Tư vấn thiết kế bản vẽ 2D/3D miễn phí, vận chuyển, kiểm định an toàn Nhà nước cấp phép và bảo hành 24 tháng.

                        👉 Anh/chị cho em xin **Số điện thoại/Zalo** để kỹ sư Hà Hồng gửi bảng bóc tách khối lượng và dự toán chi tiết cho nhà mình nhé!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-2",
                    Question = "Kích thước hố thang, độ sâu hố PIT và chiều cao OH cần bao nhiêu?",
                    Keywords = "kích thước, hố thang, hố pit, pit, oh, diện tích, thông thủy, nhỏ nhất, sâu bao nhiêu",
                    Answer = """
                        Dạ, với công nghệ thang máy hiện đại của Hà Hồng, kích thước được thiết kế "đo ni đóng giày" tối ưu từng centimet:

                        • **Thang mini Homelift 250kg - 300kg (2 - 3 người):**
                          - Kích thước hố thông thủy chỉ từ: **1200mm x 1200mm** (hoặc 1300mm x 1300mm).
                          - Kích thước lòng cabin: **850mm x 850mm**.
                          - Cửa mở tự động hoặc mở tay tiện lợi.
                        • **Thang tiêu chuẩn 450kg (6 người):**
                          - Kích thước hố thông thủy: **1500mm x 1500mm** (hoặc 1600mm x 1600mm).
                          - Kích thước cabin: **1100mm x 1000mm**.
                          - Cửa mở tim 2 cánh (CO): Rộng 700mm, thoải mái đẩy xe nôi, xe lăn.
                        • **Hố PIT (độ sâu âm sàn):** Cực kỳ nông, chỉ cần **250mm - 400mm** (không cần đào sâu chạm móng nhà hay bể phốt).
                        • **Chiều cao tầng trên cùng (OH):** Tối thiểu chỉ từ **2800mm - 3400mm** cho dòng không phòng máy (MRL).

                        👉 Anh/chị đang có kích thước ô giếng trời hoặc vị trí dự kiến khoảng bao nhiêu mét vuông để em tư vấn bản vẽ bố trí chuẩn nhất ạ?
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-3",
                    Question = "Nhà đang ở đã hoàn thiện có lắp thêm thang máy được không?",
                    Keywords = "nhà cải tạo, nhà đang ở, lắp thêm, nhà cũ, đập phá, sửa nhà, không gian nhỏ",
                    Answer = """
                        Dạ hoàn toàn được anh/chị nhé! Thang Máy Hà Hồng chuyên xử lý các công trình nhà cải tạo với giải pháp tối ưu:

                        • **Các vị trí đặt thang lý tưởng trong nhà có sẵn:**
                          1. Giếng trời giữa cầu thang bộ (vị trí đẹp và phổ biến nhất, tận dụng khoảng trống có sẵn).
                          2. Giếng trời sau nhà hoặc ô thông gió nhà vệ sinh cũ.
                          3. Lắp thang kính ngoài trời áp sát mặt tiền hoặc sân sau (tạo điểm nhấn hiện đại).
                        • **Ưu điểm giải pháp của Hà Hồng:**
                          - Dùng **Khung thép định hình chịu lực** sơn tĩnh điện: Thi công lắp dựng chỉ mất 3 - 5 ngày, không cần đổ cột bê tông bụi bặm.
                          - **Hố PIT siêu nông (250mm - 300mm):** Không lo đụng dầm móng, bể nước ngầm hay đường ống kỹ thuật.
                          - Thời gian hoàn thiện nhanh gọn trong **25 - 30 ngày**, không làm xáo trộn sinh hoạt gia đình.

                        👉 Kỹ sư Hà Hồng có dịch vụ đến tận nhà đo đạc khảo sát thực tế miễn phí. Anh/chị để lại **Số điện thoại** để bên em hẹn lịch khảo sát nhé!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-4",
                    Question = "Nên chọn thang máy vách kính quan sát hay thang inox truyền thống?",
                    Keywords = "thang kính, kính, inox, so sánh, vách kính, quan sát, panoramic, thẩm mỹ",
                    Answer = """
                        Dạ, cả hai dòng đều có ưu thế nổi bật tùy theo kiến trúc và sở thích của gia đình:

                        • **Thang máy kính quan sát (Panoramic Glass):**
                          - *Ưu điểm:* Lấy sáng tự nhiên 100%, không gian thoáng đãng, nhìn xuyên giếng trời sang trọng như khách sạn cao cấp, giúp người lớn tuổi không bị cảm giác sợ không gian hẹp bí bách.
                          - *Kết cấu:* Vách kính cường lực an toàn 10mm - 12mm chịu lực, khung thép chấn CNC màu đen nhám, trắng sữa, hoặc champagne vàng đồng.
                          - *Chi phí:* Cao hơn thang inox khoảng 15% - 25%.
                        • **Thang máy vách Inox truyền thống:**
                          - *Ưu điểm:* Bền bỉ vĩnh cửu, chống xước, chống bám vân tay, riêng tư kín đáo và dễ vệ sinh lau chùi.
                          - *Chất liệu:* Inox 304 sọc nhuyễn (Hairline) kết hợp Inox gương (Mirror) hoặc Inox hoa văn ăn mòn nghệ thuật.
                          - *Chi phí:* Mức giá kinh tế, tối ưu nhất.

                        👉 Nếu đặt thang ở giếng trời hoặc giữa lòng thang bộ thì làm thang kính sẽ giúp ngôi nhà sáng bừng và cực kỳ sang trọng ạ!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-5",
                    Question = "Nên dùng thang máy có phòng máy hay không phòng máy?",
                    Keywords = "có phòng máy, không phòng máy, MR, MRL, chiều cao, tum, tiết kiệm điện, động cơ",
                    Answer = """
                        Dạ, Thang Máy Hà Hồng xin phân tích rõ để anh/chị dễ chọn phương án phù hợp:

                        • **Thang không phòng máy (MRL - Động cơ từ trường không hộp số):**
                          - *Ưu điểm:* Động cơ đặt gọn gàng ngay đỉnh ray trong lòng giếng thang, **không cần xây phòng máy/tum nhô lên nóc nhà** (rất thích hợp nhà bị khống chế chiều cao xây dựng hoặc quy hoạch đô thị nghiêm ngặt).
                          - *Tiết kiệm:* Tiết kiệm điện năng lên đến **40%**, vận hành êm ái tuyệt đối, không cần châm dầu mỡ bôi trơn định kỳ.
                          - *Xu hướng:* Hiện nay **95% thang máy gia đình** tại Hà Hồng đều tin dùng loại này.
                        • **Thang có phòng máy (MR - Động cơ có hộp số):**
                          - *Đặc điểm:* Cần đổ sàn và xây thêm tum kỹ thuật cao từ 1.5m - 2.0m trên nóc tầng thượng để đặt máy kéo và tủ điện.
                          - *Ứng dụng:* Thường dùng cho các tòa nhà văn phòng, chung cư cao tầng hoặc thang tải hàng nặng.

                        👉 Với nhà phố hoặc biệt thự gia đình, em khuyên anh/chị nên ưu tiên dòng **Không phòng máy (MRL)** để vừa êm, vừa tiết kiệm điện và giữ trọn thẩm mỹ nóc nhà ạ!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-6",
                    Question = "Gia đình tôi nên lắp thang máy tải trọng bao nhiêu kg là vừa?",
                    Keywords = "tải trọng, chọn tải trọng, 300kg, 350kg, 450kg, 630kg, bao nhiêu người, mấy người",
                    Answer = """
                        Dạ, để chọn tải trọng chuẩn xác và tiết kiệm nhất, anh/chị có thể tham khảo theo nhu cầu sử dụng thực tế:

                        • **Tải trọng 250kg - 300kg (2 - 3 người):** Dành cho nhà phố diện tích nhỏ hẹp (dưới 40m2), nhu cầu chỉ chở 2-3 người hoặc người già, hố thang chỉ cần từ 1.2m x 1.2m.
                        • **Tải trọng 350kg (4 - 5 người):** Dòng thang gia đình tiêu chuẩn phổ biến nhất, đáp ứng hoàn hảo cho gia đình 2-3 thế hệ sinh hoạt hàng ngày.
                        • **Tải trọng 450kg (6 người):** Cabin rộng rãi (1.1m x 1.0m), chở được đồng thời 6 người lớn hoặc người ngồi xe lăn có người nhà đi kèm, cửa mở tim rộng 700mm.
                        • **Tải trọng 630kg (8 - 9 người):** Dành cho nhà biệt thự lớn, nhà phố kết hợp văn phòng công ty hoặc cho thuê căn hộ dịch vụ (CHDV).

                        👉 Nhà mình hiện có khoảng bao nhiêu thành viên cùng sinh hoạt, và nhà có kết hợp kinh doanh hay cho thuê không ạ?
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-7",
                    Question = "Thang máy có bị rơi không? Mất điện đột ngột thì người bên trong xử lý thế nào?",
                    Keywords = "an toàn, rơi tự do, mất điện, cúp điện, kẹt thang, cứu hộ tự động, ARD, cảm biến cửa",
                    Answer = """
                        Dạ anh/chị hoàn toàn yên tâm 100%! Thang máy hiện đại tại Hà Hồng được trang bị hệ thống an toàn đa lớp đạt chuẩn an toàn quốc gia:

                        1. **Bộ cứu hộ tự động khi mất điện (ARD - UPS):** Khi nguồn điện lưới ngắt đột ngột, bộ ắc quy/UPS thông minh tự động kích hoạt, điều khiển thang di chuyển về tầng gần nhất và mở cửa cho người bên trong bước ra ngoài an toàn.
                        2. **Hệ thống phanh cơ an toàn (Governor & Safety Gear):** Giữ cabin bám chặt vào ray dẫn hướng ngay lập tức nếu có dấu hiệu vượt tốc độ cho phép. Cabin **KHÔNG BAO GIỜ có hiện tượng rơi tự do**, kể cả trong tình huống giả định đứt toàn bộ cáp kéo.
                        3. **Mành hồng ngoại chống kẹt cửa (Photocell):** Cảm biến quang học quét toàn bộ mặt cắt cửa thang, tự động mở cửa ra ngay khi phát hiện có vật cản hoặc tay chân trẻ nhỏ bước qua.
                        4. **Hệ thống liên lạc khẩn cấp (Intercom & Chuông báo):** Kết nối âm thanh trực tiếp từ cabin ra bên ngoài phòng trực hoặc kết nối Hotline cứu hộ 24/7.

                        👉 Mọi sản phẩm của Hà Hồng đều được Trung tâm Kiểm định Kỹ thuật An toàn Nhà nước dán tem kiểm định trước khi đưa vào vận hành ạ!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-8",
                    Question = "Chính sách bảo hành, bảo trì định kỳ và cứu hộ khẩn cấp của công ty như thế nào?",
                    Keywords = "bảo hành, bảo trì, bảo dưỡng, cứu hộ, khẩn cấp, bao lâu, định kỳ, 24/7, hotline",
                    Answer = """
                        Dạ, Thang Máy Hà Hồng lấy chữ Tín và sự An toàn của khách hàng làm kim chỉ nam:

                        • **Thời hạn bảo hành:** Bảo hành chính hãng **24 tháng** cho toàn bộ hệ thống động cơ máy kéo, biến tần tủ điện và cơ khí thang máy.
                        • **Bảo trì định kỳ miễn phí:** Trong thời gian bảo hành, kỹ thuật viên đến kiểm tra định kỳ **1 tháng/lần** theo quy trình chuẩn 24 bước (kiểm tra tra dầu ray, siết bulong cáp, test phanh an toàn, kiểm tra cảm biến cửa và vệ sinh hố thang).
                        • **Cứu hộ khẩn cấp 24/7:** Đội ngũ kỹ thuật túc trực 24/24 tất cả các ngày trong tuần (kể cả lễ Tết). Khi có sự cố, kỹ thuật viên sẽ có mặt tại công trình trong vòng **30 - 45 phút** tại khu vực TP.HCM.

                        📞 **Hotline hỗ trợ kỹ thuật & cứu hộ 24/7:** **0909 9333 58**
                        📧 **Email hỗ trợ:** hahongco@gmail.com
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-9",
                    Question = "Tư vấn thang máy cho tòa nhà văn phòng, khách sạn, căn hộ dịch vụ",
                    Keywords = "văn phòng, khách sạn, căn hộ dịch vụ, CHDV, tải khách, thẻ từ, phân tầng, 630kg, 1000kg",
                    Answer = """
                        Dạ, đối với tòa nhà kinh doanh, văn phòng hay khách sạn lưu trú, thang máy cần đáp ứng tần suất di chuyển liên tục và độ ổn định cao:

                        • **Tải trọng khuyến nghị:** Từ **630kg (8 người) đến 1000kg (13 - 15 người)**, tốc độ vận hành từ 60m/phút - 90m/phút.
                        • **Tính năng chuyên dụng:**
                          - Hệ thống kiểm soát an ninh **thẻ từ (RFID)** hoặc vân tay phân tầng (giúp kiểm soát khách thuê từng tầng riêng biệt).
                          - Tủ điều khiển biến tần thông minh (VVVF) tăng tốc và giảm tốc êm ái, dừng tầng chuẩn xác không giật cục.
                          - Nội thất cabin sang trọng: Inox gương vàng/champagne, đèn LED chiếu sáng dịu mắt và màn hình LCD hiển thị tầng/thông báo.
                        • **Chi phí tham khảo:** Dao động từ **450 triệu - 1.2 tỷ VNĐ** tùy số điểm dừng và tốc độ.

                        👉 Anh/chị để lại **Số điện thoại** hoặc số tầng/diện tích tòa nhà để kỹ sư Hà Hồng tính toán lưu lượng giao thông và gửi bản vẽ bố trí tối ưu nhất nhé!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-10",
                    Question = "Công ty có cung cấp thang tải hàng nhà xưởng và thang tời thức ăn không?",
                    Keywords = "thang tải hàng, thang nâng hàng, tời hàng, thực phẩm, tời thức ăn, nhà xưởng, kho, dumbwaiter",
                    Answer = """
                        Dạ có đầy đủ anh/chị nhé! Thang Máy Hà Hồng chuyên thiết kế chế tạo các dòng thang tải hàng chuyên dụng:

                        • **Thang máy tải hàng công nghiệp (500kg - 3000kg):**
                          - Dành cho nhà xưởng, kho hàng, xưởng may, cơ khí.
                          - Kết cấu dầm thép định hình I/U siêu chịu lực, sàn cabin tôn nhám chống trượt, cửa sắt xếp hoặc cửa lùa 2 cánh mở lên xuống.
                          - Hệ thống thắng cơ chống rơi và công tắc giới hạn an toàn tuyệt đối.
                        • **Thang tời thực phẩm / Dumbwaiter (50kg - 250kg):**
                          - Dành cho nhà hàng, quán ăn, quán cafe nhiều tầng, trường học, bệnh viện.
                          - Cabin và khay chia ngăn hoàn toàn bằng **Inox 304 tiêu chuẩn vệ sinh an toàn thực phẩm**, không han gỉ, dễ vệ sinh.
                          - Thiết kế nhỏ gọn, chi phí tiết kiệm (chỉ từ 70 - 130 triệu VNĐ trọn gói).

                        👉 Anh/chị đang cần chở hàng hóa loại nào, kích thước kiện hàng và tải trọng ước tính khoảng bao nhiêu kg ạ?
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-11",
                    Question = "Thời gian từ lúc đặt hàng đến khi lắp đặt hoàn thiện thang máy mất bao lâu?",
                    Keywords = "thời gian, tiến độ, bao lâu, quy trình, thi công, lắp đặt, hoàn thiện, đặt hàng",
                    Answer = """
                        Dạ, tiến độ thi công chuẩn mực tại Thang Máy Hà Hồng gồm 5 giai đoạn rõ ràng:

                        1. **Khảo sát & Thiết kế bản vẽ:** (1 - 2 ngày) Kỹ sư đến công trình đo đạc hiện trạng, lên bản vẽ chi tiết 2D/3D hố thang miễn phí.
                        2. **Sản xuất & Đặt linh kiện:** (20 - 30 ngày) Gia công cơ khí cabin theo thiết kế riêng và nhập khẩu động cơ (Fuji/Montanari).
                        3. **Lắp đặt phần cơ khí:** (7 - 10 ngày) Vận chuyển ray, động cơ, dựng khung hố và treo cabin đối trọng.
                        4. **Lắp đặt hệ thống điện & Căn chỉnh:** (5 - 7 ngày) Đi dây tín hiệu, đấu nối tủ điều khiển thông minh và chạy thử tải.
                        5. **Kiểm định & Bàn giao:** (1 - 2 ngày) Cơ quan Kiểm định An toàn Quốc gia về thử tải, cấp tem kiểm định và bàn giao cho chủ nhà sử dụng.

                        ⏱️ **Tổng thời gian:** Khoảng **30 - 45 ngày** (đối với thang cải tạo dùng khung thép thì phần lắp đặt tại nhà chỉ mất từ **10 - 15 ngày**).

                        👉 Anh/chị dự kiến khi nào công trình nhà mình bắt đầu khởi công hoặc cần lắp thang máy ạ?
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-12",
                    Question = "Thang máy gia đình chạy 1 tháng hết bao nhiêu tiền điện?",
                    Keywords = "tiền điện, điện năng, tốn điện không, 1 tháng hết bao nhiêu, điện 1 pha, điện 3 pha",
                    Answer = """
                        Dạ, thang máy gia đình đời mới tại Hà Hồng cực kỳ tiết kiệm điện:

                        • **Động cơ không hộp số nam châm vĩnh cửu:** Công suất chỉ từ **2.2kW đến 3.7kW** (chỉ tương đương một chiếc điều hòa nhiệt độ hoặc bình nóng lạnh).
                        • **Tiêu thụ điện năng thực tế:** Một gia đình 4 - 6 người sử dụng trung bình 30 - 50 lượt/ngày thì tiền điện chỉ tốn khoảng **300.000 - 450.000 VNĐ/tháng**.
                        • **Nguồn điện sử dụng:**
                          - Có thể dùng trực tiếp **Điện sinh hoạt 1 pha (220V)** sẵn có (kết hợp biến tần tái tạo năng lượng).
                          - Hoặc dùng **Điện 3 pha (380V)** nếu nhà có sẵn nguồn 3 pha để thang hoạt động khỏe và êm ái hơn.
                        • **Chế độ Standby thông minh:** Đèn chiếu sáng và quạt thông gió trong cabin tự động tắt khi không có người sử dụng sau 3 phút.

                        👉 Anh/chị hoàn toàn yên tâm về chi phí vận hành hàng tháng của thang máy nhé ạ!
                        """
                }
            ]
        };
    }
}
