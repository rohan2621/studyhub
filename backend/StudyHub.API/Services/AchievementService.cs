using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;

namespace StudyHub.API.Services;

public class AchievementService
{
    private readonly AppDbContext _context;
    private readonly XpService _xpService;

    public AchievementService(AppDbContext context, XpService xpService)
    {
        _context = context;
        _xpService = xpService;
    }

    public async Task CheckAndAwardAsync(Guid userId)
    {
        var achievements = await _context.Achievements.ToListAsync();
        var earnedIds = await _context.UserAchievements
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.AchievementId)
            .ToListAsync();

        var unearned = achievements.Where(a => !earnedIds.Contains(a.Id)).ToList();
        
        foreach (var achievement in unearned)
        {
            bool meetsCondition = false;
            
            switch (achievement.Condition)
            {
                case AchievementCondition.CompleteFirstLesson:
                    meetsCondition = await _context.UserLessonProgresses
                        .AnyAsync(ulp => ulp.UserId == userId && ulp.Status == LessonProgressStatus.Completed);
                    break;
                case AchievementCondition.Score100PercentQuiz:
                    meetsCondition = await _context.QuizAttempts
                        .AnyAsync(qa => qa.UserId == userId && qa.Score == 100);
                    break;
                case AchievementCondition.SevenDayStreak:
                    meetsCondition = await _context.LearningStreaks
                        .AnyAsync(ls => ls.UserId == userId && ls.LongestStreak >= 7);
                    break;
                case AchievementCondition.CompleteFullCourse:
                    meetsCondition = await _context.UserCourseProgresses
                        .AnyAsync(ucp => ucp.UserId == userId && ucp.Status == CourseProgressStatus.Completed);
                    break;
                case AchievementCondition.MasterFullDeck:
                    // Requires querying decks where all cards are mastered.
                    // For simplicity, we can check if they have any flashcard progress marked as mastered, 
                    // but accurate check would involve counting cards per deck.
                    // Let's do a simplified check for now: user has mastered at least 10 cards in a single deck.
                    var masteredCount = await _context.FlashcardProgresses
                        .Include(fp => fp.Flashcard)
                        .Where(fp => fp.UserId == userId && fp.Status == FlashcardStatus.Mastered)
                        .GroupBy(fp => fp.Flashcard.DeckId)
                        .Select(g => new { DeckId = g.Key, Count = g.Count() })
                        .FirstOrDefaultAsync();
                    
                    if (masteredCount != null)
                    {
                        var totalInDeck = await _context.Flashcards.CountAsync(f => f.DeckId == masteredCount.DeckId);
                        meetsCondition = totalInDeck > 0 && masteredCount.Count == totalInDeck;
                    }
                    break;
                case AchievementCondition.CompleteFiveLessonsOneDay:
                    // Check if they completed 5 lessons in a single day
                    var today = DateTime.UtcNow.Date;
                    var lessonsToday = await _context.UserLessonProgresses
                        .Where(ulp => ulp.UserId == userId && ulp.Status == LessonProgressStatus.Completed 
                                      && ulp.CompletedAt >= today)
                        .CountAsync();
                    meetsCondition = lessonsToday >= 5;
                    break;
                case AchievementCondition.EnrollThreeDomains:
                    var domainsEnrolled = await _context.UserCourseProgresses
                        .Include(ucp => ucp.Course)
                        .Where(ucp => ucp.UserId == userId)
                        .Select(ucp => ucp.Course.DomainId)
                        .Distinct()
                        .CountAsync();
                    meetsCondition = domainsEnrolled >= 3;
                    break;
            }

            if (meetsCondition)
            {
                var ua = new UserAchievement
                {
                    UserId = userId,
                    AchievementId = achievement.Id,
                    EarnedAt = DateTime.UtcNow
                };
                _context.UserAchievements.Add(ua);
                // We might not award XP from achievements based on table, but if we do:
                // await _xpService.AwardXpAsync(userId, XpSource.StreakBonus, null, achievement.XpReward);
                // Currently XpSource doesn't have 'Achievement' so we'll just record it.
            }
        }
        
        if (_context.ChangeTracker.HasChanges())
        {
            await _context.SaveChangesAsync();
        }
    }
}
