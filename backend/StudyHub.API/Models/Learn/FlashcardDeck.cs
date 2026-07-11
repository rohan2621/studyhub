namespace StudyHub.API.Models.Learn;

public class FlashcardDeck
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public Guid? LessonId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }

    public Course Course { get; set; } = null!;
    public Lesson? Lesson { get; set; }
    public ICollection<Flashcard> Flashcards { get; set; } = [];
}
