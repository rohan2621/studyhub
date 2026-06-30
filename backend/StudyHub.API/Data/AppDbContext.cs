using Microsoft.EntityFrameworkCore;
using StudyHub.API.Models;

namespace StudyHub.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<School> Schools => Set<School>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Token> Tokens => Set<Token>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Homework> Homeworks => Set<Homework>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<PastPaper> PastPapers => Set<PastPaper>();
    public DbSet<TimetableSlot> TimetableSlots => Set<TimetableSlot>();
    public DbSet<DiscussionThread> DiscussionThreads => Set<DiscussionThread>();
    public DbSet<DiscussionReply> DiscussionReplies => Set<DiscussionReply>();
    public DbSet<CustomRequest> CustomRequests => Set<CustomRequest>();
    public DbSet<PaymentRecord> PaymentRecords => Set<PaymentRecord>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<NoteUpvote> NoteUpvotes => Set<NoteUpvote>();
    public DbSet<TokenRenewalRequest> TokenRenewalRequests => Set<TokenRenewalRequest>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.HasIndex(u => u.SchoolId);
            e.Property(u => u.Role).HasConversion<string>();
            e.HasOne(u => u.School).WithMany(s => s.Users).HasForeignKey(u => u.SchoolId);
        });
        b.Entity<Notification>(e =>
{
    e.HasIndex(n => n.UserId);
    e.HasIndex(n => n.IsRead);
    e.HasIndex(n => n.CreatedAt);
    e.Property(n => n.Type).HasConversion<string>();
    e.HasOne(n => n.User).WithMany(u => u.Notifications).HasForeignKey(n => n.UserId);
});

        b.Entity<Announcement>(e =>
        {
            e.HasIndex(a => a.SchoolId);
            e.HasIndex(a => a.CreatedAt);
            e.Property(a => a.Target).HasConversion<string>();
            e.HasOne(a => a.School).WithMany().HasForeignKey(a => a.SchoolId);
        });

        b.Entity<NoteUpvote>(e =>
        {
            e.HasIndex(n => new { n.NoteId, n.UserId }).IsUnique();
            e.HasOne(n => n.Note).WithMany(note => note.NoteUpvotesList).HasForeignKey(n => n.NoteId);
            e.HasOne(n => n.User).WithMany(u => u.NoteUpvotes).HasForeignKey(n => n.UserId);
        });

        b.Entity<TokenRenewalRequest>(e =>
        {
            e.HasIndex(t => t.UserId);
            e.HasIndex(t => t.Status);
            e.Property(t => t.RequestedPlan).HasConversion<string>();
            e.Property(t => t.Status).HasConversion<string>();
            e.HasOne(t => t.User).WithMany(u => u.TokenRenewalRequests).HasForeignKey(t => t.UserId);
        });
        b.Entity<Token>(e =>
        {
            e.HasIndex(t => t.Code).IsUnique();
            e.HasIndex(t => t.UserId);
            e.Property(t => t.Plan).HasConversion<string>();
            e.Property(t => t.Status).HasConversion<string>();
            e.HasOne(t => t.User).WithMany(u => u.Tokens).HasForeignKey(t => t.UserId);
        });

        b.Entity<Note>(e =>
        {
            e.HasIndex(n => n.SchoolId);
            e.HasIndex(n => n.Subject);
            e.HasIndex(n => n.CreatedAt);
            e.Property(n => n.Type).HasConversion<string>();
            e.HasOne(n => n.School).WithMany(s => s.Notes).HasForeignKey(n => n.SchoolId);
            e.HasOne(n => n.Uploader).WithMany(u => u.UploadedNotes).HasForeignKey(n => n.UploadedBy);
        });

        b.Entity<Homework>(e =>
        {
            e.HasIndex(h => h.SchoolId);
            e.HasIndex(h => h.DueAt);
            e.HasOne(h => h.School).WithMany(s => s.Homeworks).HasForeignKey(h => h.SchoolId);
            e.HasOne(h => h.Assigner).WithMany().HasForeignKey(h => h.AssignedBy);
        });

        b.Entity<Submission>(e =>
        {
            e.HasIndex(s => new { s.HomeworkId, s.StudentId }).IsUnique();
            e.HasOne(s => s.Homework).WithMany(h => h.Submissions).HasForeignKey(s => s.HomeworkId);
            e.HasOne(s => s.Student).WithMany(u => u.Submissions).HasForeignKey(s => s.StudentId);
        });

        b.Entity<PastPaper>(e =>
        {
            e.HasIndex(p => p.SchoolId);
            e.HasIndex(p => p.Subject);
            e.HasOne(p => p.School).WithMany(s => s.PastPapers).HasForeignKey(p => p.SchoolId);
        });

        b.Entity<TimetableSlot>(e =>
        {
            e.HasIndex(t => new { t.SchoolId, t.Grade });
            e.HasOne(t => t.School).WithMany(s => s.TimetableSlots).HasForeignKey(t => t.SchoolId);
        });

        b.Entity<DiscussionThread>(e =>
        {
            e.HasIndex(d => d.SchoolId);
            e.HasIndex(d => d.CreatedAt);
            e.HasOne(d => d.School).WithMany(s => s.DiscussionThreads).HasForeignKey(d => d.SchoolId);
            e.HasOne(d => d.Author).WithMany(u => u.DiscussionThreads).HasForeignKey(d => d.AuthorId);
        });

        b.Entity<DiscussionReply>(e =>
        {
            e.HasIndex(r => r.ThreadId);
            e.HasOne(r => r.Thread).WithMany(t => t.Replies).HasForeignKey(r => r.ThreadId);
            e.HasOne(r => r.Author).WithMany(u => u.DiscussionReplies).HasForeignKey(r => r.AuthorId);
        });

        b.Entity<CustomRequest>(e =>
        {
            e.HasIndex(c => c.UserId);
            e.Property(c => c.Type).HasConversion<string>();
            e.Property(c => c.Status).HasConversion<string>();
            e.HasOne(c => c.User).WithMany(u => u.CustomRequests).HasForeignKey(c => c.UserId);
        });

        b.Entity<PaymentRecord>(e =>
        {
            e.HasIndex(p => p.UserId);
            e.Property(p => p.Plan).HasConversion<string>();
            e.Property(p => p.Channel).HasConversion<string>();
            e.HasOne(p => p.User).WithMany(u => u.PaymentRecords).HasForeignKey(p => p.UserId);
            e.HasOne(p => p.Token).WithOne(t => t.PaymentRecord).HasForeignKey<PaymentRecord>(p => p.TokenId);
        });

        b.Entity<AuditLog>(e =>
        {
            e.HasIndex(a => a.ActorId);
            e.HasIndex(a => a.CreatedAt);
            e.HasOne(a => a.Token).WithMany(t => t.AuditLogs).HasForeignKey(a => a.TokenId);
        });
        b.Entity<PasswordResetToken>(e =>
        {
            e.HasIndex(p => p.TokenHash).IsUnique();
            e.HasIndex(p => p.UserId);
            e.HasIndex(p => p.ExpiresAt);
            e.HasOne(p => p.User).WithMany(u => u.PasswordResetTokens).HasForeignKey(p => p.UserId);
        });
    }
}