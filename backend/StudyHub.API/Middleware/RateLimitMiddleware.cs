using StackExchange.Redis;

namespace StudyHub.API.Middleware;

public class RateLimitMiddleware(RequestDelegate next)
{
    private static readonly Dictionary<string, (int limit, int windowSeconds)> Rules = new()
    {
        { "/auth/login",    (10, 60) },
        { "/auth/signup",   (5,  60) },
        { "/auth/refresh",  (20, 60) },
        { "/tokens/activate", (5, 300) },
    };

    public async Task InvokeAsync(HttpContext ctx, IConnectionMultiplexer redis)
    {
        var path = ctx.Request.Path.Value?.ToLower() ?? "";
        var rule = Rules.FirstOrDefault(r => path.StartsWith(r.Key));

        if (rule.Key is not null)
        {
            var ip = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var key = $"rl:{rule.Key}:{ip}";
            var db = redis.GetDatabase();

            var count = await db.StringIncrementAsync(key);
            if (count == 1)
            {
                await db.KeyExpireAsync(key, TimeSpan.FromSeconds(rule.Value.windowSeconds));
            }
            else
            {
                var ttl = await db.KeyTimeToLiveAsync(key);
                if (ttl == null || ttl.Value.TotalSeconds < 0)
                {
                    await db.KeyExpireAsync(key, TimeSpan.FromSeconds(rule.Value.windowSeconds));
                }
            }

            if (count > rule.Value.limit)
            {
                ctx.Response.StatusCode = 429;
                await ctx.Response.WriteAsJsonAsync(new
                {
                    error = "Too many requests. Please slow down.",
                    retryAfterSeconds = rule.Value.windowSeconds
                });
                return;
            }
        }

        await next(ctx);
    }
}