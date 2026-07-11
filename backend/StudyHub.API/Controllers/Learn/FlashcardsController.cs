using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models.Learn;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/flashcards")]
public class FlashcardsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly XpService _xpService;
    private readonly AchievementService _achievementService;

    public FlashcardsController(AppDbContext context, XpService xpService, AchievementService achievementService)
    {
        _context = context;
        _xpService = xpService;
        _achievementService = achievementService;
    }

    [HttpGet("{deckId}")]
    public async Task<IActionResult> GetDeck(Guid deckId)
    {
        var cards = await _context.Flashcards
            .Where(c => c.DeckId == deckId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
            
        return Ok(cards);
    }

    public class FlashcardReviewDto
    {
        public FlashcardStatus Status { get; set; }
    }

    [HttpPost("{cardId}/review")]
    [Authorize]
    public async Task<IActionResult> Review(Guid cardId, [FromBody] FlashcardReviewDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var progress = await _context.FlashcardProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.FlashcardId == cardId);
            
        bool newlyMastered = false;

        if (progress == null)
        {
            progress = new FlashcardProgress
            {
                UserId = userId,
                FlashcardId = cardId,
                Status = dto.Status,
                LastReviewedAt = DateTime.UtcNow,
                ReviewCount = 1
            };
            _context.FlashcardProgresses.Add(progress);
            if (dto.Status == FlashcardStatus.Mastered) newlyMastered = true;
        }
        else
        {
            if (progress.Status != FlashcardStatus.Mastered && dto.Status == FlashcardStatus.Mastered)
            {
                newlyMastered = true;
            }
            progress.Status = dto.Status;
            progress.LastReviewedAt = DateTime.UtcNow;
            progress.ReviewCount++;
        }
        
        await _context.SaveChangesAsync();

        if (newlyMastered)
        {
            var card = await _context.Flashcards.FindAsync(cardId);
            if (card != null)
            {
                var allCards = await _context.Flashcards.Where(c => c.DeckId == card.DeckId).Select(c => c.Id).ToListAsync();
                var masteredCards = await _context.FlashcardProgresses
                    .Where(p => p.UserId == userId && p.Status == FlashcardStatus.Mastered && allCards.Contains(p.FlashcardId))
                    .Select(p => p.FlashcardId)
                    .ToListAsync();
                    
                if (allCards.Count > 0 && masteredCards.Count == allCards.Count)
                {
                    await _xpService.AwardXpAsync(userId, XpSource.FlashcardMastered, card.DeckId, 30);
                    await _achievementService.CheckAndAwardAsync(userId);
                }
            }
        }

        return Ok(progress);
    }

    [HttpGet("progress/{deckId}")]
    [Authorize]
    public async Task<IActionResult> GetDeckProgress(Guid deckId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var deckCards = await _context.Flashcards.Where(c => c.DeckId == deckId).Select(c => c.Id).ToListAsync();
        
        var progress = await _context.FlashcardProgresses
            .Where(p => p.UserId == userId && deckCards.Contains(p.FlashcardId))
            .ToListAsync();
            
        var stats = new
        {
            Total = deckCards.Count,
            Unseen = deckCards.Count - progress.Count,
            Learning = progress.Count(p => p.Status == FlashcardStatus.Learning),
            Mastered = progress.Count(p => p.Status == FlashcardStatus.Mastered)
        };
        
        return Ok(stats);
    }
}
