using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("hire")]
[Authorize]
public class HireController(AppDbContext db, NotificationService notificationService) : ControllerBase
{
    [HttpGet("toppers")]
    public async Task<IActionResult> GetToppers()
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var grade    = User.FindFirstValue("grade") ?? "";
        var section  = User.FindFirstValue("section") ?? "";

        // Find users who are TopperContributors in the same school, grade, and section
        var toppers = await db.Users
            .Where(u => u.SchoolId == schoolId && u.Grade == grade && u.Section == section && u.Role == UserRole.TopperContributor)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Grade,
                u.Section
            })
            .ToListAsync();

        return Ok(toppers);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] CreateHireRequest req)
    {
        var studentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var topper = await db.Users.FindAsync(req.TopperId);
        if (topper is null || topper.Role != UserRole.TopperContributor)
            return NotFound(new { error = "Topper not found." });

        var hireRequest = new HireRequest
        {
            StudentId = studentId,
            TopperId = req.TopperId,
            Subject = req.Subject,
            Message = req.Message,
            Status = HireRequestStatus.Pending
        };

        db.HireRequests.Add(hireRequest);
        await db.SaveChangesAsync();

        // Notify Topper
        _ = Task.Run(async () =>
        {
            try
            {
                var studentName = User.FindFirstValue("name") ?? "A student";
                await notificationService.CreateAsync(
                    req.TopperId,
                    NotificationType.CustomRequestFulfilled,
                    "New Tutoring Offer!",
                    $"{studentName} wants to hire you to teach {req.Subject}. Message: {req.Message}",
                    "/hire-topper"
                );
            }
            catch { }
        });

        return Ok(new { hireRequest.Id });
    }

    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var roleStr = User.FindFirstValue(ClaimTypes.Role) ?? "";

        var query = db.HireRequests.AsQueryable();

        if (roleStr == UserRole.TopperContributor.ToString())
        {
            // Topper views received requests
            query = query.Where(r => r.TopperId == userId)
                .Include(r => r.Student);
        }
        else
        {
            // Student views sent requests
            query = query.Where(r => r.StudentId == userId)
                .Include(r => r.Topper);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Subject,
                r.Message,
                Status = r.Status.ToString(),
                r.CreatedAt,
                Student = new { r.Student.Id, r.Student.Name, r.Student.Email },
                Topper = new { r.Topper.Id, r.Topper.Name, r.Topper.Email }
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpPost("{id}/respond")]
    public async Task<IActionResult> RespondToRequest(Guid id, [FromBody] RespondHireRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var hireRequest = await db.HireRequests.FindAsync(id);
        if (hireRequest is null) return NotFound();

        if (hireRequest.TopperId != userId) return Forbid();

        if (req.Accept)
        {
            hireRequest.Status = HireRequestStatus.Accepted;
        }
        else
        {
            hireRequest.Status = HireRequestStatus.Declined;
        }

        await db.SaveChangesAsync();

        // Notify Student
        _ = Task.Run(async () =>
        {
            try
            {
                var statusWord = req.Accept ? "accepted" : "declined";
                var topperName = User.FindFirstValue("name") ?? "The topper";
                await notificationService.CreateAsync(
                    hireRequest.StudentId,
                    NotificationType.CustomRequestFulfilled,
                    $"Tutoring request {statusWord}!",
                    $"{topperName} has {statusWord} your request to teach {hireRequest.Subject}.",
                    "/hire-topper"
                );
            }
            catch { }
        });

        return Ok(new { message = $"Request has been {(req.Accept ? "accepted" : "declined")}." });
    }
}

public record CreateHireRequest(Guid TopperId, string Subject, string Message);
public record RespondHireRequest(bool Accept);
