namespace StudyHub.API.Models;

public enum AnnouncementTarget { AllSchools, SpecificSchool, SpecificClass }

public class Announcement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public Guid CreatedByAdminId { get; set; }
    public AnnouncementTarget Target { get; set; }
    public Guid? SchoolId { get; set; }
    public string? Grade { get; set; }
    public string? Section { get; set; }
    public bool IsPinned { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School? School { get; set; }
}