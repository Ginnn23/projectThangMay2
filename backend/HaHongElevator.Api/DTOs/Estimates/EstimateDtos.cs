using System.ComponentModel.DataAnnotations;

namespace HaHongElevator.Api.DTOs.Estimates;

public class EstimateCalculationRequest
{
    [Required]
    public string BuildingType { get; set; } = "nha-pho-xay-moi"; // nha-pho-cai-tao, nha-pho-xay-moi, biet-thu, van-phong

    [Range(2, 10)]
    public int Stops { get; set; } = 4; // 2 - 10

    [Range(250, 1000)]
    public int CapacityKg { get; set; } = 350; // 300, 350, 450, 630

    [Required]
    public string ElevatorType { get; set; } = "homelift-kinh"; // homelift-kinh, inox-tieu-chuan, inox-guong-vang

    [Required]
    public string MotorBrand { get; set; } = "Fuji"; // Fuji, Mitsubishi, Montanari

    public string DoorType { get; set; } = "CO"; // CO, 2S, MoTay
}

public class CostBreakdownItem
{
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
}

public class EstimateCalculationResult
{
    public decimal EstimatedPriceMin { get; set; }
    public decimal EstimatedPriceMax { get; set; }

    public int ShaftWidth { get; set; }
    public int ShaftDepth { get; set; }
    public int CabinWidth { get; set; }
    public int CabinDepth { get; set; }
    public int CabinHeight { get; set; } = 2200;
    public int PitDepth { get; set; }
    public int OverheadHeight { get; set; }
    public int DoorWidth { get; set; }
    public int DoorHeight { get; set; } = 2100;

    public decimal SpeedMps { get; set; }
    public decimal MotorPowerKw { get; set; }
    public string PowerSupply { get; set; } = string.Empty;

    public int WarrantyMonths { get; set; } = 24;
    public int FreeMaintenanceMonths { get; set; } = 12;

    public List<CostBreakdownItem> BreakdownItems { get; set; } = [];
}

public class CreateEstimateRequest
{
    [Required(ErrorMessage = "Vui lòng nhập họ và tên")]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
    [MaxLength(15)]
    [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "Số điện thoại phải gồm đúng 10 chữ số (bắt đầu bằng số 0)")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập địa chỉ Gmail")]
    [MaxLength(254)]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    [RegularExpression(@"^(?i)[a-zA-Z0-9._%+-]+@gmail\.com$", ErrorMessage = "Địa chỉ email phải có đuôi @gmail.com (VD: example@gmail.com)")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Address { get; set; }

    [Required]
    public string BuildingType { get; set; } = "nha-pho-xay-moi";

    [Range(2, 10)]
    public int Stops { get; set; } = 4;

    [Range(250, 1000)]
    public int CapacityKg { get; set; } = 350;

    [Required]
    public string ElevatorType { get; set; } = "homelift-kinh";

    [Required]
    public string MotorBrand { get; set; } = "Fuji";

    public string DoorType { get; set; } = "CO";

    [MaxLength(2000)]
    public string? CustomerNotes { get; set; }
}

public class EstimateResponse
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }

    public string BuildingType { get; set; } = string.Empty;
    public int Stops { get; set; }
    public int CapacityKg { get; set; }
    public string ElevatorType { get; set; } = string.Empty;
    public string MotorBrand { get; set; } = string.Empty;
    public string DoorType { get; set; } = string.Empty;
    public decimal SpeedMps { get; set; }

    public decimal EstimatedPriceMin { get; set; }
    public decimal EstimatedPriceMax { get; set; }

    public int ShaftWidth { get; set; }
    public int ShaftDepth { get; set; }
    public int CabinWidth { get; set; }
    public int CabinDepth { get; set; }
    public int PitDepth { get; set; }
    public int OverheadHeight { get; set; }
    public decimal MotorPowerKw { get; set; }
    public string PowerSupply { get; set; } = string.Empty;

    public string? BreakdownJson { get; set; }
    public string Status { get; set; } = "New";
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UpdateEstimateStatusRequest
{
    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "New";

    [MaxLength(2000)]
    public string? AdminNotes { get; set; }
}
