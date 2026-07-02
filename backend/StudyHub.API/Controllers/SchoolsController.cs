using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("schools")]
public class SchoolsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? query)
    {
        var schools = await db.Schools
            .Where(s => s.IsActive && (query == null || s.Name.ToLower().Contains(query.ToLower())))
            .Select(s => new { s.Id, s.Name, s.City, s.LogoUrl })
            .Take(20)
            .ToListAsync();

        return Ok(schools);
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestSchool([FromBody] RequestSchoolDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.City))
            return BadRequest(new { error = "Name and city are required" });

        var existing = await db.Schools
            .FirstOrDefaultAsync(s => s.Name.ToLower() == dto.Name.ToLower().Trim());

        if (existing != null)
            return Ok(new { id = existing.Id, name = existing.Name, city = existing.City });

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            City = dto.City.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        db.Schools.Add(school);
        await db.SaveChangesAsync();

        return Ok(new { id = school.Id, name = school.Name, city = school.City });
    }
}

public record RequestSchoolDto(string Name, string City);