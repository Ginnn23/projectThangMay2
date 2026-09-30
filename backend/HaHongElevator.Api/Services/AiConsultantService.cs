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
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiConsultantService> _logger;

    private static readonly Regex PhoneRegex = new(
        @"(?:(?:\+?84)|0)(?:3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-46-9])(?:\d[\s.-]?){7}\d",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private const string SystemPrompt = """
        Bạn là Chuyên gia Tư vấn Kỹ thuật Cao cấp của Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng (Hà Hồng Elevator).
        Thông tin công ty:
        - Hotline 24/7: 0909 9333 58
        - Email: hahongco@gmail.com
        - Website: thangmayhahong.xyz
        - Dịch vụ: Tư vấn, thiết kế bản vẽ, thi công lắp đặt trọn gói, bảo trì định kỳ và sửa chữa cứu hộ thang máy 24/7.
        - Các dòng sản phẩm: Thang máy gia đình (Homelift), thang máy biệt thự, thang máy kính quan sát khung thép, thang máy tải khách văn phòng/khách sạn, thang máy tải hàng xưởng sản xuất, cửa sập và thang cuốn thương mại.

        Quy tắc tư vấn:
        1. Giọng điệu thân thiện, lễ phép, chuyên nghiệp, bắt đầu bằng "Dạ, em chào anh/chị!" hoặc "Dạ, chào anh/chị ạ!".
        2. Tư vấn chính xác về kỹ thuật:
           - Thang máy gia đình Homelift: Tải trọng phổ biến 250kg - 450kg (chở 3-6 người), hố PIT nông chỉ 250 - 300mm (không đụng móng nhà), chiều cao tầng trên cùng (OH) chỉ cần 2800 - 3200mm, dùng được điện 1 pha 220V hoặc 3 pha 380V.
           - Kích thước hố thang tham khảo:
             + 300kg (3-4 người): kích thước thông thủy hố khoảng 1300mm x 1300mm, cabin 900mm x 900mm.
             + 450kg (6 người): kích thước thông thủy hố khoảng 1500mm x 1500mm, cabin 1100mm x 1000mm.
             + 630kg (8-9 người): kích thước thông thủy hố khoảng 1700mm x 1700mm.
           - Khoảng giá tham khảo:
             + Thang máy gia đình liên doanh: từ 280 - 450 triệu VNĐ (tùy số tầng, tải trọng, nội thất).
             + Thang máy nhập khẩu nguyên chiếc: từ 550 triệu - 1,2 tỷ VNĐ.
             + Gói cải tạo cabin inox champagne / gương: 80 - 180 triệu VNĐ.
           - An toàn: Luôn trang bị bộ cứu hộ tự động (ARD) đưa cabin về tầng gần nhất mở cửa khi mất điện, chống kẹt cửa Photocell, hệ thống thắng cơ chống rơi tự do.
        3. Khéo léo mời khách để lại Số điện thoại hoặc địa chỉ công trình để kỹ sư Hà Hồng liên hệ gửi bản vẽ thiết kế 2D/3D và báo giá chi tiết qua Zalo.
        4. Trả lời súc tích, rõ ràng, gạch đầu dòng các ý quan trọng để người đọc dễ theo dõi trên điện thoại.
        """;

    public AiConsultantService(HttpClient httpClient, IConfiguration configuration, ILogger<AiConsultantService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ConsultResponseDto> ConsultAsync(ConsultRequestDto request, ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var rawMessage = request.Message?.Trim() ?? string.Empty;
        var detectedPhone = ExtractPhoneNumber(rawMessage) ?? ExtractPhoneNumber(request.CustomerPhone ?? string.Empty);
        var leadSaved = false;

        // Tự động lưu số điện thoại khách hàng nếu phát hiện
        if (!string.IsNullOrWhiteSpace(detectedPhone))
        {
            leadSaved = await TrySaveLeadAsync(detectedPhone, rawMessage, request.CustomerName, dbContext, cancellationToken);
        }

        string reply;
        var apiKey = _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            try
            {
                reply = await CallGeminiAsync(rawMessage, request.History, apiKey, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API error, falling back to expert knowledge engine.");
                reply = GenerateExpertFallbackResponse(rawMessage, detectedPhone, leadSaved);
            }
        }
        else
        {
            reply = GenerateExpertFallbackResponse(rawMessage, detectedPhone, leadSaved);
        }

        var suggestions = GenerateSuggestions(rawMessage);

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

    private async Task<string> CallGeminiAsync(string userMessage, List<ChatMessageDto>? history, string apiKey, CancellationToken cancellationToken)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

        var contents = new List<object>();

        // Thêm system instruction thông qua prompt đầu tiên hoặc API structure
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
                parts = new[] { new { text = SystemPrompt } }
            },
            contents,
            generationConfig = new
            {
                temperature = 0.5,
                maxOutputTokens = 800,
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        var candidate = json.GetProperty("candidates")[0];
        var text = candidate.GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

        return text?.Trim() ?? "Dạ, em chào anh/chị! Hiện em đang ghi nhận câu hỏi, anh/chị có thể gọi ngay Hotline 0909 9333 58 để kỹ sư giải đáp trực tiếp ạ!";
    }

    private static string GenerateExpertFallbackResponse(string userMessage, string? detectedPhone, bool leadSaved)
    {
        var lower = userMessage.ToLowerInvariant();

        if (leadSaved && !string.IsNullOrWhiteSpace(detectedPhone))
        {
            return $"Dạ, Thang Máy Hà Hồng đã ghi nhận số điện thoại **{detectedPhone}** của anh/chị thành công! 📞\n\nKỹ sư bên em sẽ liên hệ lại qua điện thoại/Zalo để gửi bản vẽ thiết kế 2D/3D sơ bộ và bảng dự toán chi tiết nhất cho công trình của mình trong ít phút tới ạ!\n\nNếu cần trao đổi gấp, anh/chị có thể gọi trực tiếp Hotline 24/7: **0909 9333 58**.";
        }

        if (lower.Contains("giá") || lower.Contains("chi phí") || lower.Contains("bao nhiêu tiền") || lower.Contains("báo giá"))
        {
            return """
                Dạ, em chào anh/chị! Về chi phí thang máy tại Hà Hồng, mức giá phụ thuộc vào số tầng, tải trọng và dòng động cơ:

                • **Thang máy gia đình liên doanh (Homelift):** Khoảng từ **280 - 450 triệu VNĐ** (linh kiện chính như máy kéo, tủ điện nhập khẩu Ý/Đức/Nhật, cabin gia công inox cao cấp trong nước).
                • **Thang máy nhập khẩu nguyên chiếc:** Khoảng từ **550 triệu - 1,2 tỷ VNĐ** (châu Âu, Nhật Bản).
                • **Gói cải tạo, nâng cấp cabin:** Khoảng từ **80 - 180 triệu VNĐ**.

                👉 Anh/chị có thể để lại **Số điện thoại** hoặc số tầng dự kiến, kỹ sư bên em sẽ tính toán bảng dự toán chi tiết và gửi qua Zalo cho mình ngay ạ!
                """;
        }

        if (lower.Contains("kích thước") || lower.Contains("hố thang") || lower.Contains("diện tích") || lower.Contains("pit") || lower.Contains("oh") || lower.Contains("mặt bằng"))
        {
            return """
                Dạ, chào anh/chị! Kích thước hố thang phụ thuộc vào tải trọng và không gian nhà mình:

                • **Tải trọng 300kg - 350kg (chở 3-4 người):** Kích thước hố thông thủy chỉ cần từ **1300mm x 1300mm** (lọt lòng cabin khoảng 900 x 900mm).
                • **Tải trọng 450kg (chở 6 người):** Kích thước hố từ **1500mm x 1500mm** (cabin khoảng 1100 x 1000mm).
                • **Hố PIT:** Dòng Homelift của Hà Hồng chỉ cần âm sâu **250 - 300mm**, không ảnh hưởng đến đà kiềng hay bể phốt nhà phố.
                • **Chiều cao tầng trên cùng (OH):** Tối thiểu chỉ từ **2800 - 3200mm**.

                👉 Nhà mình đang là nhà xây mới hay nhà cải tạo, và diện tích dự kiến dành cho thang là bao nhiêu mét ạ?
                """;
        }

        if (lower.Contains("thang kính") || lower.Contains("kính") || lower.Contains("quan sát"))
        {
            return """
                Dạ, **Thang máy kính quan sát** (thang máy vách kính) hiện là xu hướng rất được ưa chuộng tại Hà Hồng cho biệt thự và nhà phố hiện đại:

                • **Ưu điểm:** Lấy sáng tự nhiên, không gian thông thoáng, nhìn xuyên thấu sang trọng và nâng tầm kiến trúc ngôi nhà.
                • **Kết cấu:** Khung thép định hình sơn tĩnh điện cao cấp kết hợp kính cường lực an toàn 10mm - 12mm.
                • **Chi phí:** Thường cao hơn thang tường gạch truyền thống khoảng 15% - 25% do phần kết cấu khung thép và kính cường lực.

                👉 Anh/chị có muốn tham khảo một số mẫu thang kính thực tế bên em vừa bàn giao không ạ?
                """;
        }

        if (lower.Contains("bảo trì") || lower.Contains("bảo dưỡng") || lower.Contains("sửa chữa") || lower.Contains("hư") || lower.Contains("kẹt"))
        {
            return """
                Dạ, dịch vụ **Bảo trì & Cứu hộ thang máy** của Hà Hồng cam kết:

                • **Tần suất bảo trì định kỳ:** 1 tháng/lần hoặc 2 tháng/lần theo tiêu chuẩn an toàn quốc gia.
                • **Quy trình kiểm tra:** Đầy đủ 24 hạng mục (thắng cơ, ray dẫn hướng, cáp tải, nút bấm, cảm biến cửa Photocell, hệ thống liên lạc cứu hộ Intercom).
                • **Hỗ trợ khẩn cấp 24/7:** Đội ngũ kỹ thuật viên có mặt kịp thời xử lý sự cố.

                👉 Anh/chị cần bảo trì thang máy đang sử dụng hay cần hỗ trợ kỹ thuật gấp, vui lòng liên hệ Hotline: **0909 9333 58** để được cử kỹ thuật viên đến ngay ạ!
                """;
        }

        if (lower.Contains("mấy người") || lower.Contains("tải trọng") || lower.Contains("450kg") || lower.Contains("350kg") || lower.Contains("630kg"))
        {
            return """
                Dạ, tải trọng thang máy được tính theo số lượng người sử dụng trung bình:

                • **250kg - 300kg:** Chở 2 - 3 người (rất nhỏ gọn cho nhà diện tích hẹp).
                • **350kg:** Chở 4 - 5 người (lựa chọn phổ biến nhất cho nhà phố 3 - 6 tầng).
                • **450kg:** Chở 6 người (rất thoải mái cho gia đình nhiều thế hệ hoặc kết hợp văn phòng nhỏ).
                • **630kg - 1000kg:** Chở 8 - 14 người (phù hợp văn phòng, khách sạn, căn hộ dịch vụ).

                👉 Công trình nhà mình có khoảng bao nhiêu thành viên sử dụng hằng ngày ạ?
                """;
        }

        return """
            Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của **Thang Máy Hà Hồng** 🏢

            Em có thể hỗ trợ anh/chị giải đáp nhanh về:
            1. **Tư vấn kích thước hố thang & tải trọng** (300kg - 1000kg) phù hợp mặt bằng nhà mình.
            2. **Báo giá dự toán thang máy gia đình, thang kính, thang văn phòng**.
            3. **Quy trình lắp đặt, bảo trì định kỳ và cứu hộ 24/7**.

            Anh/chị đang quan tâm đến hạng mục nào, hoặc có thể để lại **Số điện thoại** để kỹ sư bên em gửi bản vẽ và báo giá cụ thể cho mình nhé!
            """;
    }

    private static List<string> GenerateSuggestions(string userMessage)
    {
        var lower = userMessage.ToLowerInvariant();

        if (lower.Contains("giá") || lower.Contains("chi phí"))
        {
            return [
                "Kích thước hố thang 350kg cần bao nhiêu?",
                "Nên làm thang kính hay thang tường gạch?",
                "Quy trình khảo sát tại nhà thế nào?"
            ];
        }

        if (lower.Contains("kích thước") || lower.Contains("hố thang"))
        {
            return [
                "Chi phí thang gia đình 4 tầng khoảng bao nhiêu?",
                "Hố PIT nông 300mm có an toàn không?",
                "Tư vấn thang kính cho nhà cải tạo"
            ];
        }

        return [
            "Báo giá thang máy gia đình 4 tầng",
            "Tư vấn kích thước hố thang nhỏ nhất",
            "Chi phí bảo trì thang máy định kỳ"
        ];
    }
}
