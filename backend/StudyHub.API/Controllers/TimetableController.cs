using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;
using System.Security.Claims;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("timetable")]
[Authorize]
public class TimetableController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSlots([FromQuery] string? day)
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var grade = User.FindFirstValue("grade") ?? "";
        var section = User.FindFirstValue("section") ?? "A";
        var isAdmin = User.IsInRole("Admin");

        var query = db.TimetableSlots.Where(t => t.SchoolId == schoolId);

        if (!isAdmin)
        {
            // Students auto-scoped to their grade + section
            query = query.Where(t => t.Grade == grade && t.Section == section);
        }
        else
        {
            // Admin can filter manually
            if (Request.Query.ContainsKey("grade"))   query = query.Where(t => t.Grade   == Request.Query["grade"].ToString());
            if (Request.Query.ContainsKey("section")) query = query.Where(t => t.Section == Request.Query["section"].ToString());
        }

        if (day is not null) query = query.Where(t => t.Day == day);

        var slots = await query
            .OrderBy(t => t.Day)
            .ThenBy(t => t.Period)
            .Select(t => new
            {
                t.Id,
                t.Grade,
                t.Section,
                t.Day,
                t.Period,
                t.Subject,
                t.StartTime,
                t.EndTime
            })
            .ToListAsync();

        return Ok(slots);
    }

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest req)
    {
        var claimsSchoolId = Guid.Parse(User.FindFirstValue("schoolId")!);
        var isAdmin = User.IsInRole("Admin");

        // Validate grade and section
        if (!new[] { "8", "9", "10", "11", "12" }.Contains(req.Grade))
            return BadRequest(new { error = "Grade must be 8–12." });
        if (!new[] { "A", "B", "C", "D", "E" }.Contains(req.Section.ToUpper()))
            return BadRequest(new { error = "Section must be A–E." });

        var schoolId = isAdmin && req.TargetSchoolId.HasValue
            ? req.TargetSchoolId.Value
            : claimsSchoolId;

        var slot = new TimetableSlot
        {
            SchoolId = schoolId,
            Grade    = req.Grade,
            Section  = req.Section.ToUpper(),
            Day      = req.Day,
            Period   = req.Period,
            Subject  = req.Subject,
            StartTime = req.StartTime,
            EndTime   = req.EndTime
        };

        db.TimetableSlots.Add(slot);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSlots), new { }, new { slot.Id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateSlotRequest req)
    {
        var slot = await db.TimetableSlots.FindAsync(id);
        if (slot is null) return NotFound();

        slot.Grade   = req.Grade;
        slot.Section = req.Section.ToUpper();
        slot.Day     = req.Day;
        slot.Period  = req.Period;
        slot.Subject = req.Subject;
        slot.StartTime = req.StartTime;
        slot.EndTime   = req.EndTime;

        await db.SaveChangesAsync();
        return Ok(new { slot.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var slot = await db.TimetableSlots.FindAsync(id);
        if (slot is null) return NotFound();
        db.TimetableSlots.Remove(slot);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateSlotRequest(
    string Grade, string Section, string Day, int Period,
    string Subject, TimeOnly StartTime, TimeOnly EndTime,
    Guid? TargetSchoolId = null);