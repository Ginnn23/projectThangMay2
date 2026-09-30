using HaHongElevator.Api.Models;

namespace HaHongElevator.Api.Services;

public record EmailSendResult(bool Success, string? ErrorMessage = null);

public interface IEmailService
{
    Task<EmailSendResult> SendEstimateQuotationAsync(ElevatorEstimate estimate, CancellationToken cancellationToken = default);
    byte[] GenerateQuotationPdf(ElevatorEstimate estimate);
}

