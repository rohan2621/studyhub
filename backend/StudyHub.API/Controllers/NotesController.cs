using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("notes")]
[Authorize]
public class NotesController(AppDbContext db, NotificationService notificationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotes(
        [FromQuery] NoteType? type,
        [FromQuery] string? subject,
        [FromQuery] string? chapter,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var isPreview = HttpContext.Items["previewOnly"] is true;

        var query = db.Notes.Where(n => n.SchoolId == schoolId);
        if (type.HasValue) query = query.Where(n => n.Type == type.Value);
        if (subject is not null) query = query.Where(n => n.Subject == subject);
        if (chapter is not null) query = query.Where(n => n.Chapter.ToLower().Contains(chapter.ToLower()));

        var total = await query.CountAsync();

        var notes = await query
            .OrderByDescending(n => n.Upvotes)
            .ThenByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new
            {
                n.Id,
                n.Subject,
                n.Chapter,
                n.Title,
                type = n.Type.ToString(),
                n.Upvotes,
                n.CreatedAt,
                Uploader = n.Uploader.Name,
                FileUrl = isPreview ? null : n.FileUrl,
                HasUpvoted = n.NoteUpvotesList.Any(u => u.UserId == userId)
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = notes });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isPreview = HttpContext.Items["previewOnly"] is true;

        var note = await db.Notes
            .Include(n => n.Uploader)
            .FirstOrDefaultAsync(n => n.Id == id);

        if (note is null) return NotFound();

        var hasUpvoted = await db.NoteUpvotes.AnyAsync(u => u.NoteId == id && u.UserId == userId);

        return Ok(new
        {
            note.Id,
            note.Subject,
            note.Chapter,
            note.Title,
            type = note.Type.ToString(),
            note.Upvotes,
            note.CreatedAt,
            Uploader = note.Uploader.Name,
            FileUrl = isPreview ? null : note.FileUrl,
            HasUpvoted = hasUpvoted
        });
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,TopperContributor,Admin")]
    public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var note = new Note
        {
            SchoolId = schoolId,
            Subject = req.Subject,
            Chapter = req.Chapter,
            Title = req.Title,
            FileUrl = req.FileUrl,
            UploadedBy = userId,
            Type = req.Type
        };

        db.Notes.Add(note);
        await db.SaveChangesAsync();

        // Notify all students in this school
        _ = Task.Run(async () =>
        {
            try
            {
                await notificationService.CreateForSchoolAsync(
                    schoolId,
                    NotificationType.NewNote,
                    $"New {req.Type}: {req.Title}",
                    $"New {req.Subject} content uploaded in {req.Chapter}",
                    $"/notes/{note.Id}");
            }
            catch { }
        });

        return CreatedAtAction(nameof(GetById), new { id = note.Id }, new { note.Id });
    }

    [HttpPost("{id}/upvote")]
    public async Task<IActionResult> Upvote(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var note = await db.Notes.FindAsync(id);
        if (note is null) return NotFound();

        // Check if already upvoted
        var existing = await db.NoteUpvotes
            .FirstOrDefaultAsync(u => u.NoteId == id && u.UserId == userId);

        if (existing is not null)
        {
            // Remove upvote (toggle)
            db.NoteUpvotes.Remove(existing);
            note.Upvotes = Math.Max(0, note.Upvotes - 1);
            await db.SaveChangesAsync();
            return Ok(new { upvotes = note.Upvotes, upvoted = false });
        }

        db.NoteUpvotes.Add(new NoteUpvote { NoteId = id, UserId = userId });
        note.Upvotes++;
        await db.SaveChangesAsync();
        return Ok(new { upvotes = note.Upvotes, upvoted = true });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher,TopperContributor,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateNoteRequest req)
    {
        var note = await db.Notes.FindAsync(id);
        if (note is null) return NotFound();

        note.Subject = req.Subject;
        note.Chapter = req.Chapter;
        note.Title = req.Title;
        note.FileUrl = req.FileUrl;
        note.Type = req.Type;

        await db.SaveChangesAsync();
        return Ok(new { note.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var note = await db.Notes.FindAsync(id);
        if (note is null) return NotFound();
        db.Notes.Remove(note);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var subjects = await db.Notes
            .Where(n => n.SchoolId == schoolId)
            .Select(n => n.Subject)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();
        return Ok(subjects);
    }
}

public record CreateNoteRequest(string Subject, string Chapter, string Title, string FileUrl, NoteType Type);