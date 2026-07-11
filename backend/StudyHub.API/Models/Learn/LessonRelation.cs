namespace StudyHub.API.Models.Learn;

public enum RelationType { Prerequisites, SeeAlso, NextStep, BeginnerAlternative, AdvancedExtension }

public class LessonRelation
{
    public Guid LessonId { get; set; }
    public Guid RelatedLessonId { get; set; }
    public RelationType RelationType { get; set; }

    public Lesson Lesson { get; set; } = null!;
    public Lesson RelatedLesson { get; set; } = null!;
}
