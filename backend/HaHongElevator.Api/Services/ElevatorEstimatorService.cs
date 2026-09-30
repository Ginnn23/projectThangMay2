using System.Text.Json;
using HaHongElevator.Api.DTOs.Estimates;
using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public class ElevatorEstimatorService
{
    public EstimateCalculationResult Calculate(EstimateCalculationRequest req)
    {
        var stops = Math.Clamp(req.Stops, 2, 10);
        var capacity = req.CapacityKg switch
        {
            <= 300 => 300,
            <= 350 => 350,
            <= 450 => 450,
            _ => 630
        };

        var isGlassHomelift = req.ElevatorType.Contains("kinh", StringComparison.OrdinalIgnoreCase) ||
                              req.ElevatorType.Contains("homelift", StringComparison.OrdinalIgnoreCase);
        var isGoldMirror = req.ElevatorType.Contains("vang", StringComparison.OrdinalIgnoreCase) ||
                           req.ElevatorType.Contains("guong", StringComparison.OrdinalIgnoreCase);
        var isRenovation = req.BuildingType.Contains("cai-tao", StringComparison.OrdinalIgnoreCase);

        // 1. Calculate technical dimensions
        int shaftW, shaftD, cabinW, cabinD, doorW;
        int pitDepth, overheadH;
        decimal motorPowerKw;
        decimal speedMps;
        string powerSupply;

        switch (capacity)
        {
            case 300:
                shaftW = isGlassHomelift ? 1200 : 1300;
                shaftD = isGlassHomelift ? 1200 : 1300;
                cabinW = 850;
                cabinD = 800;
                doorW = 650;
                motorPowerKw = 2.2m;
                speedMps = isGlassHomelift ? 0.4m : 0.6m;
                powerSupply = "1 pha 220V hoặc 3 pha 380V";
                break;
            case 350:
                shaftW = isGlassHomelift ? 1350 : 1450;
                shaftD = isGlassHomelift ? 1350 : 1450;
                cabinW = 950;
                cabinD = 900;
                doorW = 700;
                motorPowerKw = 2.7m;
                speedMps = isGlassHomelift ? 0.4m : 0.6m;
                powerSupply = "1 pha 220V hoặc 3 pha 380V";
                break;
            case 450:
                shaftW = isGlassHomelift ? 1550 : 1650;
                shaftD = isGlassHomelift ? 1550 : 1600;
                cabinW = 1100;
                cabinD = 1000;
                doorW = 750;
                motorPowerKw = 3.7m;
                speedMps = 1.0m;
                powerSupply = "3 pha 380V (Khuyên dùng)";
                break;
            default: // 630kg
                shaftW = 1800;
                shaftD = 1750;
                cabinW = 1300;
                cabinD = 1150;
                doorW = 800;
                motorPowerKw = 5.5m;
                speedMps = 1.0m;
                powerSupply = "3 pha 380V";
                break;
        }

        if (isGlassHomelift)
        {
            pitDepth = isRenovation ? 250 : 350;
            overheadH = 2950;
        }
        else
        {
            pitDepth = isRenovation ? 600 : 1100;
            overheadH = isRenovation ? 3400 : 3800;
        }

        // 2. Cost calculations
        decimal motorMin, motorMax;
        string motorDesc;
        switch (req.MotorBrand.ToLowerInvariant())
        {
            case "mitsubishi":
                motorMin = 135_000_000m;
                motorMax = 155_000_000m;
                motorDesc = "Động cơ không hộp số Mitsubishi (Thái Lan) + Biến tần Yaskawa Nhật Bản, vận hành siêu bền và tiết kiệm điện 40%.";
                break;
            case "montanari":
                motorMin = 155_000_000m;
                motorMax = 180_000_000m;
                motorDesc = "Động cơ nhập khẩu nguyên chiếc Montanari (Ý) tiêu chuẩn châu Âu cao cấp, vận hành êm ái tuyệt đối.";
                break;
            default: // Fuji
                motorMin = 110_000_000m;
                motorMax = 125_000_000m;
                motorDesc = "Động cơ không hộp số Fuji (Công nghệ Nhật Bản) + Tủ điều khiển biến tần vi xử lý thế hệ mới, tối ưu chi phí.";
                break;
        }

        decimal cabinMin, cabinMax;
        string cabinDesc;
        if (isGlassHomelift)
        {
            cabinMin = 120_000_000m;
            cabinMax = 145_000_000m;
            cabinDesc = "Vách cabin kính cường lực 10mm an toàn 4 mặt, sàn đá hoa cương tự nhiên, trần chiếu sáng LED phong cách châu Âu.";
        }
        else if (isGoldMirror)
        {
            cabinMin = 95_000_000m;
            cabinMax = 115_000_000m;
            cabinDesc = "Inox 304 gương vàng khắc hoa văn laser cao cấp, phối inox sọc nhuyễn sang trọng phong cách tân cổ điển.";
        }
        else
        {
            cabinMin = 75_000_000m;
            cabinMax = 90_000_000m;
            cabinDesc = "Inox 304 sọc nhuyễn chống vân tay kết hợp inox gương hiện đại, sàn đá granite bền bỉ, quạt thông gió chuyên dụng.";
        }

        // Additional stops beyond base 3 stops
        var extraStops = Math.Max(0, stops - 3);
        decimal stopCostMin = extraStops * 16_000_000m;
        decimal stopCostMax = extraStops * 20_000_000m;
        var stopDesc = $"Hệ thống ray dẫn hướng T78/T89, cáp tải chuyên dụng, {stops} bộ cửa tầng tự động và cụm nút gọi tầng LED hiển thị.";

        // Frame / Shaft structure cost
        decimal frameMin = 0m, frameMax = 0m;
        string frameDesc = "Hố thang tường gạch / cột bê tông có sẵn của công trình.";
        if (isGlassHomelift)
        {
            frameMin = 50_000_000m + (stops * 5_000_000m);
            frameMax = 65_000_000m + (stops * 6_000_000m);
            frameDesc = $"Hệ khung thép định hình sơn tĩnh điện cao cấp {stops} tầng, bọc kính cường lực an toàn thẩm mỹ cao.";
        }
        else if (isRenovation)
        {
            frameMin = 35_000_000m + (stops * 3_500_000m);
            frameMax = 48_000_000m + (stops * 4_500_000m);
            frameDesc = $"Gia cố kết cấu khung thép giếng thang cho nhà cải tạo {stops} tầng, không ảnh hưởng kết cấu móng nhà.";
        }

        // Labor, installation, inspection and insurance
        decimal laborMin = 35_000_000m + (stops * 2_000_000m);
        decimal laborMax = 45_000_000m + (stops * 2_500_000m);
        var laborDesc = "Thi công cơ khí, kéo cáp, đấu nối điện, kiểm định an toàn kỹ thuật nhà nước, bảo hiểm và vận chuyển tận nơi.";

        // Total
        var totalMin = motorMin + cabinMin + stopCostMin + frameMin + laborMin;
        var totalMax = motorMax + cabinMax + stopCostMax + frameMax + laborMax;

        // Round to millions
        totalMin = Math.Round(totalMin / 1_000_000m) * 1_000_000m;
        totalMax = Math.Round(totalMax / 1_000_000m) * 1_000_000m;

        var breakdown = new List<CostBreakdownItem>
        {
            new()
            {
                Category = "Động cơ & Tủ điều khiển",
                Title = $"{req.MotorBrand} {motorPowerKw}kW (Không hộp số)",
                Description = motorDesc,
                MinPrice = motorMin,
                MaxPrice = motorMax
            },
            new()
            {
                Category = "Nội thất Cabin & Khung cơ khí",
                Title = isGlassHomelift ? "Vách kính Homelift Panorama" : (isGoldMirror ? "Cabin Inox Gương Vàng Luxury" : "Cabin Inox 304 Tiêu Chuẩn"),
                Description = cabinDesc,
                MinPrice = cabinMin,
                MaxPrice = cabinMax
            },
            new()
            {
                Category = "Hệ thống Cửa tầng & Thiết bị theo tầng",
                Title = $"{stops} Điểm dừng (Stops) trọn gói",
                Description = stopDesc,
                MinPrice = stopCostMin + 25_000_000m,
                MaxPrice = stopCostMax + 32_000_000m
            }
        };

        if (frameMin > 0)
        {
            breakdown.Add(new()
            {
                Category = "Kết cấu Khung hố thang",
                Title = isGlassHomelift ? "Khung thép kính chịu lực chuyên dụng" : "Khung thép gia cố nhà cải tạo",
                Description = frameDesc,
                MinPrice = frameMin,
                MaxPrice = frameMax
            });
        }

        breakdown.Add(new()
        {
            Category = "Lắp đặt, Kiểm định & Nghiệm thu",
            Title = "Nhân công trọn gói & Kiểm định Nhà nước",
            Description = laborDesc,
            MinPrice = laborMin,
            MaxPrice = laborMax
        });

        return new EstimateCalculationResult
        {
            EstimatedPriceMin = totalMin,
            EstimatedPriceMax = totalMax,
            ShaftWidth = shaftW,
            ShaftDepth = shaftD,
            CabinWidth = cabinW,
            CabinDepth = cabinD,
            CabinHeight = 2200,
            PitDepth = pitDepth,
            OverheadHeight = overheadH,
            DoorWidth = doorW,
            DoorHeight = 2100,
            SpeedMps = speedMps,
            MotorPowerKw = motorPowerKw,
            PowerSupply = powerSupply,
            WarrantyMonths = 24,
            FreeMaintenanceMonths = 12,
            BreakdownItems = breakdown
        };
    }
}
