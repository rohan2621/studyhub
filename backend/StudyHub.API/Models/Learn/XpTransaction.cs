namespace StudyHub.API.Models.Learn;

public enum XpSource { LessonComplete, QuizPass, FlashcardMastered, StreakBonus, CourseComplete }

public class XpTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int Amount { get; set; }
    public XpSource Source { get; set; }
    public Guid? ReferenceId { get; set; }
    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
