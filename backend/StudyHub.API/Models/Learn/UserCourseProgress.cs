namespace StudyHub.API.Models.Learn;

public enum CourseProgressStatus { Enrolled, InProgress, Completed }

public class UserCourseProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public CourseProgressStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int TotalXpEarned { get; set; }

    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
