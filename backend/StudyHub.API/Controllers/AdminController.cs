using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;
using Microsoft.Extensions.Caching.Memory;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Roles = "Admin")]
public class AdminController(AppDbContext db, IMemoryCache cache) : ControllerBase
{
    // ── Users ──────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] Guid? schoolId,
        [FromQuery] UserRole? role,
        [FromQuery] string? grade,
        [FromQuery] string? section,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = db.Users.Include(u => u.School).AsQueryable();

        if (search is not null)
            query = query.Where(u => u.Name.ToLower().Contains(search.ToLower()) ||
                                     u.Email.ToLower().Contains(search.ToLower()));
        if (schoolId.HasValue)          query = query.Where(u => u.SchoolId == schoolId.Value);
        if (role.HasValue)              query = query.Where(u => u.Role == role.Value);
        if (!string.IsNullOrEmpty(grade))   query = query.Where(u => u.Grade == grade);
        if (!string.IsNullOrEmpty(section)) query = query.Where(u => u.Section == section);

        var total = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.Grade)
            .ThenBy(u => u.Section)
            .ThenBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.Grade,
                u.Section,
                ClassLabel = $"Class {u.Grade}{u.Section}",
                u.CreatedAt,
                School = new { u.School.Id, u.School.Name },
                ActiveToken = u.Tokens
                    .Where(t => t.Status == TokenStatus.Active)
                    .Select(t => new { t.Id, t.Plan, t.ExpiresAt, t.Status })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = users });
    }

    // ── Class Roster — students grouped by grade+section ───
    [HttpGet("class-roster")]
    public async Task<IActionResult> GetClassRoster(
        [FromQuery] Guid? schoolId,
        [FromQuery] string? grade,
        [FromQuery] string? section)
    {
        var query = db.Users
            .Include(u => u.School)
            .Where(u => u.Role == UserRole.Student);

        if (schoolId.HasValue)          query = query.Where(u => u.SchoolId == schoolId.Value);
        if (!string.IsNullOrEmpty(grade))   query = query.Where(u => u.Grade == grade);
        if (!string.IsNullOrEmpty(section)) query = query.Where(u => u.Section == section);

        var students = await query
            .OrderBy(u => u.Grade)
            .ThenBy(u => u.Section)
            .ThenBy(u => u.Name)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Grade,
                u.Section,
                ClassLabel = $"Class {u.Grade}{u.Section}",
                School = u.School.Name,
                HasActiveToken = u.Tokens.Any(t => t.Status == TokenStatus.Active)
            })
            .ToListAsync();

        // Group by class
        var grouped = students
            .GroupBy(s => $"{s.Grade}{s.Section}")
            .OrderBy(g => g.Key)
            .Select(g => new
            {
                classLabel  = $"Class {g.Key}",
                grade       = g.First().Grade,
                section     = g.First().Section,
                studentCount = g.Count(),
                students    = g.ToList()
            });

        return Ok(grouped);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { error = "Email already registered." });

        if (req.Role == UserRole.Student)
            return BadRequest(new { error = "Use public signup for students." });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            SchoolId = req.SchoolId,
            Grade = req.Grade ?? "N/A"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Email, user.Role });
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeRole(Guid id, [FromBody] ChangeRoleRequest req)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        db.AuditLogs.Add(new AuditLog
        {
            ActorId = adminId,
            Action = "ROLE_CHANGED",
            Meta = $"{{\"userId\":\"{id}\",\"from\":\"{user.Role}\",\"to\":\"{req.Role}\"}}"
        });

        user.Role = req.Role;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Role });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();

        // Cascade delete all referencing entity records to prevent foreign key errors
        await db.AuditLogs.Where(a => a.ActorId == id).ExecuteDeleteAsync();
        await db.AuditLogs.Where(a => db.Tokens.Any(t => t.UserId == id && t.Id == a.TokenId)).ExecuteDeleteAsync();
        await db.Tokens.Where(t => t.UserId == id).ExecuteDeleteAsync();
        await db.Devices.Where(d => d.UserId == id).ExecuteDeleteAsync();
        await db.Submissions.Where(s => s.StudentId == id).ExecuteDeleteAsync();
        await db.CustomRequests.Where(c => c.UserId == id).ExecuteDeleteAsync();
        await db.PaymentRecords.Where(p => p.UserId == id).ExecuteDeleteAsync();
        await db.DiscussionThreads.Where(d => d.AuthorId == id).ExecuteDeleteAsync();
        await db.DiscussionReplies.Where(d => d.AuthorId == id).ExecuteDeleteAsync();
        await db.PasswordResetTokens.Where(p => p.UserId == id).ExecuteDeleteAsync();
        await db.Notifications.Where(n => n.UserId == id).ExecuteDeleteAsync();
        await db.NoteUpvotes.Where(n => n.UserId == id).ExecuteDeleteAsync();
        await db.TokenRenewalRequests.Where(r => r.UserId == id).ExecuteDeleteAsync();
        await db.HireRequests.Where(r => r.StudentId == id || r.TopperId == id).ExecuteDeleteAsync();
        await db.Notes.Where(n => n.UploadedBy == id).ExecuteDeleteAsync();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Schools ────────────────────────────────────────────
    [HttpGet("schools")]
    public async Task<IActionResult> GetAllSchools()
    {
        var schools = await db.Schools
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.City,
                s.IsActive,
                s.CreatedAt,
                UserCount = s.Users.Count
            })
            .ToListAsync();

        return Ok(schools);
    }

    [HttpPost("schools")]
    public async Task<IActionResult> CreateSchool([FromBody] CreateSchoolRequest req)
    {
        var school = new School { Name = req.Name, City = req.City, LogoUrl = req.LogoUrl };
        db.Schools.Add(school);
        await db.SaveChangesAsync();
        return Ok(new { school.Id, school.Name });
    }

    [HttpPut("schools/{id}")]
    public async Task<IActionResult> UpdateSchool(Guid id, [FromBody] CreateSchoolRequest req)
    {
        var school = await db.Schools.FindAsync(id);
        if (school is null) return NotFound();
        school.Name = req.Name;
        school.City = req.City;
        school.LogoUrl = req.LogoUrl;
        await db.SaveChangesAsync();
        return Ok(new { school.Id });
    }

    [HttpPatch("schools/{id}/toggle")]
    public async Task<IActionResult> ToggleSchool(Guid id)
    {
        var school = await db.Schools.FindAsync(id);
        if (school is null) return NotFound();
        school.IsActive = !school.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { school.Id, school.IsActive });
    }



    // ── Audit Logs ────────────────────────────────────────
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] Guid? actorId,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = db.AuditLogs.AsQueryable();
        if (actorId.HasValue) query = query.Where(a => a.ActorId == actorId.Value);
        if (action is not null) query = query.Where(a => a.Action == action);

        var total = await query.CountAsync();
        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new { a.Id, a.ActorId, a.Action, a.TokenId, a.Meta, a.CreatedAt })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = logs });
    }

    // ── Stats Dashboard ───────────────────────────────────
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await cache.GetOrCreateAsync("admin_stats", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1);

            var now = DateTime.UtcNow;

            var totalUsers = await db.Users.CountAsync();
            var activeTokens = await db.Tokens.CountAsync(t => t.Status == TokenStatus.Active);
            var expiredTokens = await db.Tokens.CountAsync(t => t.Status == TokenStatus.Expired);
            var baseRevenue = await db.PaymentRecords.SumAsync(p => (decimal?)p.Amount) ?? 0;
            var adjustments = await db.RevenueAdjustments.SumAsync(r => (decimal?)r.Amount) ?? 0;
            var totalRevenue = baseRevenue + adjustments;
            var totalNotes = await db.Notes.CountAsync();
            var totalSchools = await db.Schools.CountAsync(s => s.IsActive);
            var pendingRequests = await db.CustomRequests.CountAsync(c => c.Status == RequestStatus.Open);
            var pendingRenewalCount = await db.TokenRenewalRequests.CountAsync(r => r.Status == RenewalRequestStatus.Pending);
            var newUsersThisMonth = await db.Users
                .CountAsync(u => u.CreatedAt >= new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc));
            var tokensExpiringIn7Days = await db.Tokens
                .CountAsync(t => t.Status == TokenStatus.Active && t.ExpiresAt <= now.AddDays(7));

            return new
            {
                totalUsers,
                activeTokens,
                expiredTokens,
                totalRevenue,
                totalNotes,
                totalSchools,
                pendingRequests,
                pendingRenewalCount,
                newUsersThisMonth,
                tokensExpiringIn7Days
            };
        });

        return Ok(stats);
    }

    // ── Custom Requests ───────────────────────────────────
    [HttpGet("custom-requests")]
    public async Task<IActionResult> GetCustomRequests([FromQuery] RequestStatus? status)
    {
        var query = db.CustomRequests.Include(c => c.User).AsQueryable();
        if (status.HasValue) query = query.Where(c => c.Status == status.Value);

        var results = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                type = c.Type.ToString(),
                c.Subject,
                c.Chapter,
                c.Note,
                status = c.Status.ToString(),
                c.CreatedAt,
                user = new { c.User.Id, c.User.Name, c.User.Email }
            })
            .ToListAsync();

        return Ok(results);
    }

    [HttpPatch("custom-requests/{id}")]
    public async Task<IActionResult> UpdateRequestStatus(Guid id, [FromBody] UpdateRequestStatusRequest req)
    {
        var cr = await db.CustomRequests.FindAsync(id);
        if (cr is null) return NotFound();
        cr.Status = req.Status;
        await db.SaveChangesAsync();
        return Ok(new { cr.Id, cr.Status });
    }
    [HttpGet("export/users")]
    public async Task<IActionResult> ExportUsers()
    {
        var users = await db.Users
            .Include(u => u.School)
            .Include(u => u.Tokens)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync();

        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Id,Name,Email,Role,School,Grade,CreatedAt,HasActiveToken,TokenExpiry");

        foreach (var u in users)
        {
            var activeToken = u.Tokens.FirstOrDefault(t => t.Status == TokenStatus.Active);
            csv.AppendLine(
                $"{EscapeCsv(u.Id.ToString())}," +
                $"{EscapeCsv(u.Name)}," +
                $"{EscapeCsv(u.Email)}," +
                $"{EscapeCsv(u.Role.ToString())}," +
                $"{EscapeCsv(u.School?.Name)}," +
                $"{EscapeCsv(u.Grade)}," +
                $"{u.CreatedAt:yyyy-MM-dd}," +
                $"{activeToken is not null}," +
                $"{activeToken?.ExpiresAt:yyyy-MM-dd}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"studyhub-users-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [HttpGet("export/payments")]
    public async Task<IActionResult> ExportPayments()
    {
        var payments = await db.PaymentRecords
            .Include(p => p.User)
            .Include(p => p.Token)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var csv = new System.Text.StringBuilder();
        csv.AppendLine("Id,UserName,UserEmail,Plan,Amount,Channel,TokenCode,CreatedAt");

        foreach (var p in payments)
        {
            csv.AppendLine(
                $"{EscapeCsv(p.Id.ToString())}," +
                $"{EscapeCsv(p.User.Name)}," +
                $"{EscapeCsv(p.User.Email)}," +
                $"{EscapeCsv(p.Plan.ToString())}," +
                $"{p.Amount}," +
                $"{EscapeCsv(p.Channel)}," +
                $"{EscapeCsv(p.Token.Code)}," +
                $"{p.CreatedAt:yyyy-MM-dd}");
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv.ToString());
        return File(bytes, "text/csv", $"studyhub-payments-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    // ── Revenue Adjustments ───────────────────────────────
    [HttpPost("revenue-adjustments")]
    public async Task<IActionResult> AddRevenueAdjustment([FromBody] RevenueAdjustmentRequest req)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var adj = new RevenueAdjustment
        {
            Amount = req.Amount,
            Reason = req.Reason,
            AdminId = adminId
        };
        db.RevenueAdjustments.Add(adj);
        
        db.AuditLogs.Add(new AuditLog
        {
            ActorId = adminId,
            Action = "REVENUE_ADJUSTMENT",
            Meta = $"{{\"amount\":{req.Amount}, \"reason\":\"{req.Reason}\"}}"
        });

        await db.SaveChangesAsync();
        
        // Invalidate stats cache so the new revenue shows up immediately
        cache.Remove("admin_stats");

        return Ok(new { message = "Revenue adjusted successfully." });
    }

    /// <summary>
    /// Sanitizes a value for safe inclusion in a CSV field.
    /// Prevents formula injection by prefixing dangerous leading characters,
    /// and wraps fields containing commas, quotes, or newlines in double quotes.
    /// </summary>
    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        // Prevent formula injection: prefix with ' if starts with =, +, -, @
        if (value[0] is '=' or '+' or '-' or '@')
            value = "'" + value;
        // Wrap in quotes if contains comma, quote, or newline
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"\"")}\"";
        return value;
    }
}

public record CreateUserRequest(string Name, string Email, string Password, UserRole Role, Guid SchoolId, string? Grade);
public record ChangeRoleRequest(UserRole Role);
public record CreateSchoolRequest(string Name, string City, string? LogoUrl);
public record UpdateRequestStatusRequest(RequestStatus Status);
public record RevenueAdjustmentRequest(decimal Amount, string Reason);