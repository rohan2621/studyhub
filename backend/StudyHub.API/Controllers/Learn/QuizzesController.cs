using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly XpService _xpService;
    private readonly AchievementService _achievementService;

    public QuizzesController(AppDbContext context, XpService xpService, AchievementService achievementService)
    {
        _context = context;
        _xpService = xpService;
        _achievementService = achievementService;
    }

    [HttpGet("{lessonId}")]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions.OrderBy(qs => qs.SortOrder))
            .FirstOrDefaultAsync(q => q.LessonId == lessonId);

        if (quiz == null) return NotFound();

        var result = new
        {
            quiz.Id,
            quiz.LessonId,
            quiz.Title,
            quiz.PassScorePercent,
            quiz.MaxAttempts,
            Questions = quiz.Questions.Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.Options,
                q.SortOrder,
            })
        };

        return Ok(result);
    }

    public class QuizSubmitDto
    {
        public Dictionary<Guid, int> Answers { get; set; } = new();
    }

    [HttpPost("{quizId}/submit")]
    [Authorize]
    public async Task<IActionResult> Submit(Guid quizId, [FromBody] QuizSubmitDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == quizId);
            
        if (quiz == null) return NotFound();

        if (quiz.MaxAttempts > 0)
        {
            var attemptCount = await _context.QuizAttempts.CountAsync(a => a.UserId == userId && a.QuizId == quizId);
            if (attemptCount >= quiz.MaxAttempts)
            {
                return BadRequest(new { error = "Maximum quiz attempts reached." });
            }
        }

        int correctCount = 0;
        foreach (var q in quiz.Questions)
        {
            if (dto.Answers.TryGetValue(q.Id, out var userAns) && userAns == q.CorrectOptionIndex)
            {
                correctCount++;
            }
        }
        
        var score = quiz.Questions.Count > 0 ? (int)Math.Round((double)correctCount / quiz.Questions.Count * 100) : 100;
        var passed = score >= quiz.PassScorePercent;

        var attempt = new QuizAttempt
        {
            UserId = userId,
            QuizId = quizId,
            Score = score,
            Passed = passed,
            AttemptedAt = DateTime.UtcNow,
            AnswersJson = System.Text.Json.JsonSerializer.Serialize(dto.Answers)
        };
        
        _context.QuizAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        if (passed)
        {
            var previousPass = await _context.QuizAttempts
                .AnyAsync(qa => qa.UserId == userId && qa.QuizId == quizId && qa.Passed && qa.Id != attempt.Id);
                
            var xpReward = previousPass ? 25 : 50;
            await _xpService.AwardXpAsync(userId, XpSource.QuizPass, quizId, xpReward);
            await _achievementService.CheckAndAwardAsync(userId);
        }

        return Ok(new { Score = score, Passed = passed, AttemptId = attempt.Id });
    }

    [HttpGet("{quizId}/attempts")]
    [Authorize]
    public async Task<IActionResult> GetAttempts(Guid quizId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var attempts = await _context.QuizAttempts
            .Where(a => a.UserId == userId && a.QuizId == quizId)
            .OrderByDescending(a => a.AttemptedAt)
            .ToListAsync();
            
        return Ok(attempts);
    }
}
