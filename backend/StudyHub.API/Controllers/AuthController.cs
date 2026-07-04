using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using StudyHub.API.Data;
using StudyHub.API.Helpers;
using StudyHub.API.Models;
using StudyHub.API.Services;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(
    AppDbContext db,
    TokenService tokenService,
    IConnectionMultiplexer redis) : ControllerBase
{
    // ── Signup ────────────────────────────────────────────
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(
        [FromBody] SignupRequest req,
        [FromServices] EmailService emailService)
    {
        var (valid, error) = PasswordValidator.Validate(req.Password);
        if (!valid) return BadRequest(new { error });

        var name = InputSanitizer.Sanitize(req.Name);
        var email = req.Email.Trim().ToLower();

        if (!System.Net.Mail.MailAddress.TryCreate(email, out _))
            return BadRequest(new { error = "Invalid email format." });

        if (InputSanitizer.ContainsSqlInjection(name))
            return BadRequest(new { error = "Invalid input detected." });

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "Email already registered." });

        var school = await db.Schools.FirstOrDefaultAsync(s => s.Id == req.SchoolId && s.IsActive);
        if (school is null)
            return BadRequest(new { error = "Invalid school." });

        // Validate Grade (8 – 12 only)
        if (!new[] { "8", "9", "10", "11", "12" }.Contains(req.Grade))
            return BadRequest(new { error = "Grade must be 8, 9, 10, 11, or 12." });

        // Validate Section (A – E only)
        var section = req.Section?.Trim().ToUpper() ?? "A";
        if (!new[] { "A", "B", "C", "D", "E" }.Contains(section))
            return BadRequest(new { error = "Section must be A, B, C, D, or E." });

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password, workFactor: 12),
            Role = UserRole.Student,
            SchoolId = req.SchoolId,
            Grade = req.Grade,
            Section = section
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Send welcome email (fire and forget — don't fail signup if email fails)
        _ = Task.Run(async () =>
        {
            try
            {
                await emailService.SendWelcomeAsync(user.Email, user.Name, school.Name);
            }
            catch { /* silently ignore */ }
        });

        return Ok(new { message = "Account created. Contact us on WhatsApp/Instagram to activate a plan." });
    }

    // ── Login ─────────────────────────────────────────────
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.Trim().ToLower();
        var cache = redis.GetDatabase();

        // Account lockout check
        var lockKey = $"lockout:{email}";
        var locked = await cache.StringGetAsync(lockKey);
        if (locked.HasValue)
        {
            var ttl = await cache.KeyTimeToLiveAsync(lockKey);
            return StatusCode(423, new
            {
                error = "Account temporarily locked due to too many failed attempts.",
                retryAfterSeconds = (int)(ttl?.TotalSeconds ?? 300)
            });
        }

        var user = await db.Users
            .Include(u => u.School)
            .FirstOrDefaultAsync(u => u.Email == email);

        // Timing-safe: always run bcrypt even if user not found
        var dummyHash = "$2a$12$dummyhashtopreventtimingattacksxxxxxxxxxxxxxxxxxxxxxxxxx";
        var passwordValid = user is not null &&
            BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);

        if (user is null)
            BCrypt.Net.BCrypt.Verify(req.Password, dummyHash);

        if (!passwordValid)
        {
            var failKey = $"loginfail:{email}";
            var fails = await cache.StringIncrementAsync(failKey);
            await cache.KeyExpireAsync(failKey, TimeSpan.FromMinutes(15));

            if (fails >= 5)
            {
                await cache.StringSetAsync(lockKey, "locked", TimeSpan.FromMinutes(5));
                await cache.KeyDeleteAsync(failKey);
                return StatusCode(423, new
                {
                    error = "Too many failed attempts. Account locked for 5 minutes."
                });
            }

            return Unauthorized(new { error = "Invalid email or password." });
        }

        // Clear failed attempts on success
        await cache.KeyDeleteAsync($"loginfail:{email}");

        var accessToken = tokenService.GenerateAccessToken(user!);
        var refreshToken = tokenService.GenerateRefreshToken();

        await cache.StringSetAsync(
            $"refresh:{user!.Id}:{refreshToken}",
            "valid",
            TimeSpan.FromDays(7));

        Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            accessToken,
            refreshToken,
            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role,
                user.SchoolId,
                user.Grade,
                user.Section,
                School = user.School?.Name
            }
        });
    }

    // ── Refresh Token ─────────────────────────────────────
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            refreshToken = Request.Headers["X-Refresh-Token"].ToString();
        }

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { error = "No refresh token." });

        var userId = Request.Headers["X-User-Id"].ToString();
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized(new { error = "Invalid user ID." });

        var cache = redis.GetDatabase();
        var key = $"refresh:{userId}:{refreshToken}";
        var valid = await cache.StringGetAsync(key);
        if (!valid.HasValue)
            return Unauthorized(new { error = "Invalid or expired refresh token." });

        var user = await db.Users.FindAsync(userGuid);
        if (user is null) return Unauthorized();

        // Rotate refresh token
        await cache.KeyDeleteAsync(key);
        var newRefreshToken = tokenService.GenerateRefreshToken();
        await cache.StringSetAsync(
            $"refresh:{userId}:{newRefreshToken}",
            "valid",
            TimeSpan.FromDays(7));

        Response.Cookies.Append("refresh_token", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok(new 
        { 
            accessToken = tokenService.GenerateAccessToken(user),
            refreshToken = newRefreshToken
        });
    }

    // ── Logout ────────────────────────────────────────────
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            refreshToken = Request.Headers["X-Refresh-Token"].ToString();
        }
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!string.IsNullOrEmpty(refreshToken) && userId is not null)
        {
            var cache = redis.GetDatabase();
            await cache.KeyDeleteAsync($"refresh:{userId}:{refreshToken}");
            await cache.StringSetAsync(
                $"blacklist:{userId}",
                "revoked",
                TimeSpan.FromMinutes(16));
        }

        Response.Cookies.Delete("refresh_token");
        return NoContent();
    }

    // ── Get Current User ──────────────────────────────────
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users
            .Include(u => u.School)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return NotFound();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.Grade,
            user.Section,
            user.CreatedAt,
            School = new { user.School.Id, user.School.Name }
        });
    }

    // ── Forgot Password ───────────────────────────────────
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest req,
        [FromServices] EmailService emailService)
    {
        var email = req.Email.Trim().ToLower();

        // Always same response — prevents email enumeration attack
        var genericResponse = new { message = "If that email exists, a reset link has been sent." };

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null) return Ok(genericResponse);

        // Generate secure reset token
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(rawToken))).ToLower();

        // Invalidate existing unused reset tokens
        var existing = await db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.Used)
            .ToListAsync();
        db.PasswordResetTokens.RemoveRange(existing);

        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        });

        await db.SaveChangesAsync();

        // Send reset email
        try
        {
            await emailService.SendPasswordResetAsync(user.Email, user.Name, rawToken);
        }
        catch (Exception ex)
        {
            var logger = HttpContext.RequestServices
                .GetRequiredService<ILogger<AuthController>>();
            logger.LogError(ex, "Failed to send reset email to {Email}", email);
        }

        return Ok(genericResponse);
    }

    // ── Reset Password ────────────────────────────────────
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var (valid, error) = PasswordValidator.Validate(req.NewPassword);
        if (!valid) return BadRequest(new { error });

        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(req.Token))).ToLower();

        var resetToken = await db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.TokenHash == tokenHash &&
                !t.Used &&
                t.ExpiresAt > DateTime.UtcNow);

        if (resetToken is null)
            return BadRequest(new { error = "Invalid or expired reset token." });

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(
            req.NewPassword, workFactor: 12);
        resetToken.Used = true;

        // Invalidate all sessions for security
        var cache = redis.GetDatabase();
        await cache.StringSetAsync(
            $"blacklist:{resetToken.UserId}",
            "revoked",
            TimeSpan.FromDays(8));

        await db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. Please log in again." });
    }

    // ── Admin Reset User Password ─────────────────────────
    [HttpPost("admin/reset-user-password/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AdminResetPassword(
        Guid userId,
        [FromBody] AdminResetPasswordRequest req)
    {
        var (valid, error) = PasswordValidator.Validate(req.NewPassword);
        if (!valid) return BadRequest(new { error });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound(new { error = "User not found." });

        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword, workFactor: 12);

        db.AuditLogs.Add(new AuditLog
        {
            ActorId = adminId,
            Action = "PASSWORD_RESET_BY_ADMIN",
            Meta = $"{{\"targetUserId\":\"{userId}\"}}"
        });

        // Force logout all sessions
        var cache = redis.GetDatabase();
        await cache.StringSetAsync(
            $"blacklist:{userId}",
            "revoked",
            TimeSpan.FromDays(8));

        await db.SaveChangesAsync();

        return Ok(new { message = "Password reset. User must log in again." });
    }
}

public record SignupRequest(string Name, string Email, string Password, Guid SchoolId, string Grade, string? Section);
public record LoginRequest(string Email, string Password);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);
public record AdminResetPasswordRequest(string NewPassword);