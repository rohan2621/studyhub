using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;

namespace StudyHub.API.Jobs;

public class TokenExpiryJob(AppDbContext db, EmailService emailService, ILogger<TokenExpiryJob> logger)
{
    public async Task RunAsync()
    {
        var now = DateTime.UtcNow;

        // Expire tokens past their expiry date
        var expired = await db.Tokens
            .Include(t => t.User)
            .Where(t => t.Status == TokenStatus.Active && t.ExpiresAt < now)
            .ToListAsync();

        foreach (var token in expired)
        {
            token.Status = TokenStatus.Expired;
            logger.LogInformation("Token {Code} expired for user {Email}", token.Code, token.User.Email);
        }

        if (expired.Count > 0)
            await db.SaveChangesAsync();

        // Send 7-day reminder
        await SendReminders(now, 7);

        // Send 3-day reminder
        await SendReminders(now, 3);

        // Send 1-day reminder
        await SendReminders(now, 1);
    }

    private async Task SendReminders(DateTime now, int daysLeft)
    {
        var targetDate = now.AddDays(daysLeft);
        var windowStart = targetDate.Date;
        var windowEnd = windowStart.AddDays(1);

        var tokensExpiringSoon = await db.Tokens
            .Include(t => t.User)
            .Where(t =>
                t.Status == TokenStatus.Active &&
                t.ExpiresAt >= windowStart &&
                t.ExpiresAt < windowEnd)
            .ToListAsync();

        foreach (var token in tokensExpiringSoon)
        {
            try
            {
                await emailService.SendTokenExpiryReminderAsync(
                    token.User.Email,
                    token.User.Name,
                    daysLeft);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send expiry reminder to {Email}", token.User.Email);
            }
        }
    }
}