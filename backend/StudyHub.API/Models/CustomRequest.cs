namespace StudyHub.API.Models;

public enum RequestType { Note, Homework, PYQ, TopperNote }
public enum RequestStatus { Open, Fulfilled, Closed }

public class CustomRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public RequestType Type { get; set; }
    public string Subject { get; set; } = null!;
    public string Chapter { get; set; } = null!;
    public string? Note { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}