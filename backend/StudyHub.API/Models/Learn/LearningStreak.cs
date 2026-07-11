namespace StudyHub.API.Models.Learn;

public class LearningStreak
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime LastActivityDate { get; set; }
    public int TotalDaysActive { get; set; }

    public User User { get; set; } = null!;
}
