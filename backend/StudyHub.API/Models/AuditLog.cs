namespace StudyHub.API.Models;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ActorId { get; set; }
    public string Action { get; set; } = null!;
    public Guid? TokenId { get; set; }
    public string? Meta { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Token? Token { get; set; }
}