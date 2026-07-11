namespace StudyHub.API.Models.Learn;

public class Quiz
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public string Title { get; set; } = null!;
    public decimal PassScorePercent { get; set; }
    public int MaxAttempts { get; set; }

    public Lesson Lesson { get; set; } = null!;
    public ICollection<QuizQuestion> Questions { get; set; } = [];
}
