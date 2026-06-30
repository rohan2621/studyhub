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
            user.CreatedAt,
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

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Name = req.Name;
        user.Grade = req.Grade;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Name, user.Grade });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new { error = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();
        return Ok(new { message = "Password updated." });
    }
}

public record UpdateProfileRequest(string Name, string Grade);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);