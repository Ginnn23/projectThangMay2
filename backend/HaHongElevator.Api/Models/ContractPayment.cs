using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HaHongElevator.Api.Models;

public class ContractPayment
{
    [Key]
    public int Id { get; set; }

    public int ContractId { get; set; }

    [JsonIgnore]
    public ElevatorContract? Contract { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "Chuyển khoản"; // Chuyển khoản, Tiền mặt, Thẻ

    [Required]
    [MaxLength(100)]
    public string Stage { get; set; } = "Đặt cọc đợt 1 (50%)";

    [MaxLength(100)]
    public string? ReceiptCode { get; set; } // Mã ủy nhiệm chi / phiếu thu

    [MaxLength(1000)]
    public string? Note { get; set; }

    [MaxLength(100)]
    public string? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
