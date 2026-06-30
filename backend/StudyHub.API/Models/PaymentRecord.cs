namespace StudyHub.API.Models;

public enum PaymentChannel { WhatsApp, eSewa, Khalti, Cash, Bank }

public class PaymentRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public TokenPlan Plan { get; set; }
    public decimal Amount { get; set; }
    public PaymentChannel Channel { get; set; }
    public Guid RecordedByAdminId { get; set; }
    public Guid TokenId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Token Token { get; set; } = null!;
}