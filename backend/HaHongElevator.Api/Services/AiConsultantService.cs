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

    public AiConsultantService(HttpClient httpClient, IConfiguration configuration, ILogger<AiConsultantService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
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

            return result ?? GetDefaultTrainingSettings();
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

    private async Task<string> CallGeminiWithTrainedKnowledgeAsync(string userMessage, List<ChatMessageDto>? history, AiTrainingSettingsDto training, string apiKey, CancellationToken cancellationToken)
    {
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

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

        var response = await _httpClient.PostAsJsonAsync(url, payload, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        var candidate = json.GetProperty("candidates")[0];
        var text = candidate.GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

        return text?.Trim() ?? "Dạ, em chào anh/chị! Em đã ghi nhận câu hỏi, anh/chị có thể gọi ngay Hotline 0909 9333 58 để kỹ sư giải đáp trực tiếp ạ!";
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
                Bạn là Chuyên gia Tư vấn Kỹ thuật Cao cấp của Công ty Cổ phần Thương mại Dịch vụ Thang máy Hà Hồng (Hà Hồng Elevator).
                Thông tin công ty:
                - Hotline 24/7: 0909 9333 58
                - Email: hahongco@gmail.com
                - Website: thangmayhahong.xyz
                - Dịch vụ: Tư vấn thiết kế bản vẽ 2D/3D, thi công lắp đặt trọn gói, nâng cấp cải tạo, bảo trì định kỳ và cứu hộ khẩn cấp 24/7.
                - Phong cách: Lịch sự, chuyên nghiệp, bắt đầu bằng 'Dạ, em chào anh/chị!'. Luôn hướng dẫn rõ ràng, trung thực về thông số kỹ thuật và khéo léo mời khách để lại Số điện thoại để gửi dự toán chi tiết.
                """,
            CustomApiKey = "",
            DefaultGreeting = "Dạ, em chào anh/chị! Em là trợ lý kỹ thuật của Thang Máy Hà Hồng 🏢\n\nAnh/chị đang cần tư vấn kích thước hố thang, tải trọng hay báo giá dòng thang nào cho công trình của mình ạ?",
            KnowledgeBase = [
                new AiKnowledgeItemDto
                {
                    Id = "kb-1",
                    Question = "Báo giá thang máy gia đình 4 tầng",
                    Keywords = "báo giá, giá, 4 tầng, chi phí, bao nhiêu tiền, homelift",
                    Answer = """
                        Dạ, em chào anh/chị! Về chi phí thang máy gia đình 4 tầng tại Hà Hồng:

                        • **Thang liên doanh (Homelift):** Khoảng từ **280 - 340 triệu VNĐ** (động cơ Fuji Nhật Bản hoặc Montanari Ý, tủ điện vi xử lý hiện đại, cabin inox gương kết hợp sọc nhuyễn).
                        • **Thang máy kính quan sát:** Khoảng từ **350 - 450 triệu VNĐ** (bao gồm kết cấu khung thép sơn tĩnh điện và kính cường lực an toàn).
                        • **Thang nhập khẩu nguyên chiếc:** Từ **550 triệu VNĐ trở lên** (tùy thương hiệu châu Âu hoặc Nhật Bản).

                        👉 Mức giá trên đã bao gồm lắp đặt, kiểm định an toàn và bảo hành. Anh/chị có thể để lại **Số điện thoại** để kỹ sư Hà Hồng gửi bảng dự toán chi tiết qua Zalo nhé!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-2",
                    Question = "Kích thước hố thang và độ sâu hố PIT",
                    Keywords = "kích thước, hố thang, hố pit, pit, oh, diện tích, nhỏ nhất",
                    Answer = """
                        Dạ, với dòng thang máy gia đình Homelift của Hà Hồng, kích thước được tối ưu cực kỳ nhỏ gọn:

                        • **Tải trọng 300kg (3 người):** Kích thước hố thông thủy chỉ cần **1300mm x 1300mm** (cabin lọt lòng 900mm x 900mm).
                        • **Tải trọng 450kg (6 người):** Kích thước hố khoảng **1500mm x 1500mm** (cabin 1100mm x 1000mm).
                        • **Hố PIT nông:** Chỉ cần âm sâu **250mm - 300mm**, hoàn toàn không đụng móng nhà hay bể phốt, rất lý tưởng cho nhà cải tạo.
                        • **Chiều cao tầng trên cùng (OH):** Tối thiểu chỉ từ **2800mm - 3200mm**.

                        👉 Anh/chị cho em hỏi diện tích dự kiến làm thang máy ở nhà mình là khoảng bao nhiêu mét vuông ạ?
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-3",
                    Question = "Nên chọn thang máy kính hay thang inox truyền thống?",
                    Keywords = "thang kính, kính, inox, so sánh, vách kính, quan sát",
                    Answer = """
                        Dạ, cả hai loại đều có ưu điểm riêng tùy theo kiến trúc ngôi nhà của mình:

                        • **Thang máy kính quan sát:** Lấy sáng tự nhiên, không gian thông thoáng không bị bí bách, nhìn thấy giếng trời rất sang trọng. Chi phí cao hơn khoảng 15% - 25% do có phần kết cấu khung thép chịu lực và vách kính cường lực.
                        • **Thang inox truyền thống:** Bền bỉ, chống trầy xước tốt, dễ vệ sinh, chi phí tối ưu và che kín hố thang nếu muốn sự riêng tư.

                        👉 Nếu vị trí đặt thang nằm ở giữa lòng cầu thang bộ hoặc giếng trời, làm thang kính sẽ giúp ngôi nhà sáng và thoáng hơn rất nhiều ạ!
                        """
                },
                new AiKnowledgeItemDto
                {
                    Id = "kb-4",
                    Question = "Chính sách bảo trì và cứu hộ khẩn cấp",
                    Keywords = "bảo trì, bảo hành, cứu hộ, sửa chữa, định kỳ, 24/7",
                    Answer = """
                        Dạ, Thang Máy Hà Hồng cam kết dịch vụ bảo trì tiêu chuẩn an toàn cao nhất:

                        • **Bảo hành chính hãng:** Từ 12 đến 24 tháng cho toàn bộ thiết bị và động cơ.
                        • **Bảo trì định kỳ:** 1 tháng/lần với đầy đủ 24 hạng mục kiểm tra (thắng cơ, ray, cáp tải, cảm biến chống kẹt cửa Photocell, bộ cứu hộ ARD).
                        • **Đội cứu hộ 24/7:** Kỹ thuật viên túc trực xử lý khẩn cấp mọi lúc, kể cả ngày nghỉ và lễ Tết.

                        👉 Hotline kỹ thuật khẩn cấp 24/7 của Hà Hồng: **0909 9333 58**.
                        """
                }
            ]
        };
    }
}
