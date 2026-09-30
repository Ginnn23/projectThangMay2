using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public interface IEmailService
{
    Task<bool> SendEstimateQuotationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default);
}
