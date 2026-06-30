using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
}

public record CreateCustomRequestRequest(RequestType Type, string Subject, string Chapter, string? Note);