using Hangfire.Dashboard;

namespace StudyHub.API.Filters;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        var httpContext = context.GetHttpContext();

        // Allow access only to authenticated Admin or SuperAdmin users
        return httpContext.User.Identity?.IsAuthenticated == true &&
               (httpContext.User.IsInRole("Admin") || httpContext.User.IsInRole("SuperAdmin"));
    }
}
