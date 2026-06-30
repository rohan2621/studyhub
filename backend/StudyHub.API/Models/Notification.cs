namespace StudyHub.API.Models;

public enum NotificationType
{
    NewHomework,
    HomeworkDue,
    TokenActivated,
    TokenExpiringSoon,
    TokenExpired,
    NewNote,
    NewAnnouncement,
    HomeworkGraded,
    CustomRequestFulfilled
}

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}