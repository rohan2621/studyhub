namespace StudyHub.API.Models.Learn;

public enum AchievementCondition { CompleteFirstLesson, Score100PercentQuiz, SevenDayStreak, CompleteFullCourse, MasterFullDeck, CompleteFiveLessonsOneDay, EnrollThreeDomains }

public class Achievement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Slug { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? IconEmoji { get; set; }
    public int XpReward { get; set; }
    public AchievementCondition Condition { get; set; }

    public ICollection<UserAchievement> UserAchievements { get; set; } = [];
}
