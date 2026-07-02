using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("custom-requests")]
[Authorize]
public class CustomRequestsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomRequestRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var cr = new CustomRequest
        {
            UserId = userId,
            Type = req.Type,
            Subject = req.Subject,
            Chapter = req.Chapter,
            Note = req.Note
        };

        db.CustomRequests.Add(cr);
        await db.SaveChangesAsync();
        return Ok(new { cr.Id, message = "Request submitted." });
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMine()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var requests = await db.CustomRequests
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                type = c.Type.ToString(),
                c.Subject,
                c.Chapter,
                c.Note,
                status = c.Status.ToString(),
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(requests);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cr = await db.CustomRequests.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (cr is null) return NotFound();
        if (cr.Status != RequestStatus.Open)
            return BadRequest(new { error = "Cannot delete a request that has already been processed." });
        db.CustomRequests.Remove(cr);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateCustomRequestRequest(RequestType Type, string Subject, string Chapter, string? Note);