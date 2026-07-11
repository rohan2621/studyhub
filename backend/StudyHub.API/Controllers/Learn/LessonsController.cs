using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/lessons")]
public class LessonsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly XpService _xpService;
    private readonly AchievementService _achievementService;

    public LessonsController(AppDbContext context, XpService xpService, AchievementService achievementService)
    {
        _context = context;
        _xpService = xpService;
        _achievementService = achievementService;
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Resources.OrderBy(r => r.SortOrder))
            .Include(l => l.RelatedLessons)
            .FirstOrDefaultAsync(l => l.Id == id && l.IsPublished);

        if (lesson == null) return NotFound();
        return Ok(lesson);
    }

    [HttpPost("{id}/complete")]
    [Authorize]
    public async Task<IActionResult> Complete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var progress = await _context.UserLessonProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == id);
            
        if (progress == null)
        {
            progress = new UserLessonProgress
            {
                UserId = userId,
                LessonId = id,
                Status = LessonProgressStatus.Completed,
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            };
            _context.UserLessonProgresses.Add(progress);
        }
        else if (progress.Status != LessonProgressStatus.Completed)
        {
            progress.Status = LessonProgressStatus.Completed;
            progress.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            return BadRequest("Already completed");
        }

        await _context.SaveChangesAsync();
        
        // Award XP
        await _xpService.AwardXpAsync(userId, XpSource.LessonComplete, id, 20);
        await _achievementService.CheckAndAwardAsync(userId);

        return Ok(progress);
    }

    [HttpGet("{id}/comments")]
    public async Task<IActionResult> GetComments(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var comments = await _context.LessonComments
            .Include(c => c.User)
            .Where(c => c.LessonId == id)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new {
                c.Id,
                c.Body,
                c.CreatedAt,
                User = new { c.User.Id, c.User.Name }
            })
            .ToListAsync();
            
        return Ok(comments);
    }

    public class CommentDto { public string Body { get; set; } = string.Empty; }

    [HttpPost("{id}/comments")]
    [Authorize]
    public async Task<IActionResult> PostComment(Guid id, [FromBody] CommentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Body)) return BadRequest();
        
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var comment = new LessonComment
        {
            UserId = userId,
            LessonId = id,
            Body = dto.Body,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.LessonComments.Add(comment);
        await _context.SaveChangesAsync();
        
        return Ok(comment);
    }
}
