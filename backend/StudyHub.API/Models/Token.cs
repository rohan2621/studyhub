namespace StudyHub.API.Models;

public enum TokenStatus { Unused, Active, Expired, Revoked }

public enum TokenPlan
{
    OneWeek,
    OneMonth,
    TwoMonths,
    ThreeMonths,
    SixMonths,
    OneYear
}

public class Token
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = null!;
    public Guid UserId { get; set; }
    public TokenPlan Plan { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    public TokenStatus Status { get; set; } = TokenStatus.Unused;
    public string? DeviceId { get; set; }

    public User User { get; set; } = null!;
    public PaymentRecord? PaymentRecord { get; set; }
    public ICollection<AuditLog> AuditLogs { get; set; } = [];
}