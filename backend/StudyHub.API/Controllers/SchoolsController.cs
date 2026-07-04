using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System;
using System.Threading.Tasks;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("schools")]
public class SchoolsController(AppDbContext db, IMemoryCache cache) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? query)
    {
        var cacheKey = $"schools_search_{query?.ToLower() ?? ""}";

        if (!cache.TryGetValue(cacheKey, out var schools))
        {
            schools = await db.Schools
                .Where(s => s.IsActive && (query == null || s.Name.ToLower().Contains(query.ToLower())))
                .Select(s => new { s.Id, s.Name, s.City, s.LogoUrl })
                .Take(20)
                .ToListAsync();

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(2));

            cache.Set(cacheKey, schools, cacheEntryOptions);
        }

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