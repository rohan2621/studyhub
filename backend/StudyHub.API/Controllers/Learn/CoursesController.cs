using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/courses")]
public class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? domainId, [FromQuery] string? search)
    {
        var query = _context.Courses
            .Include(c => c.Domain)
            .Where(c => c.IsPublished)
            .AsQueryable();

        if (domainId.HasValue)
        {
            query = query.Where(c => c.DomainId == domainId.Value);
        }
        
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));
        }

        var courses = await query.OrderBy(c => c.SortOrder).ToListAsync();
        return Ok(courses);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var course = await _context.Courses
            .Include(c => c.Lessons.Where(l => l.IsPublished).OrderBy(l => l.SortOrder))
            .Include(c => c.Prerequisites)
            .FirstOrDefaultAsync(c => c.Slug == slug && c.IsPublished);

        if (course == null) return NotFound();

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var userId))
        {
            var progress = await _context.UserCourseProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.CourseId == course.Id);
            
            return Ok(new { Course = course, Enrolled = progress != null, Progress = progress });
        }

        return Ok(new { Course = course, Enrolled = false });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateCourseDto dto)
    {
        var course = new Course
        {
            DomainId = dto.DomainId,
            Slug = dto.Slug,
            Title = dto.Title,
            Tagline = dto.Tagline,
            Description = dto.Description,
            WhyItMatters = dto.WhyItMatters,
            DifficultyLevel = dto.DifficultyLevel,
            EstimatedHours = dto.EstimatedHours,
            CoverImageUrl = dto.CoverImageUrl,
            IsPublished = dto.IsPublished,
            SortOrder = dto.SortOrder,
            CreatedAt = DateTime.UtcNow
        };
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBySlug), new { slug = course.Slug }, course);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, UpdateCourseDto dto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        course.DomainId = dto.DomainId;
        course.Slug = dto.Slug;
        course.Title = dto.Title;
        course.Tagline = dto.Tagline;
        course.Description = dto.Description;
        course.WhyItMatters = dto.WhyItMatters;
        course.DifficultyLevel = dto.DifficultyLevel;
        course.EstimatedHours = dto.EstimatedHours;
        course.CoverImageUrl = dto.CoverImageUrl;
        course.IsPublished = dto.IsPublished;
        course.SortOrder = dto.SortOrder;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/enroll")]
    [Authorize]
    public async Task<IActionResult> Enroll(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();

        var existing = await _context.UserCourseProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.CourseId == id);
            
        if (existing != null) return BadRequest("Already enrolled");

        var progress = new UserCourseProgress
        {
            UserId = userId,
            CourseId = id,
            Status = CourseProgressStatus.InProgress,
            EnrolledAt = DateTime.UtcNow
        };
        
        _context.UserCourseProgresses.Add(progress);
        await _context.SaveChangesAsync();
        
        return Ok(progress);
    }

    [HttpGet("{id}/progress")]
    [Authorize]
    public async Task<IActionResult> GetProgress(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var progress = await _context.UserCourseProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.CourseId == id);
            
        if (progress == null) return NotFound();
        return Ok(progress);
    }
}

public record CreateCourseDto(
    Guid DomainId, string Slug, string Title, string? Tagline, string? Description, 
    string? WhyItMatters, DifficultyLevel DifficultyLevel, decimal EstimatedHours, 
    string? CoverImageUrl, bool IsPublished, int SortOrder);

public record UpdateCourseDto(
    Guid DomainId, string Slug, string Title, string? Tagline, string? Description, 
    string? WhyItMatters, DifficultyLevel DifficultyLevel, decimal EstimatedHours, 
    string? CoverImageUrl, bool IsPublished, int SortOrder);
