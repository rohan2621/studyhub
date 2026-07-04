using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Helpers;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("admin/tokens")]
[Authorize(Roles = "Admin")]
public class AdminTokensController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> IssueToken([FromBody] IssueTokenRequest req)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!await db.Users.AnyAsync(u => u.Id == req.UserId))
            return NotFound(new { error = "User not found." });

        var token = new Token
        {
            Code = TokenCodeGenerator.Generate(),
            UserId = req.UserId,
            Plan = req.Plan,
            Status = TokenStatus.Unused
        };

        var payment = new PaymentRecord
        {
            UserId = req.UserId,
            Plan = req.Plan,
            Amount = req.Amount,
            Channel = req.Channel,
            RecordedByAdminId = adminId,
            TokenId = token.Id
        };

        var audit = new AuditLog
        {
            ActorId = adminId,
            Action = "TOKEN_ISSUED",
            TokenId = token.Id,
            Meta = $"{{\"plan\":\"{req.Plan}\",\"userId\":\"{req.UserId}\"}}"
        };

        db.Tokens.Add(token);
        db.PaymentRecords.Add(payment);
        db.AuditLogs.Add(audit);
        await db.SaveChangesAsync();

        return Ok(new { token.Id, token.Code, token.Plan, token.Status });
    }

    [HttpPost("{id}/reset-device")]
    public async Task<IActionResult> ResetDevice(Guid id)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var token = await db.Tokens.FindAsync(id);
        if (token is null) return NotFound();

        token.DeviceId = null;
        token.IpAddress = null;
        token.IsDevicePermanent = false;
        token.Status = TokenStatus.Unused;

        db.AuditLogs.Add(new AuditLog
        {
            ActorId = adminId,
            Action = "DEVICE_RESET",
            TokenId = token.Id
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Device binding cleared. Student can activate on a new device." });
    }

    [HttpPost("{id}/revoke")]
    public async Task<IActionResult> Revoke(Guid id)
    {
        var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var token = await db.Tokens.FindAsync(id);
        if (token is null) return NotFound();

        token.Status = TokenStatus.Revoked;

        db.AuditLogs.Add(new AuditLog
        {
            ActorId = adminId,
            Action = "TOKEN_REVOKED",
            TokenId = token.Id
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Token revoked." });
    }
}

public record IssueTokenRequest(Guid UserId, TokenPlan Plan, decimal Amount, PaymentChannel Channel);