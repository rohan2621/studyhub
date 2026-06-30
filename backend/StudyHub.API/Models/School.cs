namespace StudyHub.API.Models;

public class School
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = [];
    public ICollection<Note> Notes { get; set; } = [];
    public ICollection<Homework> Homeworks { get; set; } = [];
    public ICollection<PastPaper> PastPapers { get; set; } = [];
    public ICollection<TimetableSlot> TimetableSlots { get; set; } = [];
    public ICollection<DiscussionThread> DiscussionThreads { get; set; } = [];
}