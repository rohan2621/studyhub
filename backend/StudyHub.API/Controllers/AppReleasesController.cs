using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.ComponentModel.DataAnnotations;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppReleasesController(AppDbContext db, IWebHostEnvironment env, FileService fileService) : ControllerBase
{
    /// <summary>
    /// Gets the latest app release. Used by the mobile app on startup.
    /// </summary>
    [HttpGet("latest")]
    public async Task<ActionResult<AppRelease>> GetLatestRelease()
    {
        var latest = await db.AppReleases
            .OrderByDescending(x => x.VersionCode)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (latest == null)
            return NotFound(new { message = "No app releases found." });

        return Ok(latest);
    }

    /// <summary>
    /// Gets all app releases. Used by the admin dashboard.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<List<AppRelease>>> GetAllReleases()
    {
        var releases = await db.AppReleases
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(releases);
    }

    public class UploadReleaseDto
    {
        [Required]
        public int VersionCode { get; set; }
        
        [Required]
        public string VersionName { get; set; } = string.Empty;
        
        public string ReleaseNotes { get; set; } = string.Empty;
        
        public bool IsMandatory { get; set; }
        
        [Required]
        public IFormFile File { get; set; } = null!;
    }

    /// <summary>
    /// Uploads a new app release.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 536870912)] // 512 MB
    public async Task<ActionResult<AppRelease>> UploadRelease([FromForm] UploadReleaseDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            return BadRequest("APK file is required.");

        if (Path.GetExtension(dto.File.FileName).ToLower() != ".apk")
            return BadRequest("File must be an APK (.apk).");

        // Safe filename: app-v1.0.1.apk
        var fileName = $"app-v{dto.VersionName}-{DateTime.UtcNow.Ticks}.apk";
        string fileUrl;

        using (var stream = dto.File.OpenReadStream())
        {
            fileUrl = await fileService.UploadAppReleaseAsync(stream, fileName);
        }

        var release = new AppRelease
        {
            VersionCode = dto.VersionCode,
            VersionName = dto.VersionName ?? "1.0.0",
            ReleaseNotes = dto.ReleaseNotes ?? string.Empty,
            IsMandatory = dto.IsMandatory,
            FileUrl = fileUrl
        };

        db.AppReleases.Add(release);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLatestRelease), new { id = release.Id }, release);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteRelease(Guid id)
    {
        var release = await db.AppReleases.FindAsync(id);
        if (release == null) return NotFound("Release not found.");

        // Optional: delete from Supabase. For now we just remove from DB.
        db.AppReleases.Remove(release);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
