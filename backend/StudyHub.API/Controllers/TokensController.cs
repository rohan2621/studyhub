using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Helpers;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("tokens")]
[Authorize]
public class TokensController(AppDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyToken()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var token = await db.Tokens
            .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
            .OrderByDescending(t => t.IssuedAt)
            .FirstOrDefaultAsync();

        if (token is null)
        {
            // Check if they have an unused token waiting
            var unused = await db.Tokens
                .Where(t => t.UserId == userId && t.Status == TokenStatus.Unused)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                hasActiveToken = false,
                hasPendingToken = unused is not null,
                pendingCode = unused?.Code,
                pendingPlan = unused?.Plan.ToString()
            });
        }

        var daysLeft = token.ExpiresAt.HasValue
            ? (int)(token.ExpiresAt.Value - DateTime.UtcNow).TotalDays
            : 0;

        var hoursLeft = token.ExpiresAt.HasValue
            ? (int)(token.ExpiresAt.Value - DateTime.UtcNow).TotalHours % 24
            : 0;

        return Ok(new
        {
            hasActiveToken = true,
            hasPendingToken = false,
            token.Id,
            token.Code,
            plan = token.Plan.ToString(),
            planDays = TokenService.GetPlanDays(token.Plan),
            token.ExpiresAt,
            daysLeft,
            hoursLeft,
            isExpiringSoon = daysLeft <= 7,
            deviceBound = token.DeviceId is not null,
            isDevicePermanent = token.IsDevicePermanent,
            canBindPermanent = !token.IsDevicePermanent,
            status = token.Status.ToString()
        });
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var tokens = await db.Tokens
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.IssuedAt)
            .Select(t => new
            {
                t.Id,
                t.Code,
                plan = t.Plan.ToString(),
                status = t.Status.ToString(),
                t.IssuedAt,
                t.ExpiresAt,
                deviceBound = t.DeviceId != null
            })
            .ToListAsync();

        return Ok(tokens);
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ActivateTokenRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var token = !string.IsNullOrEmpty(req.Code)
            ? await db.Tokens.FirstOrDefaultAsync(t => t.Code == req.Code && t.UserId == userId)
            : await db.Tokens.FirstOrDefaultAsync(t => t.UserId == userId && t.Status == TokenStatus.Unused);

        if (token is null)
            return NotFound(new { error = "No redeemable token found on your account." });

        if (token.Status == TokenStatus.Revoked)
            return BadRequest(new { error = "This token has been revoked. Contact support." });

        if (token.Status == TokenStatus.Expired)
            return BadRequest(new { error = "This token has expired. Contact support to renew." });

        if (token.Status != TokenStatus.Unused && token.Status != TokenStatus.Active)
            return BadRequest(new { error = $"Token cannot be activated. Status: {token.Status}." });

        return Ok(new { valid = true, plan = token.Plan.ToString() });
    }

    [HttpPost("activate")]
    public async Task<IActionResult> Activate(
        [FromBody] ActivateTokenRequest req,
        [FromServices] EmailService emailService)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deviceHeader = Request.Headers["X-Device-Id"].ToString();

        if (string.IsNullOrEmpty(deviceHeader))
            return BadRequest(new { error = "X-Device-Id header is required." });

        // Validate device ID length to prevent abuse
        if (deviceHeader.Length > 512)
            return BadRequest(new { error = "Invalid device ID." });

        var hashedDevice = DeviceHasher.Hash(deviceHeader);

        var token = !string.IsNullOrEmpty(req.Code)
            ? await db.Tokens.FirstOrDefaultAsync(t => t.Code == req.Code && t.UserId == userId)
            : await db.Tokens.FirstOrDefaultAsync(t => t.UserId == userId && t.Status == TokenStatus.Unused);

        if (token is null)
            return NotFound(new { error = "No redeemable token found on your account." });

        if (token.Status == TokenStatus.Revoked)
            return BadRequest(new { error = "This token has been revoked. Contact support." });

        if (token.Status == TokenStatus.Expired)
            return BadRequest(new { error = "This token has expired. Contact support to renew." });

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (token.Status == TokenStatus.Active && token.IpAddress != clientIp)
            return Conflict(new
            {
                error = "DEVICE_MISMATCH",
                message = "This token is already active on another network. Contact support to reset it."
            });

        if (token.Status == TokenStatus.Active && token.IpAddress == clientIp)
            return Ok(new
            {
                message = "Token already active on this network.",
                expiresAt = token.ExpiresAt,
                plan = token.Plan.ToString()
            });

        if (token.Status != TokenStatus.Unused)
            return BadRequest(new { error = $"Token cannot be activated. Status: {token.Status}." });

        token.Status = TokenStatus.Active;
        token.DeviceId = hashedDevice;
        token.IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        token.ExpiresAt = TokenService.GetPlanExpiry(token.Plan);

        // Upsert device record
        var device = await db.Devices
            .FirstOrDefaultAsync(d => d.UserId == userId && d.DeviceFingerprint == hashedDevice);

        if (device is null)
        {
            db.Devices.Add(new Device
            {
                UserId = userId,
                DeviceFingerprint = hashedDevice,
                Platform = DevicePlatform.Web
            });
        }
        else
        {
            device.LastSeenAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();

        // Send activation email (fire and forget)
        _ = Task.Run(async () =>
        {
            try
            {
                var user = await db.Users.FindAsync(userId);
                if (user is not null && token.ExpiresAt.HasValue)
                    await emailService.SendTokenActivatedAsync(
                        user.Email,
                        user.Name,
                        token.Plan.ToString(),
                        token.ExpiresAt.Value);
            }
            catch { /* silently ignore */ }
        });

        return Ok(new
        {
            message = "Token activated successfully.",
            token = new
            {
                id = token.Id,
                code = token.Code,
                user_id = token.UserId,
                plan = token.Plan.ToString().ToLower(),
                issued_at = token.IssuedAt,
                expires_at = token.ExpiresAt,
                status = "active",
                device_id = token.DeviceId is not null ? "bound" : null,
                is_device_permanent = token.IsDevicePermanent,
                can_bind_permanent = !token.IsDevicePermanent
            },
            plan = token.Plan.ToString(),
            expiresAt = token.ExpiresAt,
            daysLeft = token.ExpiresAt.HasValue
                ? (int)(token.ExpiresAt.Value - DateTime.UtcNow).TotalDays
                : 0
        });
    }

    [HttpPost("bind-permanent")]
    public async Task<IActionResult> BindPermanent()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deviceHeader = Request.Headers["X-Device-Id"].ToString();

        if (string.IsNullOrEmpty(deviceHeader))
            return BadRequest(new { error = "X-Device-Id header is required." });

        var hashedDevice = DeviceHasher.Hash(deviceHeader);

        var token = await db.Tokens
            .Where(t => t.UserId == userId && t.Status == TokenStatus.Active)
            .OrderByDescending(t => t.IssuedAt)
            .FirstOrDefaultAsync();

        if (token is null)
            return BadRequest(new { error = "No active token found on your account." });

        if (token.IsDevicePermanent)
            return BadRequest(new { error = "A permanent device has already been bound to this token." });

        token.DeviceId = hashedDevice;
        token.IsDevicePermanent = true;

        await db.SaveChangesAsync();

        return Ok(new
        {
            message = "Device bound permanently to your account.",
            deviceId = token.DeviceId,
            isDevicePermanent = token.IsDevicePermanent
        });
    }
}

public record ActivateTokenRequest(string? Code);