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
        var userId   = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var grade    = User.FindFirstValue("grade") ?? "";
        var section  = User.FindFirstValue("section") ?? "A";
        var now      = DateTime.UtcNow;

        // ── Upcoming homework (section-specific) ──────────────────────────
        var upcomingHomework = await db.Homeworks
            .Where(h => h.SchoolId == schoolId
                     && h.Grade    == grade
                     && h.Section  == section
                     && h.DueAt    > now)
            .OrderBy(h => h.DueAt)
            .Select(h => new
            {
                h.Id,
                h.Title,
                h.Subject,
                h.Grade,
                h.Section,
                h.DueAt,
                DaysUntilDue = (int)(h.DueAt - now).TotalDays,
                Urgency = (h.DueAt - now).TotalDays < 2 ? "red"
                         : (h.DueAt - now).TotalDays < 5 ? "amber" : "green"
            })
            .Take(10).ToListAsync();

        // ── Trending notes (grade-specific, section-isolated) ──────────────
        var trendingNotes = await db.Notes
            .Where(n => n.SchoolId == schoolId && n.Grade == grade && (n.Section == null || n.Section == section))
            .OrderByDescending(n => n.Upvotes)
            .ThenByDescending(n => n.CreatedAt)
            .Select(n => new { n.Id, n.Title, n.Subject, n.Grade, n.Type, n.Upvotes, n.CreatedAt })
            .Take(6).ToListAsync();

        // ── Recent uploads (grade-specific, section-isolated) ──────────────
        var recentUploads = await db.Notes
            .Where(n => n.SchoolId == schoolId && n.Grade == grade && (n.Section == null || n.Section == section))
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                n.Id,
                n.Title,
                n.Subject,
                n.Grade,
                n.Type,
                n.CreatedAt,
                Uploader = n.Uploader.Name
            })
            .Take(6).ToListAsync();

        // ── Pending submissions (section-specific) ────────────────────────
        var pendingSubmissions = await db.Homeworks
            .Where(h => h.SchoolId == schoolId
                     && h.Grade    == grade
                     && h.Section  == section
                     && h.DueAt    > now
                     && !h.Submissions.Any(s => s.StudentId == userId))
            .Select(h => new { h.Id, h.Title, h.Subject, h.DueAt })
            .Take(5).ToListAsync();

        // ── Active token ──────────────────────────────────────────────────
        var activeToken = await db.Tokens
            .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
            .Select(t => new
            {
                t.Plan,
                t.ExpiresAt,
                DaysLeft = (int)(t.ExpiresAt!.Value - now).TotalDays
            })
            .FirstOrDefaultAsync();

        // ── Pinned announcements for this school ──────────────────────────
        var pinnedAnnouncements = await db.Announcements
            .Where(a => a.SchoolId == schoolId && a.IsPinned)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new { a.Id, a.Title, a.Body, a.CreatedAt })
            .Take(3).ToListAsync();

        // ── Open custom requests ──────────────────────────────────────────
        var openCustomRequests = await db.CustomRequests
            .Where(c => c.UserId == userId && c.Status == RequestStatus.Open)
            .CountAsync();

        // ── Class context ─────────────────────────────────────────────────
        var classLabel = $"Class {grade}{section}";

        return Ok(new
        {
            classLabel,
            upcomingHomework,
            trendingNotes,
            recentUploads,
            pendingSubmissions,
            pinnedAnnouncements,
            tokenStatus     = activeToken,
            openCustomRequests
        });
    }
}