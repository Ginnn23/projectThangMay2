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
        await SeedContractsAsync(dbContext);
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

    private static async Task SeedContractsAsync(ApplicationDbContext dbContext)
    {
        if (await dbContext.ElevatorContracts.AnyAsync())
        {
            return;
        }

        var contracts = new List<ElevatorContract>
        {
            new()
            {
                ContractCode = "HD-HH-2026-001",
                CustomerName = "Nguyễn Văn Hùng",
                PhoneNumber = "0908123456",
                Email = "hung.nguyen@gmail.com",
                ProjectName = "Biệt Thự Thảo Điền - TP. Thủ Đức",
                Address = "Biệt Thự Thảo Điền, TP. Thủ Đức, TP.HCM",
                ElevatorType = "homelift-kinh",
                Stops = 5,
                CapacityKg = 450,
                MotorBrand = "Fuji",
                DoorType = "CO",
                ContractDate = DateTime.UtcNow.AddDays(-60),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(-10),
                ActualDeliveryDate = DateTime.UtcNow.AddDays(-10),
                TotalValue = 880_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 460_000_000m,
                CostShipping = 25_000_000m,
                CostInstallation = 70_000_000m,
                CostOther = 25_000_000m,
                ProjectStatus = "HoanTat",
                PaymentStatus = "ThanhToanDu",
                AdminNotes = "Đã hoàn thành lắp đặt trọn gói hố kính chịu lực và cabin Homelift Panorama, bàn giao đưa vào vận hành. Đã thu đủ 100% dòng tiền.",
                Payments = new List<ContractPayment>
                {
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-60),
                        Amount = 440_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Đặt cọc đợt 1 (50%)",
                        ReceiptCode = "UNC-VCB-001928",
                        Note = "Tiền đặt cọc ký hợp đồng và nhập thiết bị Fuji",
                        CreatedBy = "Admin"
                    },
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-35),
                        Amount = 220_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Thanh toán đợt 2 (25%)",
                        ReceiptCode = "UNC-VCB-002140",
                        Note = "Thanh toán khi thiết bị về đến công trình và kéo máy vào hố",
                        CreatedBy = "Admin"
                    },
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-10),
                        Amount = 220_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Thanh toán đợt cuối (25%)",
                        ReceiptCode = "UNC-VCB-002891",
                        Note = "Thanh toán sau khi kiểm định an toàn và nghiệm thu bàn giao",
                        CreatedBy = "Admin"
                    }
                }
            },
            new()
            {
                ContractCode = "HD-HH-2026-002",
                CustomerName = "Lê Hoàng Nam",
                PhoneNumber = "0934567890",
                Email = "nam.le@gmail.com",
                ProjectName = "Dinh Thự Phú Mỹ Hưng - Quận 7",
                Address = "Dinh Thự Phú Mỹ Hưng, Quận 7, TP.HCM",
                ElevatorType = "inox-guong-vang",
                Stops = 6,
                CapacityKg = 630,
                MotorBrand = "Montanari",
                DoorType = "2S",
                ContractDate = DateTime.UtcNow.AddDays(-45),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(-5),
                ActualDeliveryDate = DateTime.UtcNow.AddDays(-5),
                TotalValue = 920_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 490_000_000m,
                CostShipping = 30_000_000m,
                CostInstallation = 75_000_000m,
                CostOther = 25_000_000m,
                ProjectStatus = "DaBanGiao",
                PaymentStatus = "ThanhToanDu",
                AdminNotes = "Thang máy biệt thự vách Inox gương vàng hoa văn PVD tân cổ điển, khách hàng đã hoàn tất thanh toán 100%.",
                Payments = new List<ContractPayment>
                {
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-45),
                        Amount = 460_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Đặt cọc đợt 1 (50%)",
                        ReceiptCode = "UNC-TCB-883192",
                        Note = "Tiền đặt cọc hợp đồng nhập khẩu động cơ Montanari Italy",
                        CreatedBy = "Admin"
                    },
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-5),
                        Amount = 460_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Thanh toán 50% còn lại",
                        ReceiptCode = "UNC-TCB-902145",
                        Note = "Thanh toán tất toán khi nghiệm thu bàn giao",
                        CreatedBy = "Admin"
                    }
                }
            },
            new()
            {
                ContractCode = "HD-HH-2026-003",
                CustomerName = "Trần Thị Mai",
                PhoneNumber = "0912345678",
                Email = "mai.tran@gmail.com",
                ProjectName = "Nhà Phố Liền Kề KĐT Sala - Thủ Đức",
                Address = "Nhà Phố Liền Kề KĐT Sala, TP. Thủ Đức, TP.HCM",
                ElevatorType = "inox-tieu-chuan",
                Stops = 4,
                CapacityKg = 450,
                MotorBrand = "Mitsubishi",
                DoorType = "CO",
                ContractDate = DateTime.UtcNow.AddDays(-30),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(-2),
                ActualDeliveryDate = DateTime.UtcNow.AddDays(-2),
                TotalValue = 700_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 380_000_000m,
                CostShipping = 20_000_000m,
                CostInstallation = 55_000_000m,
                CostOther = 15_000_000m,
                ProjectStatus = "HoanTat",
                PaymentStatus = "ThanhToanDu",
                AdminNotes = "Đã nghiệm thu và bàn giao thang máy inox 304 sọc nhuyễn chống vân tay, khách hài lòng.",
                Payments = new List<ContractPayment>
                {
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-30),
                        Amount = 350_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Đặt cọc đợt 1 (50%)",
                        ReceiptCode = "UNC-ACB-551209",
                        Note = "Đặt cọc sản xuất cơ khí và linh kiện Mitsubishi",
                        CreatedBy = "Admin"
                    },
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-2),
                        Amount = 350_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Thanh toán đợt cuối (50%)",
                        ReceiptCode = "UNC-ACB-560114",
                        Note = "Tất toán sau khi bàn giao",
                        CreatedBy = "Admin"
                    }
                }
            },
            new()
            {
                ContractCode = "HD-HH-2026-004",
                CustomerName = "Bùi Anh Tuấn",
                PhoneNumber = "0977889900",
                Email = "tuan.bui@gmail.com",
                ProjectName = "Biệt Thự Park City - Tân Bình",
                Address = "Biệt Thự Park City, Quận Tân Bình, TP.HCM",
                ElevatorType = "homelift-kinh",
                Stops = 4,
                CapacityKg = 400,
                MotorBrand = "Fuji",
                DoorType = "CO",
                ContractDate = DateTime.UtcNow.AddDays(-20),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(15),
                TotalValue = 750_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 410_000_000m,
                CostShipping = 20_000_000m,
                CostInstallation = 60_000_000m,
                CostOther = 20_000_000m,
                ProjectStatus = "DangLapDat",
                PaymentStatus = "ThanhToanMotPhan",
                AdminNotes = "Đang tiến hành lắp ray, thả cáp và căn chỉnh khung đối trọng. Đã thanh toán cọc và đợt kéo máy.",
                Payments = new List<ContractPayment>
                {
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-20),
                        Amount = 375_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Đặt cọc đợt 1 (50%)",
                        ReceiptCode = "UNC-MB-771203",
                        Note = "Đặt cọc hợp đồng 50%",
                        CreatedBy = "Admin"
                    },
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-5),
                        Amount = 150_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Thanh toán đợt 2 (kéo máy)",
                        ReceiptCode = "UNC-MB-780921",
                        Note = "Thanh toán thêm khi máy kéo và tủ điện tập kết công trình",
                        CreatedBy = "Admin"
                    }
                }
            },
            new()
            {
                ContractCode = "HD-HH-2026-005",
                CustomerName = "Đặng Minh Khôi",
                PhoneNumber = "0965123987",
                Email = "khoi.dang@gmail.com",
                ProjectName = "Shophouse Vinhomes Grand Park - Thủ Đức",
                Address = "Khu đô thị Vinhomes Grand Park, TP. Thủ Đức, TP.HCM",
                ElevatorType = "homelift-kinh",
                Stops = 5,
                CapacityKg = 450,
                MotorBrand = "Fuji",
                DoorType = "CO",
                ContractDate = DateTime.UtcNow.AddDays(-10),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(25),
                TotalValue = 820_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 440_000_000m,
                CostShipping = 25_000_000m,
                CostInstallation = 65_000_000m,
                CostOther = 20_000_000m,
                ProjectStatus = "DangNhapThietBi",
                PaymentStatus = "DaDatCoc",
                AdminNotes = "Đã nhận tiền cọc 50%, đang hoàn tất thủ tục thông quan nhập khẩu máy kéo Fuji chính hãng.",
                Payments = new List<ContractPayment>
                {
                    new()
                    {
                        PaymentDate = DateTime.UtcNow.AddDays(-10),
                        Amount = 410_000_000m,
                        PaymentMethod = "Chuyển khoản",
                        Stage = "Đặt cọc đợt 1 (50%)",
                        ReceiptCode = "UNC-BIDV-110294",
                        Note = "Tiền đặt cọc 50% theo điều khoản hợp đồng",
                        CreatedBy = "Admin"
                    }
                }
            },
            new()
            {
                ContractCode = "HD-HH-2026-006",
                CustomerName = "Hoàng Thị Thu Hà",
                PhoneNumber = "0944556677",
                Email = "ha.hoang@gmail.com",
                ProjectName = "Biệt Thự Vườn Thảo Điền - Quận 2",
                Address = "Khu Biệt Thự Sông Thảo Điền, Quận 2, TP.HCM",
                ElevatorType = "inox-guong-vang",
                Stops = 4,
                CapacityKg = 630,
                MotorBrand = "Montanari",
                DoorType = "2S",
                ContractDate = DateTime.UtcNow.AddDays(-2),
                ExpectedDeliveryDate = DateTime.UtcNow.AddDays(40),
                TotalValue = 860_000_000m,
                DepositRate = 50.0m,
                CostEquipment = 460_000_000m,
                CostShipping = 25_000_000m,
                CostInstallation = 70_000_000m,
                CostOther = 25_000_000m,
                ProjectStatus = "ChoDatCoc",
                PaymentStatus = "ChuaDatCoc",
                AdminNotes = "Vừa ký hợp đồng, kế toán đang chờ ủy nhiệm chi đặt cọc 50% (430.000.000 VNĐ) từ khách hàng.",
                Payments = new List<ContractPayment>()
            }
        };

        foreach (var c in contracts)
        {
            c.RecalculateFinancials();
            dbContext.ElevatorContracts.Add(c);
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
