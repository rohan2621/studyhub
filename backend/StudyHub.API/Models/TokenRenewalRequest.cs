namespace StudyHub.API.Models;

public enum RenewalRequestStatus { Pending, Approved, Rejected }

public class TokenRenewalRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public TokenPlan RequestedPlan { get; set; }
    public string? Note { get; set; }
    public RenewalRequestStatus Status { get; set; } = RenewalRequestStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}