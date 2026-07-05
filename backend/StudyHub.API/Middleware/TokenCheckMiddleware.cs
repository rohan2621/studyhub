using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
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
        "/tokens/bind-permanent",

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
        "/ping",
        "/health",
        "/swagger",
        "/hubs",
        "/hangfire",

        // ── Feed (bypassed so dashboard metadata loads for inactive users) 
        "/feed",
    ];

    public async Task InvokeAsync(HttpContext ctx, AppDbContext db, IMemoryCache cache)
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

        var cacheKey = $"active_token_{userId}";
        if (!cache.TryGetValue(cacheKey, out CachedTokenResult? cachedResult))
        {
            var dbToken = await db.Tokens
                .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
                .OrderByDescending(t => t.IssuedAt)
                .FirstOrDefaultAsync();

            cachedResult = new CachedTokenResult { Token = dbToken };
            cache.Set(cacheKey, cachedResult, TimeSpan.FromSeconds(60));
        }

        var token = cachedResult?.Token;

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

        // ── Network & Device binding check ──────────────────────────────
        if (token.IsDevicePermanent)
        {
            // Permanent device = unrestricted access from any device/network
            ctx.Items["previewOnly"] = false;
            await next(ctx);
            return;
        }

        // Non-permanent tokens: only allow access from the same network
        var clientIp = ctx.Connection.RemoteIpAddress?.ToString();
        var isSameNetwork = !string.IsNullOrEmpty(token.IpAddress) && token.IpAddress == clientIp;

        if (!isSameNetwork)
        {
            ctx.Response.StatusCode = 403;
            await ctx.Response.WriteAsJsonAsync(new
            {
                error = "DEVICE_MISMATCH",
                message = "This token is active on a different network. You can register this device permanently to access it on any network.",
                code = 403
            });
            return;
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

public class CachedTokenResult
{
    public Token? Token { get; set; }
}