namespace StudyHub.API.Models;

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HomeworkId { get; set; }
    public Guid StudentId { get; set; }
    public string FileUrl { get; set; } = null!;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public string? Grade { get; set; }

    public Homework Homework { get; set; } = null!;
    public User Student { get; set; } = null!;
}