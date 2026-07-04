using System;

namespace StudyHub.API.Models;

public enum HireRequestStatus
{
    Pending,
    Accepted,
    Declined
}

public class HireRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Guid TopperId { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public HireRequestStatus Status { get; set; } = HireRequestStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Student { get; set; } = null!;
    public User Topper { get; set; } = null!;
}
