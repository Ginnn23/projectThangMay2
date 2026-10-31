using System.ComponentModel.DataAnnotations;

namespace HaHongElevator.Api.DTOs.Contracts;

public class PaymentResponse
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public DateTime PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public string? ReceiptCode { get; set; }
    public string? Note { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ContractResponse
{
    public int Id { get; set; }
    public string ContractCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? ElevatorType { get; set; }
    public int Stops { get; set; }
    public int CapacityKg { get; set; }
    public string? MotorBrand { get; set; }
    public string? DoorType { get; set; }

    public DateTime ContractDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }

    // Financials
    public decimal TotalValue { get; set; }
    public decimal DepositRate { get; set; }
    public decimal DepositAmount { get; set; }
    public decimal AdditionalPaidAmount { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal RemainingAmount { get; set; }

    // Costs & Profit
    public decimal CostEquipment { get; set; }
    public decimal CostShipping { get; set; }
    public decimal CostInstallation { get; set; }
    public decimal CostOther { get; set; }
    public decimal TotalCost { get; set; }
    public decimal ExpectedProfit { get; set; }

    // Statuses
    public string PaymentStatus { get; set; } = string.Empty;
    public string ProjectStatus { get; set; } = string.Empty;

    public int? EstimateId { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<PaymentResponse> Payments { get; set; } = [];
}

public class CreateContractRequest
{
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
    public string? MotorBrand { get; set; }
    public string? DoorType { get; set; }

    public DateTime ContractDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedDeliveryDate { get; set; }

    public decimal TotalValue { get; set; }
    public decimal DepositRate { get; set; } = 50.0m;
    public decimal InitialDepositAmount { get; set; } = 0;

    public decimal CostEquipment { get; set; }
    public decimal CostShipping { get; set; }
    public decimal CostInstallation { get; set; }
    public decimal CostOther { get; set; }

    public string PaymentStatus { get; set; } = "ChuaDatCoc";
    public string ProjectStatus { get; set; } = "ChoDatCoc";

    public int? EstimateId { get; set; }
    public string? AdminNotes { get; set; }
}

public class UpdateContractRequest
{
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

    public int Stops { get; set; }
    public int CapacityKg { get; set; }
    public string? MotorBrand { get; set; }
    public string? DoorType { get; set; }

    public DateTime ContractDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }

    public decimal TotalValue { get; set; }
    public decimal DepositRate { get; set; }

    public decimal CostEquipment { get; set; }
    public decimal CostShipping { get; set; }
    public decimal CostInstallation { get; set; }
    public decimal CostOther { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;
    public string ProjectStatus { get; set; } = string.Empty;

    public string? AdminNotes { get; set; }
}

public class AddPaymentRequest
{
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [Range(1000, 100000000000)]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "Chuyển khoản"; // Chuyển khoản, Tiền mặt, Thẻ

    [Required]
    [MaxLength(100)]
    public string Stage { get; set; } = "Đặt cọc đợt 1 (50%)";

    [MaxLength(100)]
    public string? ReceiptCode { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }
}

public class MonthlyFinancialStat
{
    public string Month { get; set; } = string.Empty; // "2026-05"
    public string Label { get; set; } = string.Empty; // "T5/2026"
    public decimal SignedContractValue { get; set; } // Giá trị HĐ ký trong tháng
    public decimal ActualCollectedCash { get; set; } // Tiền thực tế đã thu trong tháng (dựa trên PaymentDate)
    public decimal DeploymentCost { get; set; } // Chi phí triển khai
    public decimal ExpectedProfit { get; set; } // Lợi nhuận
    public decimal OutstandingDebt { get; set; } // Công nợ tích lũy chưa thu
    public int SignedCount { get; set; }
}

public class FunnelStep
{
    public int Step { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class StatusDistributionItem
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
}

public class ContractDashboardStatsResponse
{
    // 5 Core Metric Cards
    public decimal TotalContractValue { get; set; } // 1. Tổng giá trị hợp đồng đã ký
    public decimal TotalPaid { get; set; }          // 2. Tiền thực tế đã thu
    public decimal RemainingDebt { get; set; }      // 3. Công nợ phải thu
    public decimal TotalDeploymentCost { get; set; }// 4. Chi phí triển khai
    public decimal ExpectedProfit { get; set; }      // 5. Lợi nhuận dự kiến

    public int TotalContractsCount { get; set; }
    public int CompletedContractsCount { get; set; }
    public int InProgressContractsCount { get; set; }

    public List<MonthlyFinancialStat> MonthlyStats { get; set; } = [];
    public List<FunnelStep> FunnelSteps { get; set; } = [];
    public List<StatusDistributionItem> ProjectStatusDistribution { get; set; } = [];
    public List<StatusDistributionItem> PaymentStatusDistribution { get; set; } = [];
}
