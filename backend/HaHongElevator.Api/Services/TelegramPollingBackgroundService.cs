namespace HaHongElevator.Api.Services;

public class TelegramPollingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<TelegramPollingBackgroundService> _logger;

    public TelegramPollingBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<TelegramPollingBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Telegram Polling Background Service starting...");

        // Ensure database tables are created after startup
        try
        {
            await Task.Delay(4000, stoppingToken);
            using var initScope = _scopeFactory.CreateScope();
            var liveChatService = initScope.ServiceProvider.GetRequiredService<ITelegramLiveChatService>();
            await liveChatService.EnsureTablesAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Initial table ensure failed in TelegramPollingBackgroundService.");
        }

        long offset = 0;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var loopScope = _scopeFactory.CreateScope();
                var liveChatService = loopScope.ServiceProvider.GetRequiredService<ITelegramLiveChatService>();

                var updates = await liveChatService.FetchUpdatesAsync(offset, stoppingToken);
                if (updates != null && updates.Count > 0)
                {
                    foreach (var update in updates)
                    {
                        if (update.UpdateId >= offset)
                        {
                            offset = update.UpdateId + 1;
                        }
                        await liveChatService.ProcessIncomingUpdateAsync(update, stoppingToken);
                    }
                }
                else
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in Telegram Polling loop. Pausing 3s before retry...");
                try
                {
                    await Task.Delay(3000, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        _logger.LogInformation("Telegram Polling Background Service stopped.");
    }
}
