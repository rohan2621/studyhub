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
    public async Task<IActionResult> GetSlots([FromQuery] string? grade, [FromQuery] string? day)
    {
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var query = db.TimetableSlots.Where(t => t.SchoolId == schoolId);
        if (grade is not null) query = query.Where(t => t.Grade == grade);
        if (day is not null) query = query.Where(t => t.Day == day);

        var slots = await query
            .OrderBy(t => t.Day)
            .ThenBy(t => t.Period)
            .Select(t => new
            {
                t.Id,
                t.Grade,
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
        var schoolId = Guid.Parse(User.FindFirstValue("schoolId")!);

        var slot = new TimetableSlot
        {
            SchoolId = schoolId,
            Grade = req.Grade,
            Day = req.Day,
            Period = req.Period,
            Subject = req.Subject,
            StartTime = req.StartTime,
            EndTime = req.EndTime
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

        slot.Grade = req.Grade;
        slot.Day = req.Day;
        slot.Period = req.Period;
        slot.Subject = req.Subject;
        slot.StartTime = req.StartTime;
        slot.EndTime = req.EndTime;

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

public record CreateSlotRequest(string Grade, string Day, int Period, string Subject, TimeOnly StartTime, TimeOnly EndTime);