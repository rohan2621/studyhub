using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("profile")]
[Authorize]
public class ProfileController(AppDbContext db) : ControllerBase
{
    // ── GET /profile ──────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var user = await db.Users
            .Include(u => u.School)
            .Include(u => u.Tokens)
            .Include(u => u.Devices)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return NotFound();

        var activeToken = user.Tokens
            .Where(t => t.Status == Models.TokenStatus.Active)
            .OrderByDescending(t => t.IssuedAt)
            .FirstOrDefault();

        var daysLeft = activeToken?.ExpiresAt.HasValue == true
            ? (int)(activeToken.ExpiresAt!.Value - DateTime.UtcNow).TotalDays
            : 0;

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.Grade,
            user.Section,
            user.CreatedAt,
            ClassLabel = $"Class {user.Grade}{user.Section}",
            School = new { user.School.Id, user.School.Name, user.School.City },
            Token = activeToken is null ? null : new
            {
                activeToken.Id,
                activeToken.Code,
                activeToken.Plan,
                activeToken.Status,
                activeToken.ExpiresAt,
                daysLeft,
                DeviceBound = activeToken.DeviceId is not null
            },
            Devices = user.Devices.Select(d => new
            {
                d.Id,
                d.Platform,
                d.FirstSeenAt,
                d.LastSeenAt
            })
        });
    }

    // ── PUT /profile ──────────────────────────────────────────────────
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        // Validate grade (8–12)
        if (!string.IsNullOrEmpty(req.Grade) &&
            !new[] { "8", "9", "10", "11", "12" }.Contains(req.Grade))
            return BadRequest(new { error = "Grade must be 8–12." });

        // Validate section (A–E)
        var section = req.Section?.Trim().ToUpper();
        if (!string.IsNullOrEmpty(section) &&
            !new[] { "A", "B", "C", "D", "E" }.Contains(section))
            return BadRequest(new { error = "Section must be A–E." });

        if (!string.IsNullOrWhiteSpace(req.Name)) user.Name = req.Name.Trim();
        if (!string.IsNullOrEmpty(req.Grade))     user.Grade   = req.Grade;
        if (!string.IsNullOrEmpty(section))        user.Section = section;

        await db.SaveChangesAsync();
        return Ok(new
        {
            user.Id,
            user.Name,
            user.Grade,
            user.Section,
            ClassLabel = $"Class {user.Grade}{user.Section}"
        });
    }

    // ── POST /profile/change-password ─────────────────────────────────
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new { error = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword, workFactor: 12);
        await db.SaveChangesAsync();
        return Ok(new { message = "Password updated successfully." });
    }

    // ── POST /profile/push-token ──────────────────────────────────────
    [HttpPost("push-token")]
    public async Task<IActionResult> RegisterPushToken([FromBody] PushTokenRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var device = await db.Devices
            .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceFingerprint == req.DeviceFingerprint);

        var platform = req.Platform.ToLower() switch
        {
            "ios"     => Models.DevicePlatform.iOS,
            "android" => Models.DevicePlatform.Android,
            _         => Models.DevicePlatform.Web
        };

        if (device is not null)
        {
            device.PushToken  = req.PushToken;
            device.LastSeenAt = DateTime.UtcNow;
        }
        else
        {
            db.Devices.Add(new Models.Device
            {
                UserId            = userId,
                DeviceFingerprint = req.DeviceFingerprint,
                Platform          = platform,
                PushToken         = req.PushToken
            });
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Push token registered." });
    }
}

public record UpdateProfileRequest(string? Name, string? Grade, string? Section);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record PushTokenRequest(string PushToken, string DeviceFingerprint, string Platform);