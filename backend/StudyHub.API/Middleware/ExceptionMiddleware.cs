using System.Net;
using System.Text.Json;

namespace StudyHub.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            ctx.Response.ContentType = "application/json";

            // In Development, include the exception detail to aid debugging.
            // In Production, suppress it to prevent information disclosure.
            var isDev = ctx.RequestServices
                .GetRequiredService<IWebHostEnvironment>()
                .IsDevelopment();

            var response = isDev
                ? new { error = "An unexpected error occurred.", detail = ex.Message }
                : new { error = "An unexpected error occurred.", detail = (string?)null };

            await ctx.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}