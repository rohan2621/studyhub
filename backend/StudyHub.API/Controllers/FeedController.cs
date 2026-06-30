using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("feed")]
[Authorize]
public class FeedController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFeed()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var now = DateTime.UtcNow;

        var upcomingHomework = await db.Homeworks
            .Where(h => h.SchoolId == schoolId && h.DueAt > now)
            .OrderBy(h => h.DueAt)
            .Select(h => new
            {
                h.Id,
                h.Title,
                h.Subject,
                h.DueAt,
                DaysUntilDue = (int)(h.DueAt - now).TotalDays,
                Urgency = (h.DueAt - now).TotalDays < 2 ? "red"
                         : (h.DueAt - now).TotalDays < 5 ? "amber" : "green"
            })
            .Take(10).ToListAsync();

        var trendingNotes = await db.Notes
            .Where(n => n.SchoolId == schoolId)
            .OrderByDescending(n => n.Upvotes)
            .ThenByDescending(n => n.CreatedAt)
            .Select(n => new { n.Id, n.Title, n.Subject, n.Type, n.Upvotes, n.CreatedAt })
            .Take(6).ToListAsync();

        var recentUploads = await db.Notes
            .Where(n => n.SchoolId == schoolId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Subject,
                n.Type,
                n.CreatedAt,
                Uploader = n.Uploader.Name
            })
            .Take(6).ToListAsync();

        var pendingSubmissions = await db.Homeworks
            .Where(h => h.SchoolId == schoolId && h.DueAt > now)
            .Where(h => !h.Submissions.Any(s => s.StudentId == userId))
            .Select(h => new { h.Id, h.Title, h.Subject, h.DueAt })
            .Take(5).ToListAsync();

        var activeToken = await db.Tokens
            .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
            .Select(t => new
            {
                t.Plan,
                t.ExpiresAt,
                DaysLeft = (int)(t.ExpiresAt!.Value - now).TotalDays
            })
            .FirstOrDefaultAsync();

        var openCustomRequests = await db.CustomRequests
            .Where(c => c.UserId == userId && c.Status == RequestStatus.Open)
            .CountAsync();

        return Ok(new
        {
            upcomingHomework,
            trendingNotes,
            recentUploads,
            pendingSubmissions,
            tokenStatus = activeToken,
            openCustomRequests
        });
    }
}