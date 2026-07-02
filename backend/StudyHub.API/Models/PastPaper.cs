namespace StudyHub.API.Models;

public class PastPaper
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SchoolId { get; set; }
    public string? Grade { get; set; }           // null = all grades; "8"–"12" = grade-specific
    public string? Section { get; set; }
    public string Subject { get; set; } = null!;
    public int Year { get; set; }
    public string Term { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
}