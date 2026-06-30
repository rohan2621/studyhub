using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("past-papers")]
[Authorize]
public class PastPapersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? subject, [FromQuery] int? year, [FromQuery] string? term)
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var isPreview = HttpContext.Items["previewOnly"] is true;

        var query = db.PastPapers.Where(p => p.SchoolId == schoolId);
        if (subject is not null) query = query.Where(p => p.Subject == subject);
        if (year.HasValue) query = query.Where(p => p.Year == year.Value);
        if (term is not null) query = query.Where(p => p.Term == term);

        var papers = await query
            .OrderByDescending(p => p.Year)
            .Select(p => new
            {
                p.Id,
                p.Subject,
                p.Year,
                p.Term,
                p.CreatedAt,
                FileUrl = isPreview ? null : p.FileUrl
            })
            .ToListAsync();

        return Ok(papers);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePastPaperRequest req)
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var paper = new PastPaper
        {
            SchoolId = schoolId,
            Subject = req.Subject,
            Year = req.Year,
            Term = req.Term,
            FileUrl = req.FileUrl
        };

        db.PastPapers.Add(paper);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { }, new { paper.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var paper = await db.PastPapers.FindAsync(id);
        if (paper is null) return NotFound();
        db.PastPapers.Remove(paper);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreatePastPaperRequest(string Subject, int Year, string Term, string FileUrl);