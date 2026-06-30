using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Helpers;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Middleware;

public class TokenCheckMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, AppDbContext db)
    {
        if (ctx.User.Identity?.IsAuthenticated == true)
        {
            var userId = Guid.Parse(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var deviceHeader = ctx.Request.Headers["X-Device-Id"].ToString();

            var token = await db.Tokens
                .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
                .OrderByDescending(t => t.IssuedAt)
                .FirstOrDefaultAsync();

            if (token is null || token.ExpiresAt < DateTime.UtcNow)
            {
                ctx.Items["previewOnly"] = true;
            }
            else if (!string.IsNullOrEmpty(deviceHeader) &&
                     token.DeviceId != DeviceHasher.Hash(deviceHeader))
            {
                ctx.Response.StatusCode = 403;
                await ctx.Response.WriteAsJsonAsync(new
                {
                    error = "DEVICE_MISMATCH",
                    message = "This token is active on a different device. Contact support to reset it."
                });
                return;
            }
            else
            {
                ctx.Items["previewOnly"] = false;
            }
        }

        await next(ctx);
    }
}