using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("search")]
[Authorize]
public class SearchController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] string? type,
        [FromQuery] string? subject,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Search query is required." });

        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var grade   = User.FindFirstValue("grade") ?? "";
        var section = User.FindFirstValue("section") ?? "A";
        var isAdmin = User.IsInRole("Admin");
        var term = q.ToLower().Trim();
        var results = new List<object>();

        if (type is null or "note")
        {
            var notesQ = db.Notes
                .Where(n => n.SchoolId == schoolId &&
                    (EF.Functions.Like(n.Title.ToLower(), $"%{term}%") ||
                     EF.Functions.Like(n.Subject.ToLower(), $"%{term}%") ||
                     EF.Functions.Like(n.Chapter.ToLower(), $"%{term}%")))
                .Where(n => subject == null || n.Subject == subject);

            // Students only search their grade's notes
            if (!isAdmin) notesQ = notesQ.Where(n => n.Grade == grade);

            var notes = await notesQ
                .OrderByDescending(n => n.Upvotes)
                .ThenByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Subject,
                    n.Chapter,
                    n.Grade,
                    Type = n.Type.ToString(),
                    Kind = "note",
                    n.Upvotes,
                    n.CreatedAt,
                    Uploader = n.Uploader.Name
                })
                .ToListAsync();
            results.AddRange(notes);
        }

        if (type is null or "homework")
        {
            var hwQ = db.Homeworks
                .Where(h => h.SchoolId == schoolId &&
                    (EF.Functions.Like(h.Title.ToLower(), $"%{term}%") ||
                     EF.Functions.Like(h.Subject.ToLower(), $"%{term}%")))
                .Where(h => subject == null || h.Subject == subject);

            // Students only see their section's homework
            if (!isAdmin) hwQ = hwQ.Where(h => h.Grade == grade && h.Section == section);

            var hw = await hwQ
                .OrderByDescending(h => h.DueAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(h => new
                {
                    h.Id,
                    h.Title,
                    h.Subject,
                    h.Grade,
                    h.Section,
                    Chapter = "",
                    Type = "homework",
                    Kind = "homework",
                    Upvotes = 0,
                    h.CreatedAt,
                    Uploader = h.Assigner.Name
                })
                .ToListAsync();
            results.AddRange(hw);
        }

        if (type is null or "pastpaper")
        {
            var papers = await db.PastPapers
                .Where(p => p.SchoolId == schoolId &&
                    EF.Functions.Like(p.Subject.ToLower(), $"%{term}%"))
                .Where(p => subject == null || p.Subject == subject)
                .OrderByDescending(p => p.Year)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    Title = $"{p.Subject} {p.Year} {p.Term}",
                    p.Subject,
                    Chapter = "",
                    Type = "pastpaper",
                    Kind = "pastpaper",
                    Upvotes = 0,
                    p.CreatedAt,
                    Uploader = ""
                })
                .ToListAsync();
            results.AddRange(papers);
        }

        return Ok(new { query = q, total = results.Count, data = results });
    }

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var subjects = await db.Notes
            .Where(n => n.SchoolId == schoolId)
            .Select(n => n.Subject)
            .Union(db.Homeworks.Where(h => h.SchoolId == schoolId).Select(h => h.Subject))
            .Union(db.PastPapers.Where(p => p.SchoolId == schoolId).Select(p => p.Subject))
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();

        return Ok(subjects);
    }
}