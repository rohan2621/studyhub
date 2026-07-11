namespace StudyHub.API.Middleware;

public class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, IWebHostEnvironment env)
    {
        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Response.Headers["X-Frame-Options"] = "DENY";
        ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        ctx.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        if (env.IsProduction())
        {
            ctx.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        }

        // Prevent caching for API responses unless explicitly overridden
        if (ctx.Request.Path.StartsWithSegments("/api") || !ctx.Request.Path.StartsWithSegments("/apps"))
        {
            ctx.Response.Headers["Cache-Control"] = "no-store, no-cache, max-age=0";
            ctx.Response.Headers["Pragma"] = "no-cache";
        }

        // Don't apply CSP to Swagger
        if (!ctx.Request.Path.StartsWithSegments("/swagger"))
        {
            ctx.Response.Headers["Content-Security-Policy"] =
                "default-src 'self'; " +
                "script-src 'self'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data:; " +
                "font-src 'self'; " +
                "object-src 'none'; " +
                "base-uri 'self'; " +
                "frame-ancestors 'none'; " +
                "form-action 'self';";
        }

        ctx.Response.Headers.Remove("Server");
        ctx.Response.Headers.Remove("X-Powered-By");

        await next(ctx);
    }
}