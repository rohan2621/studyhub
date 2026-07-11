namespace StudyHub.API.Models.Learn;

public class Domain
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Slug { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? IconEmoji { get; set; }
    public string? Color { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Course> Courses { get; set; } = [];
}
