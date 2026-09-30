using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HaHongElevator.Api.Models;

public class ElevatorEstimate
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(254)]
    public string? Email { get; set; }

    [MaxLength(300)]
    public string? Address { get; set; }

    [Required]
    [MaxLength(100)]
    public string BuildingType { get; set; } = string.Empty;

    public int Stops { get; set; }

    public int CapacityKg { get; set; }

    [Required]
    [MaxLength(100)]
    public string ElevatorType { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string MotorBrand { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string DoorType { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal SpeedMps { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EstimatedPriceMin { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal EstimatedPriceMax { get; set; }

    public int ShaftWidth { get; set; }

    public int ShaftDepth { get; set; }

    public int CabinWidth { get; set; }

    public int CabinDepth { get; set; }

    public int PitDepth { get; set; }

    public int OverheadHeight { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MotorPowerKw { get; set; }

    [Required]
    [MaxLength(50)]
    public string PowerSupply { get; set; } = string.Empty;

    public string? BreakdownJson { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "New";

    [MaxLength(2000)]
    public string? AdminNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
