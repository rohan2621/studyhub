using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("tokens/renewal")]
[Authorize]
public class TokenRenewalController(AppDbContext db, NotificationService notificationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> RequestRenewal([FromBody] RenewalRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Check no pending request already
        var existing = await db.TokenRenewalRequests
            .AnyAsync(r => r.UserId == userId && r.Status == RenewalRequestStatus.Pending);

        if (existing)
            return Conflict(new { error = "You already have a pending renewal request." });

        var renewal = new TokenRenewalRequest
        {
            UserId = userId,
            RequestedPlan = req.Plan,
            Note = req.Note
        };

        db.TokenRenewalRequests.Add(renewal);
        await db.SaveChangesAsync();

        return Ok(new
        {
            renewal.Id,
            message = "Renewal request submitted. We will contact you on WhatsApp/Instagram."
        });
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMy()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var requests = await db.TokenRenewalRequests
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                plan = r.RequestedPlan.ToString(),
                status = r.Status.ToString(),
                r.Note,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    // Admin endpoints
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] RenewalRequestStatus? status)
    {
        var query = db.TokenRenewalRequests.Include(r => r.User).AsQueryable();
        if (status.HasValue) query = query.Where(r => r.Status == status.Value);

        var results = await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                plan = r.RequestedPlan.ToString(),
                status = r.Status.ToString(),
                r.Note,
                r.CreatedAt,
                User = new { r.User.Id, r.User.Name, r.User.Email }
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateRenewalRequest req)
    {
        var renewal = await db.TokenRenewalRequests
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (renewal is null) return NotFound();

        renewal.Status = req.Status;
        await db.SaveChangesAsync();

        // Notify student
        var message = req.Status == RenewalRequestStatus.Approved
            ? "Your renewal request has been approved! Contact us to complete the payment."
            : "Your renewal request was not approved. Contact us for more info.";

        await notificationService.CreateAsync(
            renewal.UserId,
            NotificationType.CustomRequestFulfilled,
            "Renewal Request Updated",
            message);

        return Ok(new { id, status = req.Status.ToString() });
    }
}

public record RenewalRequest(TokenPlan Plan, string? Note);
public record UpdateRenewalRequest(RenewalRequestStatus Status);