namespace StudyHub.API.Models.Learn;

public enum LessonType { Introduction, Concept, Practice, Assessment, Project }

public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CourseId { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Summary { get; set; }
    public string? ContentMarkdown { get; set; }
    public LessonType LessonType { get; set; }
    public int SortOrder { get; set; }
    public int EstimatedMinutes { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Course Course { get; set; } = null!;
    public ICollection<LessonResource> Resources { get; set; } = [];
    public ICollection<LessonRelation> RelatedLessons { get; set; } = [];
    public ICollection<LessonRelation> RelatedTo { get; set; } = [];
}
