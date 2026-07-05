namespace StudyHub.API.Models;

public class SchoolSubjectCatalog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    
    // E.g., "10", "11"
    public string Grade { get; set; } = null!;
    
    // E.g., "A", "B", or "" for All
    public string? Section { get; set; }
    
    // E.g., "Physics", "Chemistry"
    public string Subject { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
}
