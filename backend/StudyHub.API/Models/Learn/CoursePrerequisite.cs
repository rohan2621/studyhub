namespace StudyHub.API.Models.Learn;

public class CoursePrerequisite
{
    public Guid CourseId { get; set; }
    public Guid PrerequisiteCourseId { get; set; }

    public Course Course { get; set; } = null!;
    public Course PrerequisiteCourse { get; set; } = null!;
}
