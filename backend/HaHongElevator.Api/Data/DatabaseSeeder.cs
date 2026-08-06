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
