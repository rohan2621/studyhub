namespace StudyHub.API.Models.Learn;

public class UserAchievement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid AchievementId { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Achievement Achievement { get; set; } = null!;
}
