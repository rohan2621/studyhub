using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;

namespace StudyHub.API.Services;

public class UserLevelInfo
{
    public int Level { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CurrentXp { get; set; }
    public int NextLevelXp { get; set; }
    public int ProgressToNext { get; set; }
}

public class XpService
{
    private readonly AppDbContext _context;

    private static readonly List<(int Level, string Name, int RequiredXp)> Levels = new()
    {
        (1, "Beginner", 0),
        (2, "Explorer", 100),
        (3, "Learner", 250),
        (4, "Scholar", 500),
        (5, "Thinker", 900),
        (6, "Analyst", 1500),
        (7, "Specialist", 2400),
        (8, "Expert", 3800),
        (9, "Master", 6000),
        (10, "Grandmaster", 9500)
    };

    public XpService(AppDbContext context)
    {
        _context = context;
    }

    public async Task AwardXpAsync(Guid userId, XpSource source, Guid? referenceId, int amount)
    {
        var transaction = new XpTransaction
        {
            UserId = userId,
            Source = source,
            ReferenceId = referenceId,
            Amount = amount,
            EarnedAt = DateTime.UtcNow
        };

        _context.XpTransactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task<UserLevelInfo> GetUserLevelAsync(Guid userId)
    {
        var totalXp = await _context.XpTransactions
            .Where(x => x.UserId == userId)
            .SumAsync(x => x.Amount);

        var currentLevelIndex = 0;
        for (int i = 0; i < Levels.Count; i++)
        {
            if (totalXp >= Levels[i].RequiredXp)
            {
                currentLevelIndex = i;
            }
            else
            {
                break;
            }
        }

        var currentLevel = Levels[currentLevelIndex];
        
        int nextLevelXp = currentLevel.RequiredXp; // fallback if max level
        if (currentLevelIndex < Levels.Count - 1)
        {
            nextLevelXp = Levels[currentLevelIndex + 1].RequiredXp;
        }

        return new UserLevelInfo
        {
            Level = currentLevel.Level,
            Name = currentLevel.Name,
            CurrentXp = totalXp,
            NextLevelXp = nextLevelXp,
            ProgressToNext = totalXp >= nextLevelXp ? 0 : totalXp - currentLevel.RequiredXp
        };
    }
}
