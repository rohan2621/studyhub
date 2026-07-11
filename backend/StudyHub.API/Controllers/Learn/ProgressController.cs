using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly XpService _xpService;
    private readonly RecommendationService _recommendationService;

    public ProgressController(AppDbContext context, XpService xpService, RecommendationService recommendationService)
    {
        _context = context;
        _xpService = xpService;
        _recommendationService = recommendationService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var enrolledCourses = await _context.UserCourseProgresses
            .Include(p => p.Course)
            .Where(p => p.UserId == userId)
            .ToListAsync();
            
        var levelInfo = await _xpService.GetUserLevelAsync(userId);
        var streak = await _context.LearningStreaks.FirstOrDefaultAsync(s => s.UserId == userId);
        
        return Ok(new { EnrolledCourses = enrolledCourses, Level = levelInfo, Streak = streak });
    }

    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var nextLessons = await _recommendationService.GetRecommendedLessonsAsync(userId);
        var weakLessons = await _recommendationService.GetWeakTopicsAsync(userId);
        var streakMotivation = await _recommendationService.GetStreakMotivationAsync(userId);

        return Ok(new { NextLessons = nextLessons, WeakLessons = weakLessons, Motivation = streakMotivation });
    }

    [HttpGet("achievements")]
    public async Task<IActionResult> GetAchievements()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var allAchievements = await _context.Achievements.OrderBy(a => a.XpReward).ToListAsync();
        var earnedIds = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.AchievementId)
            .ToListAsync();
            
        var results = allAchievements.Select(a => new {
            a.Id,
            a.Slug,
            a.Title,
            a.Description,
            a.IconEmoji,
            a.XpReward,
            Earned = earnedIds.Contains(a.Id)
        });

        return Ok(results);
    }

    [HttpGet("streak")]
    public async Task<IActionResult> GetStreak()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var streak = await _context.LearningStreaks.FirstOrDefaultAsync(s => s.UserId == userId);
        if (streak == null) return Ok(new { CurrentStreak = 0, LongestStreak = 0, TotalDaysActive = 0 });
        return Ok(streak);
    }

    [HttpGet("skill-tree/{courseId}")]
    public async Task<IActionResult> GetSkillTree(Guid courseId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var lessons = await _context.Lessons
            .Where(l => l.CourseId == courseId && l.IsPublished)
            .OrderBy(l => l.SortOrder)
            .ToListAsync();
            
        var progress = await _context.UserLessonProgresses
            .Where(p => p.UserId == userId && p.Lesson.CourseId == courseId)
            .ToDictionaryAsync(p => p.LessonId, p => p.Status);
            
        var nodes = lessons.Select(l => new {
            l.Id,
            l.Title,
            l.Slug,
            l.SortOrder,
            Status = progress.ContainsKey(l.Id) ? progress[l.Id].ToString() : "Locked"
        });
        
        return Ok(nodes);
    }
}
