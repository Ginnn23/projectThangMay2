using System.Globalization;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using HaHongElevator.Api.DTOs.Estimates;
using HaHongElevator.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HaHongElevator.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    static EmailService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<EmailSendResult> SendEstimateQuotationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(estimate.Email))
        {
            _logger.LogInformation("Estimate #{Id} has no recipient email specified. Skipping email.", estimate.Id);
            return new EmailSendResult(false, "Khách hàng không cung cấp địa chỉ email.");
        }

        var host = _config["Smtp:Host"] ?? "smtp.gmail.com";
        var portStr = _config["Smtp:Port"] ?? "587";
        var port = int.TryParse(portStr, out var p) ? p : 587;
        var enableSsl = bool.TryParse(_config["Smtp:EnableSsl"], out var ssl) ? ssl : true;
        var userName = _config["Smtp:UserName"] ?? _config["SMTP_USER"] ?? "phamkhackhaipham@gmail.com";
        var password = (_config["Smtp:Password"] ?? _config["SMTP_PASSWORD"] ?? "jgiewvybqplzlcye").Replace(" ", "").Trim();
        var fromName = _config["Smtp:FromName"] ?? "Thang Máy Hà Hồng";
        var fromEmail = _config["Smtp:FromEmail"] ?? userName;

        if (string.IsNullOrWhiteSpace(password))
        {
            var msg = "Chưa cấu hình mật khẩu ứng dụng Gmail (Smtp:Password).";
            _logger.LogWarning("{Message} Báo giá #{Id} ({Email}) chưa được gửi.", msg, estimate.Id, estimate.Email);
            return new EmailSendResult(false, msg);
        }

        try
        {
            using var client = new SmtpClient(host, port);
            client.EnableSsl = enableSsl;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(userName, password);
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.Timeout = 25000;

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

            // Attach official PDF document
            var pdfBytes = GenerateQuotationPdf(estimate);
            using var pdfStream = new MemoryStream(pdfBytes);
            var attachment = new Attachment(pdfStream, $"Bang_Bao_Gia_Thang_May_Ha_Hong_HH-{estimate.Id:D5}.pdf", "application/pdf");
            mail.Attachments.Add(attachment);

            await client.SendMailAsync(mail, cancellationToken);
            _logger.LogInformation("Successfully sent quotation email with PDF attachment to {Email} for Estimate #{Id}", estimate.Email, estimate.Id);
            return new EmailSendResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send estimate quotation email to {Email} for Estimate #{Id}", estimate.Email, estimate.Id);
            return new EmailSendResult(false, ex.Message);
        }
    }

    public byte[] GenerateQuotationPdf(ElevatorEstimate x)
    {
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
                // ignore
            }
        }

        var doc = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(t => t.FontSize(9.5f).FontColor("#1e293b"));

                // Header
                page.Header().Column(headerCol =>
                {
                    headerCol.Item().Row(row =>
                    {
                        row.RelativeItem(7).Column(c =>
                        {
                            c.Item().Text("CÔNG TY TNHH THANG MÁY HÀ HỒNG").Bold().FontSize(13).FontColor("#0056b3");
                            c.Item().Text("Chuyên Gia Thang Máy Gia Đình & Dịch Vụ Kỹ Thuật Uy Tín TPHCM").FontSize(8.5f).FontColor("#64748b");
                            c.Item().Text("Hotline 24/7: 0909 9333 58 | Email: hahongre@gmail.com").FontSize(8.5f).FontColor("#475569");
                            c.Item().Text("Địa chỉ: 18/1/6 Tổ 3, KP 6, P. Tân Thới Nhất, Quận 12, TP.HCM").FontSize(8f).FontColor("#64748b");
                        });

                        row.RelativeItem(5).AlignRight().Column(c =>
                        {
                            c.Item().Text($"MÃ BÁO GIÁ: HH-{x.Id:D5}").Bold().FontSize(12).FontColor("#dc2626");
                            c.Item().Text($"Ngày lập: {DateTime.Now:dd/MM/yyyy}").FontSize(8.5f).FontColor("#64748b");
                            c.Item().Text("Website: thangmayhahong.xyz").FontSize(8.5f).FontColor("#0056b3");
                        });
                    });

                    headerCol.Item().PaddingVertical(8).LineHorizontal(1.5f).LineColor("#0056b3");
                });

                // Content
                page.Content().Column(col =>
                {
                    col.Item().PaddingBottom(8).AlignCenter().Text("BẢNG DỰ TOÁN BÁO GIÁ THIẾT KẾ & LẮP ĐẶT THANG MÁY")
                        .Bold().FontSize(13).FontColor("#091e3a");

                    // Customer Info Box
                    col.Item().Border(1).BorderColor("#cbd5e1").Background("#f8fafc").Padding(10).Column(box =>
                    {
                        box.Item().Row(r =>
                        {
                            r.RelativeItem(6).Text(t =>
                            {
                                t.Span("Kính gửi Quý khách: ").FontColor("#64748b");
                                t.Span(x.CustomerName).Bold().FontColor("#0056b3");
                            });
                            r.RelativeItem(6).Text(t =>
                            {
                                t.Span("Số điện thoại: ").FontColor("#64748b");
                                t.Span(x.PhoneNumber).Bold();
                            });
                        });
                        box.Item().PaddingTop(4).Row(r =>
                        {
                            r.RelativeItem(6).Text(t =>
                            {
                                t.Span("Địa chỉ Gmail: ").FontColor("#64748b");
                                t.Span(x.Email ?? "(Chưa cung cấp)");
                            });
                            r.RelativeItem(6).Text(t =>
                            {
                                t.Span("Địa chỉ công trình: ").FontColor("#64748b");
                                t.Span(string.IsNullOrWhiteSpace(x.Address) ? "TP. Hồ Chí Minh" : x.Address);
                            });
                        });
                        box.Item().PaddingTop(4).Text(t =>
                        {
                            t.Span("Loại hình công trình: ").FontColor("#64748b");
                            t.Span(buildingName).Bold();
                        });
                    });

                    // Technical Specifications
                    col.Item().PaddingTop(10).PaddingBottom(4).Text("I. THÔNG SỐ KỸ THUẬT ĐỀ XUẤT").Bold().FontSize(10.5f).FontColor("#0056b3");
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(5);
                            cols.RelativeColumn(7);
                        });

                        void AddRow(string label, string val, bool alt = false)
                        {
                            table.Cell().Background(alt ? "#f1f5f9" : "#ffffff").Border(0.5f).BorderColor("#cbd5e1").Padding(4.5f).Text(label).Bold();
                            table.Cell().Background(alt ? "#f1f5f9" : "#ffffff").Border(0.5f).BorderColor("#cbd5e1").Padding(4.5f).Text(val);
                        }

                        AddRow("Tải trọng định mức", $"{x.CapacityKg} kg ({x.CapacityKg / 70} người)", true);
                        AddRow("Số tầng phục vụ", $"{x.Stops} Tầng ({x.Stops} điểm dừng)", false);
                        AddRow("Dòng thang máy", elevatorName, true);
                        AddRow("Động cơ / Công suất", $"{x.MotorBrand} ({x.MotorPowerKw} kW)", false);
                        AddRow("Kích thước giếng thang (Rộng x Sâu)", $"{x.ShaftWidth} x {x.ShaftDepth} mm", true);
                        AddRow("Kích thước cabin (Rộng x Sâu x Cao)", $"{x.CabinWidth} x {x.CabinDepth} x 2200 mm", false);
                        AddRow("Chiều sâu hố Pit / Chiều cao OH", $"Pit: {x.PitDepth} mm | OH: {x.OverheadHeight} mm", true);
                        AddRow("Yêu cầu nguồn điện", x.PowerSupply, false);
                    });

                    // Itemized Breakdown if available
                    if (breakdownItems.Count > 0)
                    {
                        col.Item().PaddingTop(10).PaddingBottom(4).Text("II. BÓC TÁCH CHI PHÍ THI CÔNG CHI TIẾT").Bold().FontSize(10.5f).FontColor("#0056b3");
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(cols =>
                            {
                                cols.RelativeColumn(3.5f);
                                cols.RelativeColumn(5.5f);
                                cols.RelativeColumn(3f);
                            });

                            table.Cell().Background("#0056b3").Padding(5).Text("Hạng mục").Bold().FontColor("#ffffff");
                            table.Cell().Background("#0056b3").Padding(5).Text("Quy cách kỹ thuật").Bold().FontColor("#ffffff");
                            table.Cell().Background("#0056b3").Padding(5).AlignRight().Text("Đơn giá dự kiến").Bold().FontColor("#ffffff");

                            var isAlt = false;
                            foreach (var item in breakdownItems)
                            {
                                var bg = isAlt ? "#f1f5f9" : "#ffffff";
                                table.Cell().Background(bg).Border(0.5f).BorderColor("#cbd5e1").Padding(4.5f).Text(item.Category).Bold();
                                table.Cell().Background(bg).Border(0.5f).BorderColor("#cbd5e1").Padding(4.5f).Text(item.Title);
                                table.Cell().Background(bg).Border(0.5f).BorderColor("#cbd5e1").Padding(4.5f).AlignRight().Text($"{FormatVnd(item.MinPrice)} - {FormatVnd(item.MaxPrice)}").Bold().FontColor("#0056b3");
                                isAlt = !isAlt;
                            }
                        });
                    }

                    // Price Banner
                    col.Item().PaddingTop(10).Background("#eff6ff").Border(1).BorderColor("#bfdbfe").Padding(8).AlignCenter().Column(priceCol =>
                    {
                        priceCol.Item().Text($"TỔNG CHI PHÍ DỰ TOÁN TRỌN GÓI ({x.Stops} TẦNG):").Bold().FontSize(10f).FontColor("#1e40af");
                        priceCol.Item().Text($"{priceMin} - {priceMax}").Bold().FontSize(15).FontColor("#dc2626");
                        priceCol.Item().Text("(Bao gồm toàn bộ thiết bị nhập khẩu chính hãng, kiểm định an toàn và nhân công lắp đặt hoàn thiện)").FontSize(8f).FontColor("#1e3a8a");
                    });

                    // Commitments Box
                    col.Item().PaddingTop(10).Border(1).BorderColor("#bbf7d0").Background("#f0fdf4").Padding(8).Column(c =>
                    {
                        c.Item().Text("CAM KẾT CHẤT LƯỢNG TỪ THANG MÁY HÀ HỒNG:").Bold().FontSize(8.5f).FontColor("#166534");
                        c.Item().Text("• Bảo hành toàn diện 24 tháng chính hãng đối với thiết bị động cơ và tủ điều khiển.").FontSize(8f).FontColor("#15803d");
                        c.Item().Text("• Tặng gói bảo trì định kỳ miễn phí 12 tháng đầu tiên sau khi bàn giao nghiệm thu.").FontSize(8f).FontColor("#15803d");
                        c.Item().Text("• Đội ngũ kỹ sư trực kỹ thuật 24/7, có mặt hỗ trợ tại TPHCM trong vòng 30 phút.").FontSize(8f).FontColor("#15803d");
                    });

                    // Signature
                    col.Item().PaddingTop(15).Row(r =>
                    {
                        r.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Text("ĐẠI DIỆN KHÁCH HÀNG").Bold().FontSize(9f);
                            c.Item().Text("(Ký, ghi rõ họ tên)").Italic().FontSize(7.5f).FontColor("#64748b");
                        });
                        r.RelativeItem().AlignCenter().Column(c =>
                        {
                            c.Item().Text("ĐẠI DIỆN THANG MÁY HÀ HỒNG").Bold().FontSize(9f).FontColor("#0056b3");
                            c.Item().Text("(Ký tên và đóng dấu)").Italic().FontSize(7.5f).FontColor("#64748b");
                        });
                    });
                });

                // Footer
                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("Thang Máy Hà Hồng — Hotline: 0909 9333 58 — thangmayhahong.xyz").FontSize(7.5f).FontColor("#94a3b8");
                    row.RelativeItem().AlignRight().Text(x =>
                    {
                        x.DefaultTextStyle(t => t.FontSize(7.5f).FontColor("#94a3b8"));
                        x.Span("Trang ");
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            });
        });

        return doc.GeneratePdf();
    }

    private static string FormatVnd(decimal val)
    {
        return val.ToString("N0", new CultureInfo("vi-VN")) + " VNĐ";
    }

    private static string BuildQuotationEmailHtml(ElevatorEstimate x)
    {
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
            <p style=""font-size: 13px; color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 6px;"">
                📎 <strong>Tài liệu đính kèm:</strong> Chúng tôi đã đính kèm <strong>File PDF Báo Giá Chính Thức (Bang_Bao_Gia_Thang_May_Ha_Hong_HH-{x.Id:D5}.pdf)</strong> vào email này để Quý khách tiện lưu trữ và in ấn.
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
                    <td style=""padding: 8px 10px; font-weight: 700; color: #0056b3; border: 1px solid #e2e8f0;"">{x.CapacityKg} kg ({x.CapacityKg / 70} người)</td>
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
}
