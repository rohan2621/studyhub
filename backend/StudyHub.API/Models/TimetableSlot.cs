namespace StudyHub.API.Models;

public class TimetableSlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    public string Grade { get; set; } = null!;
    public string Day { get; set; } = null!;
    public int Period { get; set; }
    public string Subject { get; set; } = null!;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }

    public School School { get; set; } = null!;
}