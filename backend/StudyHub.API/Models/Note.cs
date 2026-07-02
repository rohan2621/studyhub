namespace StudyHub.API.Models;

public enum NoteType { Note, TopperNote }

public class Note
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    public string Grade { get; set; } = null!;   // "8"–"12"
    public string Subject { get; set; } = null!;
    public string Chapter { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public Guid UploadedBy { get; set; }
    public NoteType Type { get; set; } = NoteType.Note;
    public int Upvotes { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
    public User Uploader { get; set; } = null!;
    public ICollection<NoteUpvote> NoteUpvotesList { get; set; } = [];
}