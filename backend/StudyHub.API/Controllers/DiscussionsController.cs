using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Hubs;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("discussions")]
[Authorize]
public class DiscussionsController(AppDbContext db, IHubContext<DiscussionHub> hub) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetThreads([FromQuery] string? subject)
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var query = db.DiscussionThreads.Where(t => t.SchoolId == schoolId);
        if (subject is not null) query = query.Where(t => t.Subject == subject);

        var threads = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Subject,
                t.Title,
                t.Body,
                t.CreatedAt,
                Author = t.Author.Name,
                ReplyCount = t.Replies.Count
            })
            .ToListAsync();

        return Ok(threads);
    }

    [HttpPost]
    public async Task<IActionResult> CreateThread([FromBody] CreateThreadRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        if (HttpContext.Items["previewOnly"] is true)
            return Forbid();

        var thread = new DiscussionThread
        {
            SchoolId = schoolId,
            Subject = req.Subject,
            Title = req.Title,
            Body = req.Body,
            AuthorId = userId
        };

        db.DiscussionThreads.Add(thread);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetThreads), new { }, new { thread.Id });
    }

    [HttpGet("{threadId}/replies")]
    public async Task<IActionResult> GetReplies(Guid threadId)
    {
        var replies = await db.DiscussionReplies
            .Where(r => r.ThreadId == threadId)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new { r.Id, r.Body, r.CreatedAt, Author = r.Author.Name })
            .ToListAsync();

        return Ok(replies);
    }

    [HttpPost("{threadId}/replies")]
    public async Task<IActionResult> AddReply(Guid threadId, [FromBody] AddReplyRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (HttpContext.Items["previewOnly"] is true)
            return Forbid();

        var reply = new DiscussionReply
        {
            ThreadId = threadId,
            AuthorId = userId,
            Body = req.Body
        };

        db.DiscussionReplies.Add(reply);
        await db.SaveChangesAsync();

        await hub.Clients.Group($"thread:{threadId}").SendAsync("NewReply", new
        {
            reply.Id,
            reply.Body,
            reply.CreatedAt,
            AuthorId = userId
        });

        return Ok(new { reply.Id });
    }
}

public record CreateThreadRequest(string Subject, string Title, string Body);
public record AddReplyRequest(string Body);