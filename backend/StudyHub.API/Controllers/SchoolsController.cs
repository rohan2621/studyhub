using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;

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
}