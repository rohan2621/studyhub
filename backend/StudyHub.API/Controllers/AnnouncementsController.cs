using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("announcements")]
[Authorize]
public class AnnouncementsController(AppDbContext db, NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var announcements = await db.Announcements
            .Where(a => a.Target == AnnouncementTarget.AllSchools ||
                        (a.Target == AnnouncementTarget.SpecificSchool && a.SchoolId == schoolId))
            .OrderByDescending(a => a.IsPinned)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Body,
                a.IsPinned,
                target = a.Target.ToString(),
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(announcements);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementRequest req)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var announcement = new Announcement
        {
            Title = req.Title,
            Body = req.Body,
            CreatedByAdminId = adminId,
            Target = req.Target,
            SchoolId = req.SchoolId,
            IsPinned = req.IsPinned
        };

        db.Announcements.Add(announcement);
        await db.SaveChangesAsync();

        // Send notifications
        if (req.Target == AnnouncementTarget.AllSchools)
            await notificationService.CreateForAllAsync(
                NotificationType.NewAnnouncement, req.Title, req.Body, "/announcements");
        else if (req.SchoolId.HasValue)
            await notificationService.CreateForSchoolAsync(
                req.SchoolId.Value, NotificationType.NewAnnouncement, req.Title, req.Body, "/announcements");

        return Ok(new { announcement.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var a = await db.Announcements.FindAsync(id);
        if (a is null) return NotFound();
        db.Announcements.Remove(a);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateAnnouncementRequest(
    string Title,
    string Body,
    AnnouncementTarget Target,
    Guid? SchoolId,
    bool IsPinned);