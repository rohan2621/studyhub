namespace StudyHub.API.Models.Learn;

public enum ResourceType { Text, Image, Video, PDF, Code, Link, Download }

public class LessonResource
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public string Title { get; set; } = null!;
    public ResourceType ResourceType { get; set; }
    public string Content { get; set; } = null!;
    public int SortOrder { get; set; }

    public Lesson Lesson { get; set; } = null!;
}
