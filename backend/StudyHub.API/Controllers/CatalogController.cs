using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("catalog")]
[Authorize]
public class CatalogController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCatalog([FromQuery] Guid? schoolId)
    {
        // For non-admins, ensure they only query their own school
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var userSchoolId = Guid.Parse(User.FindFirstValue("schoolId") ?? Guid.Empty.ToString());

        if (userRole != "Admin")
        {
            schoolId = userSchoolId;
        }
        else if (!schoolId.HasValue)
        {
            return BadRequest(new { error = "Admin must specify schoolId" });
        }

        var catalog = await db.SubjectCatalogs
            .Where(c => c.SchoolId == schoolId.Value)
            .OrderBy(c => c.Grade)
            .ThenBy(c => c.Section)
            .ThenBy(c => c.Subject)
            .ToListAsync();

        var noteGroups = await db.Notes
            .Where(n => n.SchoolId == schoolId.Value)
            .GroupBy(n => new { n.Grade, n.Section, n.Subject })
            .Select(g => new
            {
                g.Key.Grade,
                g.Key.Section,
                g.Key.Subject,
                ItemCount = g.Count(),
                LatestUpdate = g.Max(n => n.CreatedAt)
            })
            .ToListAsync();

        var result = catalog.Select(c =>
        {
            var stats = noteGroups.FirstOrDefault(ng => ng.Grade == c.Grade && ng.Section == c.Section && ng.Subject == c.Subject);
            return new
            {
                c.Id,
                c.SchoolId,
                c.Grade,
                c.Section,
                c.Subject,
                ItemCount = stats?.ItemCount ?? 0,
                LatestUpdate = stats?.LatestUpdate
            };
        });

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> AddToCatalog([FromBody] CatalogCreateDto dto)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId") ?? Guid.Empty.ToString());

        if (userRole == "Admin")
        {
            if (!dto.SchoolId.HasValue) return BadRequest(new { error = "Admin must specify SchoolId" });
            schoolId = dto.SchoolId.Value;
        }

        var exists = await db.SubjectCatalogs.AnyAsync(c =>
            c.SchoolId == schoolId &&
            c.Grade == dto.Grade &&
            c.Section == dto.Section &&
            c.Subject == dto.Subject);

        if (exists) return Conflict(new { error = "This section/subject already exists." });

        var newEntry = new SchoolSubjectCatalog
        {
            SchoolId = schoolId,
            Grade = dto.Grade,
            Section = dto.Section,
            Subject = dto.Subject
        };

        db.SubjectCatalogs.Add(newEntry);
        await db.SaveChangesAsync();

        return Ok(newEntry);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> DeleteFromCatalog(Guid id)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId") ?? Guid.Empty.ToString());

        var entry = await db.SubjectCatalogs.FindAsync(id);
        if (entry == null) return NotFound();

        if (userRole != "Admin" && entry.SchoolId != schoolId) return Forbid();

        // Check if any notes are using this category
        var inUse = await db.Notes.AnyAsync(n =>
            n.SchoolId == entry.SchoolId &&
            n.Grade == entry.Grade &&
            n.Section == entry.Section &&
            n.Subject == entry.Subject);

        if (inUse) return BadRequest(new { error = "Cannot delete this section because it contains uploaded notes." });

        db.SubjectCatalogs.Remove(entry);
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public class CatalogCreateDto
{
    public Guid? SchoolId { get; set; }
    public string Grade { get; set; } = null!;
    public string? Section { get; set; }
    public string Subject { get; set; } = null!;
}
