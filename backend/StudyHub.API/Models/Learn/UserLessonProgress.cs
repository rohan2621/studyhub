namespace StudyHub.API.Models.Learn;

public enum LessonProgressStatus { NotStarted, InProgress, Completed }

public class UserLessonProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public LessonProgressStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int TimeSpentSeconds { get; set; }
    public DateTime? LastAccessedAt { get; set; }

    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
