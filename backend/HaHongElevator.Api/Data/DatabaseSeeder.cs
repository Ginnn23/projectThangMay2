using HaHongElevator.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HaHongElevator.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAdminUserAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!await dbContext.Database.CanConnectAsync())
        {
            return;
        }

        await SeedAdminAsync(scope.ServiceProvider, dbContext);
        await SeedEstimatesAsync(dbContext);
    }

    private static async Task SeedAdminAsync(IServiceProvider serviceProvider, ApplicationDbContext dbContext)
    {
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var username = GetRequiredAdminValue(serviceProvider, "AdminSeed:Username", "admin");
        var password = GetRequiredAdminValue(serviceProvider, "AdminSeed:Password");
        var fullName = GetRequiredAdminValue(serviceProvider, "AdminSeed:FullName", "Quản trị viên");
        var resetExistingPassword = configuration.GetValue<bool>("AdminSeed:ResetExistingPassword");
        var existingAdmin = await dbContext.AdminUsers.FirstOrDefaultAsync(x => x.Username == username);

        if (existingAdmin != null)
        {
            if (resetExistingPassword)
            {
                existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                existingAdmin.FullName = fullName;
                existingAdmin.Role = "Admin";
                existingAdmin.IsActive = true;
                await dbContext.SaveChangesAsync();
            }

            return;
        }

        if (await dbContext.AdminUsers.AnyAsync())
        {
            return;
        }

        var adminUser = new AdminUser
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            FullName = fullName,
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AdminUsers.Add(adminUser);
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedEstimatesAsync(ApplicationDbContext dbContext)
    {
        // Kiểm tra xem đã có các hợp đồng hoàn thành với doanh thu chuẩn > 2 tỷ chưa
        var estimates = await dbContext.ElevatorEstimates.ToListAsync();

        // 3 Thang máy đã thi công hoàn thiện bàn giao (Status = DealClosed)
        // Tổng doanh thu ký kết: 880Tr + 920Tr + 700Tr = 2,500,000,000 VNĐ (2.5 Tỷ VNĐ)
        var hungProject = estimates.FirstOrDefault(e => e.CustomerName == "Nguyen Van Hung" || e.CustomerName == "Nguyễn Văn Hùng");
        if (hungProject != null)
        {
            hungProject.CustomerName = "Nguyễn Văn Hùng";
            hungProject.Address = "Biệt Thự Thảo Điền, TP. Thủ Đức, TP.HCM";
            hungProject.BuildingType = "biet-thu";
            hungProject.Stops = 5;
            hungProject.CapacityKg = 450;
            hungProject.ElevatorType = "homelift-kinh";
            hungProject.MotorBrand = "Fuji";
            hungProject.DoorType = "CO";
            hungProject.SpeedMps = 1.0m;
            hungProject.EstimatedPriceMin = 840_000_000m;
            hungProject.EstimatedPriceMax = 920_000_000m;
            hungProject.Status = "DealClosed";
            hungProject.AdminNotes = "Đã hoàn thành lắp đặt trọn gói hố kính chịu lực và cabin Homelift Panorama, kiểm định chất lượng an toàn nhà nước và bàn giao đưa vào vận hành tháng 10/2026. Bảo hành 24 tháng.";
        }
        else
        {
            dbContext.ElevatorEstimates.Add(new ElevatorEstimate
            {
                CustomerName = "Nguyễn Văn Hùng",
                PhoneNumber = "0908123456",
                Email = "hung.nguyen@gmail.com",
                Address = "Biệt Thự Thảo Điền, TP. Thủ Đức, TP.HCM",
                BuildingType = "biet-thu",
                Stops = 5,
                CapacityKg = 450,
                ElevatorType = "homelift-kinh",
                MotorBrand = "Fuji",
                DoorType = "CO",
                SpeedMps = 1.0m,
                EstimatedPriceMin = 840_000_000m,
                EstimatedPriceMax = 920_000_000m,
                ShaftWidth = 1600,
                ShaftDepth = 1600,
                CabinWidth = 1100,
                CabinDepth = 1050,
                PitDepth = 350,
                OverheadHeight = 2950,
                MotorPowerKw = 3.7m,
                PowerSupply = "3 pha 380V",
                Status = "DealClosed",
                AdminNotes = "Đã hoàn thành lắp đặt trọn gói hố kính chịu lực và cabin Homelift Panorama, kiểm định chất lượng an toàn nhà nước và bàn giao đưa vào vận hành tháng 10/2026. Bảo hành 24 tháng.",
                CreatedAt = DateTime.UtcNow.AddDays(-25)
            });
        }

        var namProject = estimates.FirstOrDefault(e => e.CustomerName == "Le Hoang Nam" || e.CustomerName == "Lê Hoàng Nam");
        if (namProject != null)
        {
            namProject.CustomerName = "Lê Hoàng Nam";
            namProject.Address = "Dinh Thự Phú Mỹ Hưng, Quận 7, TP.HCM";
            namProject.BuildingType = "biet-thu";
            namProject.Stops = 6;
            namProject.CapacityKg = 630;
            namProject.ElevatorType = "inox-guong-vang";
            namProject.MotorBrand = "Montanari";
            namProject.DoorType = "2S";
            namProject.SpeedMps = 1.0m;
            namProject.EstimatedPriceMin = 880_000_000m;
            namProject.EstimatedPriceMax = 960_000_000m;
            namProject.Status = "DealClosed";
            namProject.AdminNotes = "Đã nghiệm thu bàn giao thang máy biệt thự vách Inox gương vàng hoa văn PVD tân cổ điển, khách hàng đã hoàn tất thanh toán 100% giá trị hợp đồng.";
        }
        else
        {
            dbContext.ElevatorEstimates.Add(new ElevatorEstimate
            {
                CustomerName = "Lê Hoàng Nam",
                PhoneNumber = "0934567890",
                Email = "nam.le@gmail.com",
                Address = "Dinh Thự Phú Mỹ Hưng, Quận 7, TP.HCM",
                BuildingType = "biet-thu",
                Stops = 6,
                CapacityKg = 630,
                ElevatorType = "inox-guong-vang",
                MotorBrand = "Montanari",
                DoorType = "2S",
                SpeedMps = 1.0m,
                EstimatedPriceMin = 880_000_000m,
                EstimatedPriceMax = 960_000_000m,
                ShaftWidth = 1800,
                ShaftDepth = 1750,
                CabinWidth = 1300,
                CabinDepth = 1150,
                PitDepth = 1100,
                OverheadHeight = 3800,
                MotorPowerKw = 5.5m,
                PowerSupply = "3 pha 380V",
                Status = "DealClosed",
                AdminNotes = "Đã nghiệm thu bàn giao thang máy biệt thự vách Inox gương vàng hoa văn PVD tân cổ điển, khách hàng đã hoàn tất thanh toán 100% giá trị hợp đồng.",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            });
        }

        var maiProject = estimates.FirstOrDefault(e => e.CustomerName == "Tran Thi Mai" || e.CustomerName == "Trần Thị Mai");
        if (maiProject != null)
        {
            maiProject.CustomerName = "Trần Thị Mai";
            maiProject.Address = "Nhà Phố Liền Kề KĐT Sala, TP. Thủ Đức, TP.HCM";
            maiProject.BuildingType = "nha-pho-xay-moi";
            maiProject.Stops = 4;
            maiProject.CapacityKg = 450;
            maiProject.ElevatorType = "inox-tieu-chuan";
            maiProject.MotorBrand = "Mitsubishi";
            maiProject.DoorType = "CO";
            maiProject.SpeedMps = 0.6m;
            maiProject.EstimatedPriceMin = 680_000_000m;
            maiProject.EstimatedPriceMax = 720_000_000m;
            maiProject.Status = "DealClosed";
            maiProject.AdminNotes = "Đã thi công hoàn thiện bàn giao thang máy gia đình inox 304 sọc nhuyễn chống vân tay, vận hành êm ái, khách hàng rất hài lòng.";
        }
        else
        {
            dbContext.ElevatorEstimates.Add(new ElevatorEstimate
            {
                CustomerName = "Trần Thị Mai",
                PhoneNumber = "0912345678",
                Email = "mai.tran@gmail.com",
                Address = "Nhà Phố Liền Kề KĐT Sala, TP. Thủ Đức, TP.HCM",
                BuildingType = "nha-pho-xay-moi",
                Stops = 4,
                CapacityKg = 450,
                ElevatorType = "inox-tieu-chuan",
                MotorBrand = "Mitsubishi",
                DoorType = "CO",
                SpeedMps = 0.6m,
                EstimatedPriceMin = 680_000_000m,
                EstimatedPriceMax = 720_000_000m,
                ShaftWidth = 1500,
                ShaftDepth = 1500,
                CabinWidth = 1000,
                CabinDepth = 1000,
                PitDepth = 1100,
                OverheadHeight = 3800,
                MotorPowerKw = 3.7m,
                PowerSupply = "3 pha 380V",
                Status = "DealClosed",
                AdminNotes = "Đã thi công hoàn thiện bàn giao thang máy gia đình inox 304 sọc nhuyễn chống vân tay, vận hành êm ái, khách hàng rất hài lòng.",
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            });
        }

        // Dự án đang ở giai đoạn khảo sát tư vấn (Pipeline)
        var ducProject = estimates.FirstOrDefault(e => e.CustomerName == "Phạm Hoàng Đức");
        if (ducProject == null)
        {
            dbContext.ElevatorEstimates.Add(new ElevatorEstimate
            {
                CustomerName = "Phạm Hoàng Đức",
                PhoneNumber = "0987654321",
                Email = "duc.pham@gmail.com",
                Address = "100 Tân Sơn, Phường 15, Quận Tân Bình, TP.HCM",
                BuildingType = "nha-pho-cai-tao",
                Stops = 4,
                CapacityKg = 350,
                ElevatorType = "homelift-kinh",
                MotorBrand = "Fuji",
                DoorType = "CO",
                SpeedMps = 0.6m,
                EstimatedPriceMin = 420_000_000m,
                EstimatedPriceMax = 480_000_000m,
                ShaftWidth = 1450,
                ShaftDepth = 1450,
                CabinWidth = 950,
                CabinDepth = 900,
                PitDepth = 350,
                OverheadHeight = 2900,
                MotorPowerKw = 2.7m,
                PowerSupply = "1 pha 220V",
                Status = "SurveyScheduled",
                AdminNotes = "Đã liên hệ hẹn lịch kỹ sư xuống đo đạc hố thang thực tế ngày 30/10/2026.",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            });
        }

        await dbContext.SaveChangesAsync();
    }

    private static string GetRequiredAdminValue(IServiceProvider serviceProvider, string key, string? developmentDefault = null)
    {
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
        var configuredValue = configuration[key];

        if (!string.IsNullOrWhiteSpace(configuredValue))
        {
            return configuredValue.Trim();
        }

        if (environment.IsDevelopment() && !string.IsNullOrWhiteSpace(developmentDefault))
        {
            return developmentDefault;
        }

        throw new InvalidOperationException($"{key} must be configured before seeding admin user.");
    }
}
