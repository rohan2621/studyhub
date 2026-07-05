namespace StudyHub.API.Models;

public class RevenueAdjustment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal Amount { get; set; }
    public string Reason { get; set; } = null!;
    public Guid AdminId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Admin { get; set; } = null!;
}
