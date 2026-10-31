using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HaHongElevator.Api.Models;

public class ElevatorContract
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string ContractCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(254)]
    public string? Email { get; set; }

    [Required]
    [MaxLength(220)]
    public string ProjectName { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? ElevatorType { get; set; }

    public int Stops { get; set; } = 4;

    public int CapacityKg { get; set; } = 450;

    [MaxLength(100)]
    public string? MotorBrand { get; set; }

    [MaxLength(100)]
    public string? DoorType { get; set; }

    public DateTime ContractDate { get; set; } = DateTime.UtcNow;

    public DateTime? ExpectedDeliveryDate { get; set; }

    public DateTime? ActualDeliveryDate { get; set; }

    // --- Financial Metrics ---
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalValue { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal DepositRate { get; set; } = 50.0m;

    [Column(TypeName = "decimal(18,2)")]
    public decimal DepositAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AdditionalPaidAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPaid { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal RemainingAmount { get; set; }

    // --- Deployment Costs ---
    [Column(TypeName = "decimal(18,2)")]
    public decimal CostEquipment { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CostShipping { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CostInstallation { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CostOther { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalCost { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ExpectedProfit { get; set; }

    // --- Statuses ---
    // PaymentStatus: ChuaDatCoc, DaDatCoc, ThanhToanMotPhan, ThanhToanDu, QuaHan
    [Required]
    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "ChuaDatCoc";

    // ProjectStatus: ChoDatCoc, DaNhanCoc, DangNhapThietBi, DangLapDat, ChoNghiemThu, DaBanGiao, HoanTat, TamDungHuy
    [Required]
    [MaxLength(50)]
    public string ProjectStatus { get; set; } = "ChoDatCoc";

    public int? EstimateId { get; set; }

    [MaxLength(2000)]
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Relationships
    public List<ContractPayment> Payments { get; set; } = new();

    public void RecalculateFinancials()
    {
        TotalCost = CostEquipment + CostShipping + CostInstallation + CostOther;
        ExpectedProfit = TotalValue - TotalCost;

        decimal requiredDeposit = TotalValue > 0 ? Math.Round(TotalValue * (DepositRate / 100.0m)) : 0m;

        if (Payments != null && Payments.Count > 0)
        {
            TotalPaid = Payments.Sum(p => p.Amount);

            // Phân bổ chuẩn hóa giữa Tiền Cọc và Tiền Đóng Thêm:
            // Tiền cọc tối đa không vượt quá mức cọc quy định theo hợp đồng (VD: 50% = 430Tr)
            // Toàn bộ phần thanh toán vượt mức cọc sẽ được tính vào Tiền Đóng Thêm
            if (TotalPaid >= requiredDeposit)
            {
                DepositAmount = requiredDeposit;
                AdditionalPaidAmount = TotalPaid - requiredDeposit;
            }
            else
            {
                DepositAmount = TotalPaid;
                AdditionalPaidAmount = 0m;
            }
        }
        else
        {
            if (DepositAmount > requiredDeposit && TotalValue > 0)
            {
                AdditionalPaidAmount += (DepositAmount - requiredDeposit);
                DepositAmount = requiredDeposit;
            }
            TotalPaid = DepositAmount + AdditionalPaidAmount;
        }

        RemainingAmount = Math.Max(0, TotalValue - TotalPaid);

        // Update PaymentStatus automatically if not manually set to QuaHan
        if (PaymentStatus != "QuaHan")
        {
            if (TotalPaid >= TotalValue && TotalValue > 0)
            {
                PaymentStatus = "ThanhToanDu";
            }
            else if (TotalPaid >= requiredDeposit && TotalPaid > 0)
            {
                PaymentStatus = "ThanhToanMotPhan";
            }
            else if (TotalPaid > 0 || DepositAmount > 0)
            {
                PaymentStatus = "DaDatCoc";
            }
            else
            {
                PaymentStatus = "ChuaDatCoc";
            }
        }
    }
}
