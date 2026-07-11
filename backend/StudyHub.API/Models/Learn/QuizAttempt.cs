namespace StudyHub.API.Models.Learn;

public class QuizAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid QuizId { get; set; }
    public decimal Score { get; set; }
    public bool Passed { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
    public string? AnswersJson { get; set; }

    public User User { get; set; } = null!;
    public Quiz Quiz { get; set; } = null!;
}
