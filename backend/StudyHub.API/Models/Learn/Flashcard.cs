namespace StudyHub.API.Models.Learn;

public class Flashcard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DeckId { get; set; }
    public string FrontText { get; set; } = null!;
    public string BackText { get; set; } = null!;
    public string? Hint { get; set; }
    public int SortOrder { get; set; }

    public FlashcardDeck Deck { get; set; } = null!;
}
