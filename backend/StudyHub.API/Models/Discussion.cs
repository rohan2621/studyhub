namespace StudyHub.API.Models;

public class DiscussionThread
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    public string Subject { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public Guid AuthorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
    public User Author { get; set; } = null!;
    public ICollection<DiscussionReply> Replies { get; set; } = [];
}

public class DiscussionReply
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ThreadId { get; set; }
    public Guid AuthorId { get; set; }
    public string Body { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DiscussionThread Thread { get; set; } = null!;
    public User Author { get; set; } = null!;
}