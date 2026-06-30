namespace StudyHub.API.Models;

public class NoteUpvote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid NoteId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Note Note { get; set; } = null!;
    public User User { get; set; } = null!;
}