namespace StudyHub.API.Models.Learn;

public class QuizQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid QuizId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string[] Options { get; set; } = [];
    public int CorrectOptionIndex { get; set; }
    public string? Explanation { get; set; }
    public int SortOrder { get; set; }

    public Quiz Quiz { get; set; } = null!;
}
