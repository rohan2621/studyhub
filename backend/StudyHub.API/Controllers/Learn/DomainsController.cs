using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/domains")]
public class DomainsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DomainsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var domains = await _context.Domains
            .Where(d => d.IsPublished)
            .OrderBy(d => d.SortOrder)
            .ToListAsync();
        return Ok(domains);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var domain = await _context.Domains
            .Include(d => d.Courses.Where(c => c.IsPublished).OrderBy(c => c.SortOrder))
            .FirstOrDefaultAsync(d => d.Slug == slug && d.IsPublished);

        if (domain == null) return NotFound();
        return Ok(domain);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Domain domain)
    {
        domain.CreatedAt = DateTime.UtcNow;
        _context.Domains.Add(domain);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBySlug), new { slug = domain.Slug }, domain);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, Domain domain)
    {
        if (id != domain.Id) return BadRequest();
        _context.Entry(domain).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
