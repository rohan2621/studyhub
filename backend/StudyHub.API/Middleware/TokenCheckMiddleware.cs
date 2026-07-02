using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Helpers;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Middleware;

public class TokenCheckMiddleware(RequestDelegate next)
{
    // Routes that are always allowed even without an active token
    private static readonly HashSet<string> BypassPaths =
    [
        // ── Auth ─────────────────────────────────────────────────────────
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
        "/auth/logout",
        "/auth/forgot-password",
        "/auth/reset-password",
        "/auth/verify-email",

        // ── Token management (always accessible so they can activate) ────
        "/tokens/me",
        "/tokens/activate",
        "/tokens/activation",
        "/tokens/history",
        "/tokens/renewal",
        "/tokens/renewal/my",

        // ── Profile & account (change password etc. without a token) ─────
        "/profile",
        "/profile/change-password",
        "/profile/push-token",

        // ── School directory (needed for registration & display) ─────────
        "/schools",

        // ── Notifications (let users see even without active token) ───────
        "/notifications",

        // ── Announcements (school-wide comms viewable before token) ──────
        "/announcements",

        // ── Custom requests (let users submit even without a token) ───────
        "/custom-requests",

        // ── Infrastructure ────────────────────────────────────────────────
        "/health",
        "/swagger",
        "/hubs",
        "/hangfire",
    ];

    public async Task InvokeAsync(HttpContext ctx, AppDbContext db)
    {
        if (ctx.User.Identity?.IsAuthenticated != true)
        {
            await next(ctx);
            return;
        }

        var path = ctx.Request.Path.Value?.ToLower() ?? "";

        // Admins bypass token requirement entirely
        if (ctx.User.IsInRole("Admin"))
        {
            ctx.Items["previewOnly"] = false;
            await next(ctx);
            return;
        }

        // Always allow bypass paths
        if (IsBypassPath(path))
        {
            await next(ctx);
            return;
        }

        var userId = Guid.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deviceHeader = ctx.Request.Headers["X-Device-Id"].ToString();

        var token = await db.Tokens
            .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
            .OrderByDescending(t => t.IssuedAt)
            .FirstOrDefaultAsync();

        // ── No active token ──────────────────────────────────────────────
        if (token is null || token.ExpiresAt < DateTime.UtcNow)
        {
            ctx.Response.StatusCode = 402; // Payment Required
            await ctx.Response.WriteAsJsonAsync(new
            {
                error = "NO_ACTIVE_TOKEN",
                message = "You need an active token to access this feature. Please activate your token.",
                code = 402
            });
            return;
        }

        // ── Device binding check ─────────────────────────────────────────
        if (!string.IsNullOrEmpty(deviceHeader))
        {
            var hashedDevice = DeviceHasher.Hash(deviceHeader);

            if (token.DeviceId is null)
            {
                // Token not yet device-bound (shouldn't happen after activation, but handle gracefully)
                ctx.Items["previewOnly"] = false;
            }
            else if (token.DeviceId != hashedDevice)
            {
                ctx.Response.StatusCode = 403;
                await ctx.Response.WriteAsJsonAsync(new
                {
                    error = "DEVICE_MISMATCH",
                    message = "This token is active on a different device. Contact your admin to reset the device binding.",
                    code = 403
                });
                return;
            }
        }

        ctx.Items["previewOnly"] = false;
        await next(ctx);
    }

    private static bool IsBypassPath(string path)
    {
        foreach (var bypass in BypassPaths)
        {
            if (path.StartsWith(bypass, StringComparison.OrdinalIgnoreCase))
                return true;
        }
        return false;
    }
}