namespace StudyHub.API.Models;

public class Homework
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    public string Grade { get; set; } = null!;     // "8"–"12"
    public string Section { get; set; } = "A";     // "A"–"E"
    public string Subject { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime DueAt { get; set; }
    public Guid AssignedBy { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
    public User Assigner { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = [];
}