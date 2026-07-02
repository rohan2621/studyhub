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
    public async Task<IActionResult> GetAll(
        [FromQuery] string? subject,
        [FromQuery] int? year,
        [FromQuery] string? term,
        [FromQuery] string? grade)
    {
        var schoolId    = Guid.Parse(User.FindFirstValue("schoolId")!);
        var userGrade   = User.FindFirstValue("grade") ?? "";
        var isAdmin     = User.IsInRole("Admin");

        var query = db.PastPapers.Where(p => p.SchoolId == schoolId);

        // Grade filtering: students see their grade's papers + school-wide (null grade) papers
        if (!isAdmin)
        {
            query = query.Where(p => p.Grade == null || p.Grade == userGrade);
        }
        else if (grade is not null)
        {
            query = query.Where(p => p.Grade == grade);
        }

        if (subject is not null) query = query.Where(p => p.Subject == subject);
        if (year.HasValue)       query = query.Where(p => p.Year == year.Value);
        if (term is not null)    query = query.Where(p => p.Term == term);

        var papers = await query
            .OrderByDescending(p => p.Year)
            .ThenBy(p => p.Subject)
            .Select(p => new
            {
                p.Id,
                p.Grade,
                p.Subject,
                p.Year,
                p.Term,
                p.CreatedAt,
                p.FileUrl
            })
            .ToListAsync();

        return Ok(papers);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePastPaperRequest req)
    {
        var claimsSchoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var isAdmin        = User.IsInRole("Admin");

        // Validate grade if provided
        if (!string.IsNullOrEmpty(req.Grade) &&
            !new[] { "8", "9", "10", "11", "12" }.Contains(req.Grade))
            return BadRequest(new { error = "Grade must be 8–12 or omitted for school-wide papers." });

        var schoolId = isAdmin && req.TargetSchoolId.HasValue
            ? req.TargetSchoolId.Value
            : claimsSchoolId;

        var paper = new PastPaper
        {
            SchoolId = schoolId,
            Grade    = string.IsNullOrEmpty(req.Grade) ? null : req.Grade,
            Subject  = req.Subject,
            Year     = req.Year,
            Term     = req.Term,
            FileUrl  = req.FileUrl
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

public record CreatePastPaperRequest(
    string Subject, int Year, string Term, string FileUrl,
    string? Grade = null,
    Guid? TargetSchoolId = null);