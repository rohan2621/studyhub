using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("homework")]
[Authorize]
public class HomeworkController(AppDbContext db, NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetHomework(
        [FromQuery] string? subject,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var isPreview = HttpContext.Items["previewOnly"] is true;

        var query = db.Homeworks.Where(h => h.SchoolId == schoolId);
        if (subject is not null) query = query.Where(h => h.Subject == subject);

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(h => h.DueAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new
            {
                h.Id,
                h.Subject,
                h.Title,
                h.DueAt,
                h.CreatedAt,
                Description = isPreview ? null : h.Description,
                AttachmentUrl = isPreview ? null : h.AttachmentUrl,
                Assigner = h.Assigner.Name,
                HasSubmitted = h.Submissions.Any(s => s.StudentId == userId),
                SubmissionCount = h.Submissions.Count,
                DaysUntilDue = (int)(h.DueAt - DateTime.UtcNow).TotalDays,
                Urgency = (h.DueAt - DateTime.UtcNow).TotalDays < 2 ? "red"
                        : (h.DueAt - DateTime.UtcNow).TotalDays < 5 ? "amber" : "green"
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = items });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isPreview = HttpContext.Items["previewOnly"] is true;

        var hw = await db.Homeworks
            .Include(h => h.Assigner)
            .Include(h => h.Submissions.Where(s => s.StudentId == userId))
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hw is null) return NotFound();

        return Ok(new
        {
            hw.Id,
            hw.Subject,
            hw.Title,
            hw.DueAt,
            hw.CreatedAt,
            Description = isPreview ? null : hw.Description,
            AttachmentUrl = isPreview ? null : hw.AttachmentUrl,
            Assigner = hw.Assigner.Name,
            MySubmission = hw.Submissions.FirstOrDefault() is { } sub
                ? new { sub.Id, sub.FileUrl, sub.SubmittedAt, sub.Grade }
                : null
        });
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateHomeworkRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var hw = new Homework
        {
            SchoolId = schoolId,
            Subject = req.Subject,
            Title = req.Title,
            Description = req.Description,
            DueAt = req.DueAt,
            AssignedBy = userId,
            AttachmentUrl = req.AttachmentUrl
        };

        db.Homeworks.Add(hw);
        await db.SaveChangesAsync();

        // Notify all students in school
        _ = Task.Run(async () =>
        {
            try
            {
                await notificationService.CreateForSchoolAsync(
                    schoolId,
                    NotificationType.NewHomework,
                    $"New Homework: {req.Title}",
                    $"{req.Subject} homework due {req.DueAt:MMM dd}",
                    $"/homework/{hw.Id}");
            }
            catch { }
        });

        return CreatedAtAction(nameof(GetById), new { id = hw.Id }, new { hw.Id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateHomeworkRequest req)
    {
        var hw = await db.Homeworks.FindAsync(id);
        if (hw is null) return NotFound();

        hw.Subject = req.Subject;
        hw.Title = req.Title;
        hw.Description = req.Description;
        hw.DueAt = req.DueAt;
        hw.AttachmentUrl = req.AttachmentUrl;

        await db.SaveChangesAsync();
        return Ok(new { hw.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var hw = await db.Homeworks.FindAsync(id);
        if (hw is null) return NotFound();
        db.Homeworks.Remove(hw);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(Guid id, [FromBody] SubmitHomeworkRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (HttpContext.Items["previewOnly"] is true)
            return Forbid();

        var hw = await db.Homeworks.FindAsync(id);
        if (hw is null) return NotFound();

        if (hw.DueAt < DateTime.UtcNow)
            return BadRequest(new { error = "Homework due date has passed." });

        if (await db.Submissions.AnyAsync(s => s.HomeworkId == id && s.StudentId == userId))
            return Conflict(new { error = "Already submitted." });

        db.Submissions.Add(new Submission
        {
            HomeworkId = id,
            StudentId = userId,
            FileUrl = req.FileUrl
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Submitted successfully." });
    }

    [HttpGet("{id}/submissions")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetSubmissions(Guid id)
    {
        var submissions = await db.Submissions
            .Include(s => s.Student)
            .Where(s => s.HomeworkId == id)
            .Select(s => new
            {
                s.Id,
                s.FileUrl,
                s.SubmittedAt,
                s.Grade,
                Student = new { s.Student.Id, s.Student.Name, s.Student.Email }
            })
            .ToListAsync();

        return Ok(submissions);
    }

    [HttpPost("submissions/{submissionId}/grade")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Grade(Guid submissionId, [FromBody] GradeRequest req)
    {
        var submission = await db.Submissions
            .Include(s => s.Homework)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission is null) return NotFound();

        submission.Grade = req.Grade;
        await db.SaveChangesAsync();

        // Notify student
        _ = Task.Run(async () =>
        {
            try
            {
                await notificationService.CreateAsync(
                    submission.StudentId,
                    NotificationType.HomeworkGraded,
                    "Homework Graded",
                    $"Your {submission.Homework.Subject} homework has been graded: {req.Grade}",
                    $"/homework/{submission.HomeworkId}");
            }
            catch { }
        });

        return Ok(new { submissionId, grade = req.Grade });
    }
}

public record CreateHomeworkRequest(string Subject, string Title, string Description, DateTime DueAt, string? AttachmentUrl);
public record SubmitHomeworkRequest(string FileUrl);
public record GradeRequest(string Grade);