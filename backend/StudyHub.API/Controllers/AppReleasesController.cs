using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.ComponentModel.DataAnnotations;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppReleasesController(AppDbContext db, IWebHostEnvironment env) : ControllerBase
{
    /// <summary>
    /// Gets the latest app release. Used by the mobile app on startup.
    /// </summary>
    [HttpGet("latest")]
    public async Task<ActionResult<AppRelease>> GetLatestRelease()
    {
        var latest = await db.AppReleases
            .OrderByDescending(x => x.VersionCode)
            .FirstOrDefaultAsync();

        if (latest == null)
            return NotFound(new { message = "No app releases found." });

        return Ok(latest);
    }

    /// <summary>
    /// Gets all app releases. Used by the admin dashboard.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "SuperAdmin")]
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
        
        [Required]
        public string ReleaseNotes { get; set; } = string.Empty;
        
        public bool IsMandatory { get; set; }
        
        [Required]
        public IFormFile File { get; set; } = null!;
    }

    /// <summary>
    /// Uploads a new app release.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<AppRelease>> UploadRelease([FromForm] UploadReleaseDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            return BadRequest("APK file is required.");

        if (Path.GetExtension(dto.File.FileName).ToLower() != ".apk")
            return BadRequest("File must be an APK (.apk).");

        // Ensure wwwroot/apps exists
        var appsPath = Path.Combine(env.WebRootPath, "apps");
        if (!Directory.Exists(appsPath))
            Directory.CreateDirectory(appsPath);

        // Safe filename: app-v1.0.1.apk
        var fileName = $"app-v{dto.VersionName}-{DateTime.UtcNow.Ticks}.apk";
        var filePath = Path.Combine(appsPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        var release = new AppRelease
        {
            VersionCode = dto.VersionCode,
            VersionName = dto.VersionName,
            ReleaseNotes = dto.ReleaseNotes,
            IsMandatory = dto.IsMandatory,
            FileUrl = $"/apps/{fileName}" // This works with UseStaticFiles
        };

        db.AppReleases.Add(release);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLatestRelease), new { id = release.Id }, release);
    }
}
