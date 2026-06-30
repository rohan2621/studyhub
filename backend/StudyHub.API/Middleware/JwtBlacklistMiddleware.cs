using StackExchange.Redis;
using System.Security.Claims;

namespace StudyHub.API.Middleware;

public class JwtBlacklistMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, IConnectionMultiplexer redis)
    {
        if (ctx.User.Identity?.IsAuthenticated == true)
        {
            var jti = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (jti is not null)
            {
                var db = redis.GetDatabase();
                var blacklisted = await db.KeyExistsAsync($"blacklist:{jti}");
                if (blacklisted)
                {
                    ctx.Response.StatusCode = 401;
                    await ctx.Response.WriteAsJsonAsync(new
                    {
                        error = "Token has been revoked. Please log in again."
                    });
                    return;
                }
            }
        }
        await next(ctx);
    }
}