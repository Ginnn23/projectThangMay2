using HaHongElevator.Api.Data;
using HaHongElevator.Api.DTOs.Contracts;
using HaHongElevator.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HaHongElevator.Api.Controllers;

[ApiController]
[Route("api/contracts")]
[Authorize(Roles = "Admin")]
public class ContractsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public ContractsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Executive Dashboard Analytics: 5 Core Metric Cards, Monthly Financial Charts & Conversion Funnel
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<ContractDashboardStatsResponse>> GetStats(
        [FromQuery] string? period,
        [FromQuery] int? year,
        [FromQuery] int? quarter,
        [FromQuery] int? month,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;

        // Determine date range filter
        DateTime? rangeStart = null;
        DateTime? rangeEnd = null;

        if (period == "year")
        {
            rangeStart = new DateTime(targetYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            rangeEnd = new DateTime(targetYear, 12, 31, 23, 59, 59, DateTimeKind.Utc);
        }
        else if (period == "quarter" && quarter.HasValue && quarter.Value >= 1 && quarter.Value <= 4)
        {
            int startMonth = (quarter.Value - 1) * 3 + 1;
            int endMonth = startMonth + 2;
            int daysInEndMonth = DateTime.DaysInMonth(targetYear, endMonth);
            rangeStart = new DateTime(targetYear, startMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            rangeEnd = new DateTime(targetYear, endMonth, daysInEndMonth, 23, 59, 59, DateTimeKind.Utc);
        }
        else if (period == "month" && month.HasValue && month.Value >= 1 && month.Value <= 12)
        {
            int daysInMonth = DateTime.DaysInMonth(targetYear, month.Value);
            rangeStart = new DateTime(targetYear, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            rangeEnd = new DateTime(targetYear, month.Value, daysInMonth, 23, 59, 59, DateTimeKind.Utc);
        }
        else if (fromDate.HasValue || toDate.HasValue)
        {
            rangeStart = fromDate.HasValue ? DateTime.SpecifyKind(fromDate.Value, DateTimeKind.Utc) : null;
            rangeEnd = toDate.HasValue ? DateTime.SpecifyKind(toDate.Value, DateTimeKind.Utc) : null;
        }

        // Base contracts query
        var contractsQuery = _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .AsNoTracking();

        if (rangeStart.HasValue)
        {
            contractsQuery = contractsQuery.Where(c => c.ContractDate >= rangeStart.Value);
        }
        if (rangeEnd.HasValue)
        {
            contractsQuery = contractsQuery.Where(c => c.ContractDate <= rangeEnd.Value);
        }

        var allFilteredContracts = await contractsQuery.ToListAsync(cancellationToken);
        // Exclude cancelled for financial revenue metrics
        var activeContracts = allFilteredContracts.Where(c => c.ProjectStatus != "TamDungHuy").ToList();

        // 5 Core Metric Cards
        decimal totalContractValue = activeContracts.Sum(c => c.TotalValue);
        decimal remainingDebt = activeContracts.Sum(c => c.RemainingAmount);
        decimal totalDeploymentCost = activeContracts.Sum(c => c.TotalCost);
        decimal expectedProfit = activeContracts.Sum(c => c.ExpectedProfit);

        // Payments query for actual cash collected in the selected period
        var paymentsQuery = _dbContext.ContractPayments.AsNoTracking();
        if (rangeStart.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.PaymentDate >= rangeStart.Value);
        }
        if (rangeEnd.HasValue)
        {
            paymentsQuery = paymentsQuery.Where(p => p.PaymentDate <= rangeEnd.Value);
        }
        var actualCollectedCash = await paymentsQuery.SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        // If no date range was specified ("all"), total paid equals sum of active contracts' TotalPaid
        if (string.IsNullOrEmpty(period) || period == "all")
        {
            actualCollectedCash = activeContracts.Sum(c => c.TotalPaid);
        }

        // Monthly breakdown (12 months of selected year or last 6 months)
        var monthlyStats = new List<MonthlyFinancialStat>();
        int displayMonths = 12;
        int chartYear = targetYear;

        // Load all contracts of chartYear and payments of chartYear
        var yearStart = new DateTime(chartYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd = new DateTime(chartYear, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var yearContracts = await _dbContext.ElevatorContracts
            .AsNoTracking()
            .Where(c => c.ContractDate >= yearStart && c.ContractDate <= yearEnd && c.ProjectStatus != "TamDungHuy")
            .ToListAsync(cancellationToken);

        var yearPayments = await _dbContext.ContractPayments
            .AsNoTracking()
            .Where(p => p.PaymentDate >= yearStart && p.PaymentDate <= yearEnd)
            .ToListAsync(cancellationToken);

        for (int m = 1; m <= displayMonths; m++)
        {
            var mStart = new DateTime(chartYear, m, 1, 0, 0, 0, DateTimeKind.Utc);
            var mEnd = new DateTime(chartYear, m, DateTime.DaysInMonth(chartYear, m), 23, 59, 59, DateTimeKind.Utc);

            var monthSigned = yearContracts.Where(c => c.ContractDate >= mStart && c.ContractDate <= mEnd).ToList();
            var monthPaid = yearPayments.Where(p => p.PaymentDate >= mStart && p.PaymentDate <= mEnd).Sum(p => p.Amount);

            decimal signedVal = monthSigned.Sum(c => c.TotalValue);
            decimal costVal = monthSigned.Sum(c => c.TotalCost);
            decimal profitVal = monthSigned.Sum(c => c.ExpectedProfit);
            decimal debtVal = monthSigned.Sum(c => c.RemainingAmount);

            monthlyStats.Add(new MonthlyFinancialStat
            {
                Month = $"{chartYear}-{m:D2}",
                Label = $"T{m}",
                SignedContractValue = signedVal,
                ActualCollectedCash = monthPaid,
                DeploymentCost = costVal,
                ExpectedProfit = profitVal,
                OutstandingDebt = debtVal,
                SignedCount = monthSigned.Count
            });
        }

        // Funnel calculation
        int contactRequestsCount = await _dbContext.ContactRequests.CountAsync(cancellationToken);
        int estimatesCount = await _dbContext.ElevatorEstimates.CountAsync(cancellationToken);
        int consultedCount = await _dbContext.ElevatorEstimates.CountAsync(e => e.Status == "Contacted" || e.Status == "SurveyScheduled" || e.Status == "DealClosed", cancellationToken)
                           + await _dbContext.ContactRequests.CountAsync(c => c.Status == "Processed" || c.Status == "Contacted", cancellationToken);
        
        int allContractsCount = await _dbContext.ElevatorContracts.CountAsync(cancellationToken);
        int depositedCount = await _dbContext.ElevatorContracts.CountAsync(c => c.PaymentStatus != "ChuaDatCoc" || c.DepositAmount > 0, cancellationToken);
        int deployingCount = await _dbContext.ElevatorContracts.CountAsync(c => c.ProjectStatus == "DangNhapThietBi" || c.ProjectStatus == "DangLapDat" || c.ProjectStatus == "ChoNghiemThu" || c.ProjectStatus == "DaBanGiao" || c.ProjectStatus == "HoanTat", cancellationToken);
        int handedOverCount = await _dbContext.ElevatorContracts.CountAsync(c => c.ProjectStatus == "DaBanGiao" || c.ProjectStatus == "HoanTat", cancellationToken);
        int fullyPaidCount = await _dbContext.ElevatorContracts.CountAsync(c => c.PaymentStatus == "ThanhToanDu" || c.ProjectStatus == "HoanTat", cancellationToken);

        int baseCount = Math.Max(contactRequestsCount + estimatesCount, 1);

        var funnel = new List<FunnelStep>
        {
            new() { Step = 1, Key = "Leads", Name = "Yêu cầu tư vấn", Count = contactRequestsCount, Percentage = 100, Description = "Khách gửi liên hệ & để lại SĐT qua website" },
            new() { Step = 2, Key = "Estimates", Name = "Đã lập dự toán", Count = estimatesCount, Percentage = Math.Min(100, Math.Round((decimal)estimatesCount / baseCount * 100, 1)), Description = "Khách tự tính toán cấu hình & chi phí thang máy" },
            new() { Step = 3, Key = "Consulted", Name = "Đã liên hệ tư vấn", Count = consultedCount, Percentage = Math.Min(100, Math.Round((decimal)consultedCount / baseCount * 100, 1)), Description = "Kỹ sư gọi điện & hẹn lịch khảo sát thực tế hố thang" },
            new() { Step = 4, Key = "Signed", Name = "Đã ký hợp đồng", Count = allContractsCount, Percentage = Math.Min(100, Math.Round((decimal)allContractsCount / baseCount * 100, 1)), Description = "Thống nhất phương án và ký hợp đồng mua bán, lắp đặt" },
            new() { Step = 5, Key = "Deposited", Name = "Đã đặt cọc", Count = depositedCount, Percentage = Math.Min(100, Math.Round((decimal)depositedCount / baseCount * 100, 1)), Description = "Khách thanh toán đợt 1 (thường 50% giá trị hợp đồng)" },
            new() { Step = 6, Key = "Deploying", Name = "Đang triển khai", Count = deployingCount, Percentage = Math.Min(100, Math.Round((decimal)deployingCount / baseCount * 100, 1)), Description = "Nhập động cơ/tủ điện, cơ khí hóa và lắp đặt tại công trình" },
            new() { Step = 7, Key = "HandedOver", Name = "Nghiệm thu bàn giao", Count = handedOverCount, Percentage = Math.Min(100, Math.Round((decimal)handedOverCount / baseCount * 100, 1)), Description = "Kiểm định nhà nước an toàn & bàn giao chìa khóa cho chủ nhà" },
            new() { Step = 8, Key = "FullyPaid", Name = "Hoàn tất thanh toán", Count = fullyPaidCount, Percentage = Math.Min(100, Math.Round((decimal)fullyPaidCount / baseCount * 100, 1)), Description = "Thu đủ 100% dòng tiền & chuyển sang chế độ bảo hành 24 tháng" }
        };

        // Project Status distribution
        var projectStatusMap = new Dictionary<string, string>
        {
            { "ChoDatCoc", "Chờ đặt cọc" },
            { "DaNhanCoc", "Đã nhận cọc" },
            { "DangNhapThietBi", "Đang nhập thiết bị" },
            { "DangLapDat", "Đang lắp đặt" },
            { "ChoNghiemThu", "Chờ nghiệm thu" },
            { "DaBanGiao", "Đã bàn giao" },
            { "HoanTat", "Hoàn tất" },
            { "TamDungHuy", "Tạm dừng / Hủy" }
        };

        var projectDist = projectStatusMap.Select(kv => new StatusDistributionItem
        {
            Key = kv.Key,
            Label = kv.Value,
            Count = allFilteredContracts.Count(c => c.ProjectStatus == kv.Key),
            TotalAmount = allFilteredContracts.Where(c => c.ProjectStatus == kv.Key).Sum(c => c.TotalValue)
        }).ToList();

        // Payment Status distribution
        var paymentStatusMap = new Dictionary<string, string>
        {
            { "ChuaDatCoc", "Chưa đặt cọc" },
            { "DaDatCoc", "Đã đặt cọc" },
            { "ThanhToanMotPhan", "Thanh toán một phần" },
            { "ThanhToanDu", "Đã thanh toán đủ" },
            { "QuaHan", "Quá hạn thanh toán" }
        };

        var paymentDist = paymentStatusMap.Select(kv => new StatusDistributionItem
        {
            Key = kv.Key,
            Label = kv.Value,
            Count = allFilteredContracts.Count(c => c.PaymentStatus == kv.Key),
            TotalAmount = allFilteredContracts.Where(c => c.PaymentStatus == kv.Key).Sum(c => c.TotalValue)
        }).ToList();

        var response = new ContractDashboardStatsResponse
        {
            TotalContractValue = totalContractValue,
            TotalPaid = actualCollectedCash,
            RemainingDebt = remainingDebt,
            TotalDeploymentCost = totalDeploymentCost,
            ExpectedProfit = expectedProfit,
            TotalContractsCount = activeContracts.Count,
            CompletedContractsCount = activeContracts.Count(c => c.ProjectStatus == "HoanTat" || c.ProjectStatus == "DaBanGiao"),
            InProgressContractsCount = activeContracts.Count(c => c.ProjectStatus == "DangNhapThietBi" || c.ProjectStatus == "DangLapDat" || c.ProjectStatus == "ChoNghiemThu"),
            MonthlyStats = monthlyStats,
            FunnelSteps = funnel,
            ProjectStatusDistribution = projectDist,
            PaymentStatusDistribution = paymentDist
        };

        return Ok(response);
    }

    /// <summary>
    /// List all contracts with optional filters and search
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ContractResponse>>> GetContracts(
        [FromQuery] string? search,
        [FromQuery] string? paymentStatus,
        [FromQuery] string? projectStatus,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(c =>
                c.ContractCode.ToLower().Contains(term) ||
                c.CustomerName.ToLower().Contains(term) ||
                c.ProjectName.ToLower().Contains(term) ||
                c.PhoneNumber.Contains(term) ||
                (c.Address != null && c.Address.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(paymentStatus) && paymentStatus != "all")
        {
            query = query.Where(c => c.PaymentStatus == paymentStatus);
        }

        if (!string.IsNullOrWhiteSpace(projectStatus) && projectStatus != "all")
        {
            query = query.Where(c => c.ProjectStatus == projectStatus);
        }

        var contracts = await query
            .OrderByDescending(c => c.ContractDate)
            .ToListAsync(cancellationToken);

        bool needsSave = false;
        foreach (var c in contracts)
        {
            var oldDep = c.DepositAmount;
            var oldAdd = c.AdditionalPaidAmount;
            var oldRem = c.RemainingAmount;
            var oldStatus = c.PaymentStatus;
            c.RecalculateFinancials();
            if (c.DepositAmount != oldDep || c.AdditionalPaidAmount != oldAdd || c.RemainingAmount != oldRem || c.PaymentStatus != oldStatus)
            {
                _dbContext.Attach(c).State = EntityState.Modified;
                needsSave = true;
            }
        }
        if (needsSave)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Ok(contracts.Select(MapToResponse).ToList());
    }

    /// <summary>
    /// Get single contract with its full payments ledger
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ContractResponse>> GetContractById(int id, CancellationToken cancellationToken)
    {
        var contract = await _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (contract == null)
        {
            return NotFound(new { message = "Không tìm thấy hợp đồng." });
        }

        return Ok(MapToResponse(contract));
    }

    /// <summary>
    /// Create new contract manually
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContractResponse>> CreateContract([FromBody] CreateContractRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        string code = request.ContractCode.Trim();
        if (string.IsNullOrWhiteSpace(code))
        {
            int nextNumber = await _dbContext.ElevatorContracts.CountAsync(cancellationToken) + 1;
            code = $"HD-HH-{DateTime.UtcNow:yyyy}-{nextNumber:D3}";
        }

        // Check if code exists
        if (await _dbContext.ElevatorContracts.AnyAsync(c => c.ContractCode == code, cancellationToken))
        {
            return BadRequest(new { message = $"Mã hợp đồng '{code}' đã tồn tại trong hệ thống." });
        }

        var contract = new ElevatorContract
        {
            ContractCode = code,
            CustomerName = request.CustomerName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant(),
            ProjectName = request.ProjectName.Trim(),
            Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim(),
            ElevatorType = request.ElevatorType,
            Stops = request.Stops,
            CapacityKg = request.CapacityKg,
            MotorBrand = request.MotorBrand,
            DoorType = request.DoorType,
            ContractDate = DateTime.SpecifyKind(request.ContractDate, DateTimeKind.Utc),
            ExpectedDeliveryDate = request.ExpectedDeliveryDate.HasValue ? DateTime.SpecifyKind(request.ExpectedDeliveryDate.Value, DateTimeKind.Utc) : null,
            TotalValue = request.TotalValue,
            DepositRate = request.DepositRate,
            DepositAmount = request.InitialDepositAmount,
            CostEquipment = request.CostEquipment,
            CostShipping = request.CostShipping,
            CostInstallation = request.CostInstallation,
            CostOther = request.CostOther,
            PaymentStatus = request.PaymentStatus,
            ProjectStatus = request.ProjectStatus,
            EstimateId = request.EstimateId,
            AdminNotes = request.AdminNotes
        };

        contract.RecalculateFinancials();

        // If initial deposit amount > 0, record first payment transaction
        if (request.InitialDepositAmount > 0)
        {
            contract.Payments.Add(new ContractPayment
            {
                PaymentDate = contract.ContractDate,
                Amount = request.InitialDepositAmount,
                PaymentMethod = "Chuyển khoản",
                Stage = $"Đặt cọc đợt 1 ({request.DepositRate}%)",
                Note = "Tiền đặt cọc khi ký hợp đồng",
                CreatedBy = User?.Identity?.Name ?? "Admin"
            });
            contract.RecalculateFinancials();
        }

        _dbContext.ElevatorContracts.Add(contract);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetContractById), new { id = contract.Id }, MapToResponse(contract));
    }

    /// <summary>
    /// Convert an existing Estimate to a Contract
    /// </summary>
    [HttpPost("from-estimate/{estimateId:int}")]
    public async Task<ActionResult<ContractResponse>> CreateFromEstimate(int estimateId, CancellationToken cancellationToken)
    {
        var estimate = await _dbContext.ElevatorEstimates.FindAsync([estimateId], cancellationToken);
        if (estimate == null)
        {
            return NotFound(new { message = "Không tìm thấy dự toán nguồn." });
        }

        int count = await _dbContext.ElevatorContracts.CountAsync(cancellationToken) + 1;
        string code = $"HD-HH-{DateTime.UtcNow:yyyy}-{count:D3}";

        decimal totalVal = (estimate.EstimatedPriceMin + estimate.EstimatedPriceMax) / 2;
        // Industry benchmark: equipment ~55%, shipping ~3%, installation ~8%, contingency ~4%
        decimal costEquip = Math.Round(totalVal * 0.55m);
        decimal costShip = Math.Round(totalVal * 0.03m);
        decimal costInst = Math.Round(totalVal * 0.08m);
        decimal costOther = Math.Round(totalVal * 0.04m);

        var contract = new ElevatorContract
        {
            ContractCode = code,
            CustomerName = estimate.CustomerName,
            PhoneNumber = estimate.PhoneNumber,
            Email = estimate.Email,
            ProjectName = $"Công trình {estimate.CustomerName} - {estimate.BuildingType}",
            Address = estimate.Address,
            ElevatorType = estimate.ElevatorType,
            Stops = estimate.Stops,
            CapacityKg = estimate.CapacityKg,
            MotorBrand = estimate.MotorBrand,
            DoorType = estimate.DoorType,
            ContractDate = DateTime.UtcNow,
            ExpectedDeliveryDate = DateTime.UtcNow.AddDays(45),
            TotalValue = totalVal,
            DepositRate = 50.0m,
            CostEquipment = costEquip,
            CostShipping = costShip,
            CostInstallation = costInst,
            CostOther = costOther,
            PaymentStatus = "ChuaDatCoc",
            ProjectStatus = "ChoDatCoc",
            EstimateId = estimate.Id,
            AdminNotes = $"Chuyển đổi từ dự toán #{estimate.Id}. {estimate.AdminNotes}"
        };

        contract.RecalculateFinancials();
        _dbContext.ElevatorContracts.Add(contract);

        // Update estimate status
        estimate.Status = "DealClosed";
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(contract));
    }

    /// <summary>
    /// Update contract details, costs, and progress
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ContractResponse>> UpdateContract(int id, [FromBody] UpdateContractRequest request, CancellationToken cancellationToken)
    {
        var contract = await _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (contract == null)
        {
            return NotFound(new { message = "Không tìm thấy hợp đồng." });
        }

        contract.CustomerName = request.CustomerName.Trim();
        contract.PhoneNumber = request.PhoneNumber.Trim();
        contract.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        contract.ProjectName = request.ProjectName.Trim();
        contract.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
        contract.ElevatorType = request.ElevatorType;
        contract.Stops = request.Stops;
        contract.CapacityKg = request.CapacityKg;
        contract.MotorBrand = request.MotorBrand;
        contract.DoorType = request.DoorType;

        contract.ContractDate = DateTime.SpecifyKind(request.ContractDate, DateTimeKind.Utc);
        contract.ExpectedDeliveryDate = request.ExpectedDeliveryDate.HasValue ? DateTime.SpecifyKind(request.ExpectedDeliveryDate.Value, DateTimeKind.Utc) : null;
        contract.ActualDeliveryDate = request.ActualDeliveryDate.HasValue ? DateTime.SpecifyKind(request.ActualDeliveryDate.Value, DateTimeKind.Utc) : null;

        contract.TotalValue = request.TotalValue;
        contract.DepositRate = request.DepositRate;
        contract.CostEquipment = request.CostEquipment;
        contract.CostShipping = request.CostShipping;
        contract.CostInstallation = request.CostInstallation;
        contract.CostOther = request.CostOther;

        if (!string.IsNullOrWhiteSpace(request.PaymentStatus))
        {
            contract.PaymentStatus = request.PaymentStatus;
        }

        if (!string.IsNullOrWhiteSpace(request.ProjectStatus))
        {
            contract.ProjectStatus = request.ProjectStatus;
        }

        contract.AdminNotes = request.AdminNotes;

        contract.RecalculateFinancials();
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(contract));
    }

    /// <summary>
    /// Add an installment payment to a contract (recalculates balances and statuses)
    /// </summary>
    [HttpPost("{id:int}/payments")]
    public async Task<ActionResult<ContractResponse>> AddPayment(int id, [FromBody] AddPaymentRequest request, CancellationToken cancellationToken)
    {
        var contract = await _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (contract == null)
        {
            return NotFound(new { message = "Không tìm thấy hợp đồng." });
        }

        var payment = new ContractPayment
        {
            ContractId = contract.Id,
            PaymentDate = DateTime.SpecifyKind(request.PaymentDate, DateTimeKind.Utc),
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            Stage = request.Stage,
            ReceiptCode = request.ReceiptCode,
            Note = request.Note,
            CreatedBy = User?.Identity?.Name ?? "Admin"
        };

        contract.Payments.Add(payment);
        contract.RecalculateFinancials();

        // Advance project status if receiving deposit for the first time
        if (contract.ProjectStatus == "ChoDatCoc" && contract.TotalPaid > 0)
        {
            contract.ProjectStatus = "DaNhanCoc";
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(contract));
    }

    /// <summary>
    /// Delete a payment installment
    /// </summary>
    [HttpDelete("{id:int}/payments/{paymentId:int}")]
    public async Task<ActionResult<ContractResponse>> DeletePayment(int id, int paymentId, CancellationToken cancellationToken)
    {
        var contract = await _dbContext.ElevatorContracts
            .Include(c => c.Payments)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (contract == null)
        {
            return NotFound(new { message = "Không tìm thấy hợp đồng." });
        }

        var payment = contract.Payments.FirstOrDefault(p => p.Id == paymentId);
        if (payment == null)
        {
            return NotFound(new { message = "Không tìm thấy đợt thanh toán." });
        }

        contract.Payments.Remove(payment);
        contract.RecalculateFinancials();

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(MapToResponse(contract));
    }

    /// <summary>
    /// Delete contract
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContract(int id, CancellationToken cancellationToken)
    {
        var contract = await _dbContext.ElevatorContracts.FindAsync([id], cancellationToken);
        if (contract == null)
        {
            return NotFound(new { message = "Không tìm thấy hợp đồng." });
        }

        _dbContext.ElevatorContracts.Remove(contract);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static ContractResponse MapToResponse(ElevatorContract c)
    {
        return new ContractResponse
        {
            Id = c.Id,
            ContractCode = c.ContractCode,
            CustomerName = c.CustomerName,
            PhoneNumber = c.PhoneNumber,
            Email = c.Email,
            ProjectName = c.ProjectName,
            Address = c.Address,
            ElevatorType = c.ElevatorType,
            Stops = c.Stops,
            CapacityKg = c.CapacityKg,
            MotorBrand = c.MotorBrand,
            DoorType = c.DoorType,
            ContractDate = c.ContractDate,
            ExpectedDeliveryDate = c.ExpectedDeliveryDate,
            ActualDeliveryDate = c.ActualDeliveryDate,
            TotalValue = c.TotalValue,
            DepositRate = c.DepositRate,
            DepositAmount = c.DepositAmount,
            AdditionalPaidAmount = c.AdditionalPaidAmount,
            TotalPaid = c.TotalPaid,
            RemainingAmount = c.RemainingAmount,
            CostEquipment = c.CostEquipment,
            CostShipping = c.CostShipping,
            CostInstallation = c.CostInstallation,
            CostOther = c.CostOther,
            TotalCost = c.TotalCost,
            ExpectedProfit = c.ExpectedProfit,
            PaymentStatus = c.PaymentStatus,
            ProjectStatus = c.ProjectStatus,
            EstimateId = c.EstimateId,
            AdminNotes = c.AdminNotes,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            Payments = c.Payments?.Select(p => new PaymentResponse
            {
                Id = p.Id,
                ContractId = p.ContractId,
                PaymentDate = p.PaymentDate,
                Amount = p.Amount,
                PaymentMethod = p.PaymentMethod,
                Stage = p.Stage,
                ReceiptCode = p.ReceiptCode,
                Note = p.Note,
                CreatedBy = p.CreatedBy,
                CreatedAt = p.CreatedAt
            }).OrderBy(p => p.PaymentDate).ToList() ?? []
        };
    }
}
