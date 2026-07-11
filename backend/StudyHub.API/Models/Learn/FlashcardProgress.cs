namespace StudyHub.API.Models.Learn;

public enum FlashcardStatus { Unseen, Learning, Mastered }

public class FlashcardProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid FlashcardId { get; set; }
    public FlashcardStatus Status { get; set; }
    public DateTime? LastReviewedAt { get; set; }
    public int ReviewCount { get; set; }

    public User User { get; set; } = null!;
    public Flashcard Flashcard { get; set; } = null!;
}
