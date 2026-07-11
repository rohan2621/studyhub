using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;

namespace StudyHub.API.Services;

public class RecommendationService
{
    private readonly AppDbContext _context;

    public RecommendationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lesson>> GetRecommendedLessonsAsync(Guid userId)
    {
        // Next incomplete lesson in enrolled courses
        var enrolledCourseIds = await _context.UserCourseProgresses
            .Where(p => p.UserId == userId && p.Status == CourseProgressStatus.InProgress)
            .Select(p => p.CourseId)
            .ToListAsync();

        var recommended = new List<Lesson>();
        foreach (var courseId in enrolledCourseIds)
        {
            var nextLesson = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .OrderBy(l => l.SortOrder)
                .FirstOrDefaultAsync(l => !_context.UserLessonProgresses
                    .Any(ulp => ulp.UserId == userId && ulp.LessonId == l.Id && ulp.Status == LessonProgressStatus.Completed));
            
            if (nextLesson != null)
            {
                recommended.Add(nextLesson);
            }
        }
        return recommended;
    }

    public async Task<List<Lesson>> GetWeakTopicsAsync(Guid userId)
    {
        // Lessons where quiz score < 70%
        var weakQuizIds = await _context.QuizAttempts
            .Where(qa => qa.UserId == userId && qa.Score < 70)
            .Select(qa => qa.QuizId)
            .Distinct()
            .ToListAsync();

        var weakLessons = await _context.Quizzes
            .Where(q => weakQuizIds.Contains(q.Id))
            .Select(q => q.Lesson)
            .Where(l => l != null)
            .ToListAsync();

        return weakLessons!;
    }

    public async Task<Course?> GetNextCourseAsync(Guid userId, Guid domainId)
    {
        var completedCourseIds = await _context.UserCourseProgresses
            .Where(p => p.UserId == userId && p.Status == CourseProgressStatus.Completed)
            .Select(p => p.CourseId)
            .ToListAsync();

        var unstartedCourses = await _context.Courses
            .Include(c => c.Prerequisites)
            .Where(c => c.DomainId == domainId && 
                        !_context.UserCourseProgresses.Any(p => p.UserId == userId && p.CourseId == c.Id))
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        foreach (var course in unstartedCourses)
        {
            var allPrereqsMet = course.Prerequisites.All(p => completedCourseIds.Contains(p.PrerequisiteCourseId));
            if (allPrereqsMet)
            {
                return course;
            }
        }

        return null;
    }

    public async Task<bool> ShouldReviseAsync(Guid userId, Guid lessonId)
    {
        // True if flashcard review due (>3 days since last)
        var dueFlashcards = await _context.FlashcardProgresses
            .Include(fp => fp.Flashcard)
            .ThenInclude(f => f.Deck)
            .Where(fp => fp.UserId == userId && 
                         fp.Flashcard.Deck.LessonId == lessonId && 
                         fp.LastReviewedAt < DateTime.UtcNow.AddDays(-3))
            .AnyAsync();

        return dueFlashcards;
    }

    public async Task<string> GetStreakMotivationAsync(Guid userId)
    {
        var streak = await _context.LearningStreaks.FirstOrDefaultAsync(s => s.UserId == userId);
        if (streak == null || streak.CurrentStreak == 0) return "Start your learning streak today!";
        if (streak.CurrentStreak < 3) return "Great start! Keep it up for a 3-day streak.";
        if (streak.CurrentStreak < 7) return "You're on fire! Almost at a full week.";
        return $"Amazing! You've maintained a {streak.CurrentStreak}-day streak!";
    }
}
