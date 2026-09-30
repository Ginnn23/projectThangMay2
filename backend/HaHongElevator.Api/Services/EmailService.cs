using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using HaHongElevator.Api.DTOs.Estimates;
using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendEstimateQuotationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(estimate.Email))
        {
            _logger.LogInformation("Estimate #{Id} has no recipient email specified. Skipping email.", estimate.Id);
            return false;
        }

        var host = _config["Smtp:Host"] ?? "smtp.gmail.com";
        var portStr = _config["Smtp:Port"] ?? "587";
        var port = int.TryParse(portStr, out var p) ? p : 587;
        var enableSsl = bool.TryParse(_config["Smtp:EnableSsl"], out var ssl) ? ssl : true;
        var userName = _config["Smtp:UserName"] ?? _config["SMTP_USER"] ?? "hahongre@gmail.com";
        var password = (_config["Smtp:Password"] ?? _config["SMTP_PASSWORD"] ?? "").Replace(" ", "").Trim();
        var fromName = _config["Smtp:FromName"] ?? "Thang Máy Hà Hồng";
        var fromEmail = _config["Smtp:FromEmail"] ?? userName;

        if (string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning(
                "SMTP Password is not set. To send real emails via Gmail, configure 'Smtp:Password' or 'SMTP_PASSWORD' environment variable with a Gmail App Password. Báo giá cho khách {Name} ({Email}) đã được chuẩn bị thành công.",
                estimate.CustomerName,
                estimate.Email);
            return false;
        }

        try
        {
            using var client = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                Credentials = new NetworkCredential(userName, password),
                Timeout = 15000
            };

            var mail = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName, Encoding.UTF8),
                Subject = $"[Thang Máy Hà Hồng] Bảng Báo Giá & Thông Số Kỹ Thuật Thang Máy - Mã HH-{estimate.Id:D5}",
                Body = BuildQuotationEmailHtml(estimate),
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };

            mail.To.Add(new MailAddress(estimate.Email.Trim(), estimate.CustomerName, Encoding.UTF8));

            // Attach printable quotation document
            var attachmentHtml = BuildPrintableHtmlDocument(estimate);
            var attachmentBytes = Encoding.UTF8.GetBytes(attachmentHtml);
            var attachmentStream = new MemoryStream(attachmentBytes);
            var attachment = new Attachment(attachmentStream, $"Bang_Bao_Gia_Thang_May_Ha_Hong_HH-{estimate.Id:D5}.html", "text/html");
            mail.Attachments.Add(attachment);

            await client.SendMailAsync(mail, cancellationToken);
            _logger.LogInformation("Successfully sent quotation email to {Email} for Estimate #{Id}", estimate.Email, estimate.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send estimate quotation email to {Email} for Estimate #{Id}", estimate.Email, estimate.Id);
            return false;
        }
    }

    private static string FormatVnd(decimal val)
    {
        return val.ToString("N0", new CultureInfo("vi-VN")) + " VNĐ";
    }

    private static string BuildQuotationEmailHtml(ElevatorEstimate x)
    {
        var viCulture = new CultureInfo("vi-VN");
        var priceMin = FormatVnd(x.EstimatedPriceMin);
        var priceMax = FormatVnd(x.EstimatedPriceMax);

        var elevatorName = x.ElevatorType switch
        {
            "homelift-kinh" => "Thang máy kính Homelift Panorama quan sát cao cấp",
            "inox-guong-vang" => "Cabin Inox Gương Vàng Ăn Mòn Hoa Văn Luxury",
            _ => "Thang máy Inox 304 Tiêu chuẩn hiện đại"
        };

        var buildingName = x.BuildingType switch
        {
            "nha-pho-cai-tao" => "Nhà phố cải tạo (Tối ưu hố hẹp & Pit nông)",
            "biet-thu" => "Biệt thự cao cấp / Villa",
            "van-phong" => "Văn phòng / Tòa nhà kinh doanh",
            _ => "Nhà phố xây mới (Hố chuẩn)"
        };

        var breakdownItems = new List<CostBreakdownItem>();
        if (!string.IsNullOrWhiteSpace(x.BreakdownJson))
        {
            try
            {
                breakdownItems = JsonSerializer.Deserialize<List<CostBreakdownItem>>(x.BreakdownJson) ?? [];
            }
            catch
            {
                // ignore parsing fallback
            }
        }

        var breakdownRows = new StringBuilder();
        if (breakdownItems.Count > 0)
        {
            foreach (var item in breakdownItems)
            {
                breakdownRows.Append($@"
                    <tr>
                        <td style=""padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;"">{item.Category}</td>
                        <td style=""padding: 10px; border-bottom: 1px solid #e2e8f0; color: #475569;"">{item.Title}</td>
                        <td style=""padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0056b3; font-weight: 600;"">{FormatVnd(item.MinPrice)} - {FormatVnd(item.MaxPrice)}</td>
                    </tr>");
            }
        }

        return $@"<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Báo Giá Thang Máy Hà Hồng</title>
</head>
<body style=""margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #334155; line-height: 1.6;"">
    <div style=""max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;"">
        
        <!-- Header -->
        <div style=""background: linear-gradient(135deg, #091e3a 0%, #173866 50%, #0056b3 100%); padding: 30px; color: #ffffff; text-align: center;"">
            <h1 style=""margin: 0 0 8px; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;"">CÔNG TY TNHH THANG MÁY HÀ HỒNG</h1>
            <p style=""margin: 0; font-size: 14px; color: #cbd5e1;"">Chuyên Gia Thang Máy Gia Đình & Dịch Vụ Kỹ Thuật Uy Tín TPHCM</p>
            <div style=""margin-top: 15px; display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 20px; font-size: 13px;"">
                Hotline 24/7: <strong style=""color: #f7b731;"">0909 9333 58</strong> | Email: <strong>hahongre@gmail.com</strong>
            </div>
        </div>

        <div style=""padding: 30px;"">
            <!-- Greeting -->
            <p style=""font-size: 16px; margin-top: 0;"">Kính gửi Quý khách: <strong style=""color: #0056b3;"">{x.CustomerName}</strong>,</p>
            <p style=""font-size: 14px; color: #475569;"">
                Thang Máy Hà Hồng chân thành cảm ơn Quý khách đã tin tưởng sử dụng công cụ dự toán kỹ thuật trực tuyến. Dưới đây là bảng thông số thiết kế và dự toán chi phí trọn gói dành riêng cho công trình của Quý khách.
            </p>

            <!-- Customer & Project Info Box -->
            <div style=""background: #f8fafc; border-left: 4px solid #0056b3; border-radius: 6px; padding: 15px; margin: 20px 0;"">
                <table style=""width: 100%; font-size: 13px; border-collapse: collapse;"">
                    <tr>
                        <td style=""padding: 4px 0; width: 35%; color: #64748b;"">Mã số báo giá:</td>
                        <td style=""padding: 4px 0; font-weight: 700; color: #dc2626;"">HH-{x.Id:D5}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b;"">Số điện thoại liên hệ:</td>
                        <td style=""padding: 4px 0; font-weight: 600;"">{x.PhoneNumber}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b;"">Địa chỉ công trình:</td>
                        <td style=""padding: 4px 0; font-weight: 600;"">{(string.IsNullOrWhiteSpace(x.Address) ? "TP. Hồ Chí Minh & các tỉnh lân cận" : x.Address)}</td>
                    </tr>
                    <tr>
                        <td style=""padding: 4px 0; color: #64748b;"">Loại hình kiến trúc:</td>
                        <td style=""padding: 4px 0; font-weight: 600;"">{buildingName}</td>
                    </tr>
                </table>
            </div>

            <!-- Price Highlight Banner -->
            <div style=""background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;"">
                <div style=""font-size: 13px; text-transform: uppercase; color: #1e40af; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;"">Tổng Chi Phí Dự Toán Trọn Gói ({x.Stops} Tầng):</div>
                <div style=""font-size: 24px; font-weight: 800; color: #dc2626;"">{priceMin} - {priceMax}</div>
                <div style=""font-size: 12px; color: #1e3a8a; margin-top: 6px;"">(Đã bao gồm động cơ, tủ điều khiển vi xử lý, kiểm định an toàn & nhân công lắp đặt hoàn thiện)</div>
            </div>

            <!-- Technical Specifications Table -->
            <h3 style=""color: #0f172a; font-size: 16px; margin: 25px 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;"">I. THÔNG SỐ KỸ THUẬT ĐỀ XUẤT</h3>
            <table style=""width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;"">
                <tr style=""background: #f1f5f9;"">
                    <td style=""padding: 8px 10px; font-weight: 600; width: 45%; border: 1px solid #e2e8f0;"">Tải trọng định mức</td>
                    <td style=""padding: 8px 10px; font-weight: 700; color: #0056b3; border: 1px solid #e2e8f0;"">{x.CapacityKg} kg</td>
                </tr>
                <tr>
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Số tầng phục vụ</td>
                    <td style=""padding: 8px 10px; font-weight: 700; border: 1px solid #e2e8f0;"">{x.Stops} Tầng ({x.Stops} Điểm dừng)</td>
                </tr>
                <tr style=""background: #f1f5f9;"">
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Dòng thang máy</td>
                    <td style=""padding: 8px 10px; border: 1px solid #e2e8f0;"">{elevatorName}</td>
                </tr>
                <tr>
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Thương hiệu Động cơ / Tủ điện</td>
                    <td style=""padding: 8px 10px; font-weight: 700; color: #16a34a; border: 1px solid #e2e8f0;"">{x.MotorBrand} ({x.MotorPowerKw} kW)</td>
                </tr>
                <tr style=""background: #f1f5f9;"">
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Kích thước lọt lòng hố thang (Rộng x Sâu)</td>
                    <td style=""padding: 8px 10px; font-weight: 700; color: #0056b3; border: 1px solid #e2e8f0;"">{x.ShaftWidth} x {x.ShaftDepth} mm</td>
                </tr>
                <tr>
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Kích thước lọt lòng cabin (Rộng x Sâu x Cao)</td>
                    <td style=""padding: 8px 10px; border: 1px solid #e2e8f0;"">{x.CabinWidth} x {x.CabinDepth} x 2200 mm</td>
                </tr>
                <tr style=""background: #f1f5f9;"">
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Chiều sâu hố Pit / Chiều cao OH</td>
                    <td style=""padding: 8px 10px; border: 1px solid #e2e8f0;"">Pit: {x.PitDepth} mm | OH: {x.OverheadHeight} mm</td>
                </tr>
                <tr>
                    <td style=""padding: 8px 10px; font-weight: 600; border: 1px solid #e2e8f0;"">Yêu cầu nguồn điện</td>
                    <td style=""padding: 8px 10px; border: 1px solid #e2e8f0;"">{x.PowerSupply}</td>
                </tr>
            </table>

            <!-- Itemized Cost Breakdown -->
            <h3 style=""color: #0f172a; font-size: 16px; margin: 25px 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;"">II. BÓC TÁCH CHI PHÍ THI CÔNG</h3>
            <table style=""width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;"">
                <thead>
                    <tr style=""background: #0056b3; color: #ffffff;"">
                        <th style=""padding: 10px; text-align: left;"">Hạng mục</th>
                        <th style=""padding: 10px; text-align: left;"">Quy cách kỹ thuật</th>
                        <th style=""padding: 10px; text-align: right;"">Đơn giá dự kiến</th>
                    </tr>
                </thead>
                <tbody>
                    {breakdownRows}
                </tbody>
            </table>

            <!-- Warranty & Commitments -->
            <div style=""background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 25px;"">
                <h4 style=""margin: 0 0 8px; color: #166534; font-size: 14px;"">CAM KẾT CHẤT LƯỢNG TỪ THANG MÁY HÀ HỒNG:</h4>
                <ul style=""margin: 0; padding-left: 20px; font-size: 13px; color: #15803d;"">
                    <li>Bảo hành toàn diện <strong>24 tháng</strong> chính hãng đối với thiết bị động cơ và tủ điều khiển.</li>
                    <li>Tặng gói bảo trì định kỳ miễn phí <strong>12 tháng</strong> đầu tiên sau khi bàn giao.</li>
                    <li>Đội ngũ kỹ sư trực kỹ thuật 24/7, hỗ trợ mặt bằng công trình tại TPHCM trong vòng 30 phút.</li>
                </ul>
            </div>

            <!-- Call to action button -->
            <div style=""text-align: center; margin: 30px 0;"">
                <a href=""https://thangmayhahong.xyz/du-toan"" style=""display: inline-block; background: #0056b3; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; box-shadow: 0 3px 10px rgba(0,86,179,0.3);"">
                    Mở Bảng Dự Toán Trên Website
                </a>
            </div>

            <p style=""font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;"">
                Kỹ sư kỹ thuật của Thang Máy Hà Hồng sẽ liên hệ qua số điện thoại <strong>{x.PhoneNumber}</strong> trong vòng 15 phút để hỗ trợ khảo sát thực tế mặt bằng miễn phí.
            </p>
        </div>

        <!-- Footer -->
        <div style=""background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;"">
            <div>CÔNG TY TNHH THANG MÁY HÀ HỒNG - GPKD / MST: 0316353846</div>
            <div style=""margin-top: 4px;"">Địa chỉ: 18/1/6 Tổ 3, KP 6, P. Tân Thới Nhất, Quận 12, TP. Hồ Chí Minh</div>
            <div style=""margin-top: 4px;"">Hotline: 0909 9333 58 | Website: https://thangmayhahong.xyz</div>
        </div>
    </div>
</body>
</html>";
    }

    private static string BuildPrintableHtmlDocument(ElevatorEstimate x)
    {
        var priceMin = FormatVnd(x.EstimatedPriceMin);
        var priceMax = FormatVnd(x.EstimatedPriceMax);

        return $@"<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <title>Bảng Dự Toán Báo Giá Thang Máy Hà Hồng - HH-{x.Id:D5}</title>
    <style>
        body {{ font-family: Arial, sans-serif; color: #111; margin: 0; padding: 30px; line-height: 1.5; }}
        .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 20px; }}
        .company-title {{ font-size: 18px; color: #0056b3; font-weight: bold; margin: 0; text-transform: uppercase; }}
        .box {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }}
        th, td {{ border: 1px solid #d1d5db; padding: 8px 10px; }}
        th {{ background: #0056b3; color: #fff; text-align: left; }}
        .price-total {{ font-size: 18px; font-weight: bold; color: #dc2626; }}
        @media print {{ body {{ padding: 0; }} }}
    </style>
</head>
<body>
    <div class=""header"">
        <div>
            <div class=""company-title"">CÔNG TY TNHH THANG MÁY HÀ HỒNG</div>
            <small>Hotline: 0909 9333 58 | Email: hahongre@gmail.com | thangmayhahong.xyz</small>
        </div>
        <div style=""text-align: right;"">
            <strong style=""color: #dc2626; font-size: 16px;"">BẢNG DỰ TOÁN BÁO GIÁ</strong><br>
            <small>Mã: HH-{x.Id:D5}</small><br>
            <small>Ngày: {DateTime.UtcNow:dd/MM/yyyy}</small>
        </div>
    </div>

    <div class=""box"">
        <table>
            <tr>
                <td style=""width: 20%; border: none;""><strong>Kính gửi:</strong></td>
                <td style=""width: 30%; border: none;"">{x.CustomerName}</td>
                <td style=""width: 20%; border: none;""><strong>Số điện thoại:</strong></td>
                <td style=""width: 30%; border: none;"">{x.PhoneNumber}</td>
            </tr>
            <tr>
                <td style=""border: none;""><strong>Địa chỉ Gmail:</strong></td>
                <td style=""border: none;"">{x.Email}</td>
                <td style=""border: none;""><strong>Địa chỉ công trình:</strong></td>
                <td style=""border: none;"">{x.Address ?? "TP. Hồ Chí Minh"}</td>
            </tr>
        </table>
    </div>

    <h3>I. THÔNG SỐ KỸ THUẬT TIÊU CHUẨN</h3>
    <table>
        <tr><th>Hạng mục</th><th>Quy cách kỹ thuật</th></tr>
        <tr><td>Số tầng phục vụ</td><td><strong>{x.Stops} Tầng</strong></td></tr>
        <tr><td>Tải trọng định mức</td><td><strong>{x.CapacityKg} kg</strong></td></tr>
        <tr><td>Dòng thang máy</td><td>{x.ElevatorType}</td></tr>
        <tr><td>Động cơ máy kéo</td><td>{x.MotorBrand} ({x.MotorPowerKw} kW)</td></tr>
        <tr><td>Kích thước giếng thang (Rộng x Sâu)</td><td><strong>{x.ShaftWidth} x {x.ShaftDepth} mm</strong></td></tr>
        <tr><td>Kích thước cabin (Rộng x Sâu x Cao)</td><td>{x.CabinWidth} x {x.CabinDepth} x 2200 mm</td></tr>
        <tr><td>Độ sâu hố Pit / Chiều cao OH</td><td>Pit: {x.PitDepth} mm | OH: {x.OverheadHeight} mm</td></tr>
        <tr><td>Nguồn điện yêu cầu</td><td>{x.PowerSupply}</td></tr>
    </table>

    <h3>II. DỰ TOÁN TỔNG CHI PHÍ TRỌN GÓI</h3>
    <div class=""box"" style=""text-align: center;"">
        <div>KHOẢNG GIÁ DỰ TOÁN:</div>
        <div class=""price-total"">{priceMin} - {priceMax}</div>
        <small>(Bao gồm thiết bị chính hãng, lắp đặt kiểm định và bảo hành 24 tháng)</small>
    </div>

    <div style=""display: flex; justify-content: space-between; margin-top: 40px; text-align: center;"">
        <div style=""width: 45%;"">
            <strong>ĐẠI DIỆN KHÁCH HÀNG</strong><br><br><br><br>
            <em>(Ký, ghi rõ họ tên)</em>
        </div>
        <div style=""width: 45%;"">
            <strong>ĐẠI DIỆN THANG MÁY HÀ HỒNG</strong><br><br><br><br>
            <em>(Ký tên và đóng dấu)</em>
        </div>
    </div>
</body>
</html>";
    }
}
