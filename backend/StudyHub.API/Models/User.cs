namespace StudyHub.API.Models;

public enum UserRole { Student, Teacher, TopperContributor, Admin }

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public UserRole Role { get; set; } = UserRole.Student;
    public Guid SchoolId { get; set; }
    public string Grade { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public School School { get; set; } = null!;
    public ICollection<Token> Tokens { get; set; } = [];
    public ICollection<Device> Devices { get; set; } = [];
    public ICollection<Submission> Submissions { get; set; } = [];
    public ICollection<CustomRequest> CustomRequests { get; set; } = [];
    public ICollection<PaymentRecord> PaymentRecords { get; set; } = [];
    public ICollection<Note> UploadedNotes { get; set; } = [];
    public ICollection<DiscussionThread> DiscussionThreads { get; set; } = [];
    public ICollection<DiscussionReply> DiscussionReplies { get; set; } = [];
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<NoteUpvote> NoteUpvotes { get; set; } = [];
    public ICollection<TokenRenewalRequest> TokenRenewalRequests { get; set; } = [];
}