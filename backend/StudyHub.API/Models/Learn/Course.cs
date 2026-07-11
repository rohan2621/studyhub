namespace StudyHub.API.Models.Learn;

public enum DifficultyLevel { Beginner, Intermediate, Advanced, Expert }

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DomainId { get; set; }
    public string Slug { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public string? WhyItMatters { get; set; }
    public DifficultyLevel DifficultyLevel { get; set; }
    public decimal EstimatedHours { get; set; }
    public string? CoverImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Domain Domain { get; set; } = null!;
    public ICollection<CoursePrerequisite> Prerequisites { get; set; } = [];
    public ICollection<CoursePrerequisite> PrerequisiteFor { get; set; } = [];
    public ICollection<Lesson> Lessons { get; set; } = [];
}
