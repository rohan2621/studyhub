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
    public DbSet<HireRequest> HireRequests => Set<HireRequest>();
    public DbSet<RevenueAdjustment> RevenueAdjustments => Set<RevenueAdjustment>();
    public DbSet<AppRelease> AppReleases => Set<AppRelease>();
    public DbSet<SchoolSubjectCatalog> SubjectCatalogs => Set<SchoolSubjectCatalog>();

    // Learn Module DbSets
    public DbSet<StudyHub.API.Models.Learn.Domain> Domains => Set<StudyHub.API.Models.Learn.Domain>();
    public DbSet<StudyHub.API.Models.Learn.Course> Courses => Set<StudyHub.API.Models.Learn.Course>();
    public DbSet<StudyHub.API.Models.Learn.CoursePrerequisite> CoursePrerequisites => Set<StudyHub.API.Models.Learn.CoursePrerequisite>();
    public DbSet<StudyHub.API.Models.Learn.Lesson> Lessons => Set<StudyHub.API.Models.Learn.Lesson>();
    public DbSet<StudyHub.API.Models.Learn.LessonResource> LessonResources => Set<StudyHub.API.Models.Learn.LessonResource>();
    public DbSet<StudyHub.API.Models.Learn.LessonRelation> LessonRelations => Set<StudyHub.API.Models.Learn.LessonRelation>();
    public DbSet<StudyHub.API.Models.Learn.Quiz> Quizzes => Set<StudyHub.API.Models.Learn.Quiz>();
    public DbSet<StudyHub.API.Models.Learn.QuizQuestion> QuizQuestions => Set<StudyHub.API.Models.Learn.QuizQuestion>();
    public DbSet<StudyHub.API.Models.Learn.FlashcardDeck> FlashcardDecks => Set<StudyHub.API.Models.Learn.FlashcardDeck>();
    public DbSet<StudyHub.API.Models.Learn.Flashcard> Flashcards => Set<StudyHub.API.Models.Learn.Flashcard>();
    public DbSet<StudyHub.API.Models.Learn.UserCourseProgress> UserCourseProgresses => Set<StudyHub.API.Models.Learn.UserCourseProgress>();
    public DbSet<StudyHub.API.Models.Learn.UserLessonProgress> UserLessonProgresses => Set<StudyHub.API.Models.Learn.UserLessonProgress>();
    public DbSet<StudyHub.API.Models.Learn.QuizAttempt> QuizAttempts => Set<StudyHub.API.Models.Learn.QuizAttempt>();
    public DbSet<StudyHub.API.Models.Learn.FlashcardProgress> FlashcardProgresses => Set<StudyHub.API.Models.Learn.FlashcardProgress>();
    public DbSet<StudyHub.API.Models.Learn.LearningStreak> LearningStreaks => Set<StudyHub.API.Models.Learn.LearningStreak>();
    public DbSet<StudyHub.API.Models.Learn.XpTransaction> XpTransactions => Set<StudyHub.API.Models.Learn.XpTransaction>();
    public DbSet<StudyHub.API.Models.Learn.Achievement> Achievements => Set<StudyHub.API.Models.Learn.Achievement>();
    public DbSet<StudyHub.API.Models.Learn.UserAchievement> UserAchievements => Set<StudyHub.API.Models.Learn.UserAchievement>();
    public DbSet<StudyHub.API.Models.Learn.CourseBookmark> CourseBookmarks => Set<StudyHub.API.Models.Learn.CourseBookmark>();
    public DbSet<StudyHub.API.Models.Learn.LessonComment> LessonComments => Set<StudyHub.API.Models.Learn.LessonComment>();
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
        b.Entity<HireRequest>(e =>
        {
            e.HasIndex(h => h.StudentId);
            e.HasIndex(h => h.TopperId);
            e.Property(h => h.Status).HasConversion<string>();
            e.HasOne(h => h.Student).WithMany().HasForeignKey(h => h.StudentId);
            e.HasOne(h => h.Topper).WithMany().HasForeignKey(h => h.TopperId);
        });
        b.Entity<RevenueAdjustment>(e =>
        {
            e.HasIndex(r => r.CreatedAt);
            e.HasOne(r => r.Admin).WithMany().HasForeignKey(r => r.AdminId);
        });

        b.Entity<SchoolSubjectCatalog>(e =>
        {
            e.HasIndex(s => s.SchoolId);
            e.HasIndex(s => new { s.SchoolId, s.Grade, s.Section, s.Subject }).IsUnique();
            e.HasOne(s => s.School).WithMany().HasForeignKey(s => s.SchoolId);
        });

        // Learn Module Configurations
        b.Entity<StudyHub.API.Models.Learn.Domain>(e =>
        {
            e.HasIndex(d => d.Slug).IsUnique();
        });

        b.Entity<StudyHub.API.Models.Learn.Course>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.DifficultyLevel).HasConversion<string>();
            e.HasOne(c => c.Domain).WithMany(d => d.Courses).HasForeignKey(c => c.DomainId);
        });

        b.Entity<StudyHub.API.Models.Learn.CoursePrerequisite>(e =>
        {
            e.HasKey(cp => new { cp.CourseId, cp.PrerequisiteCourseId });
            e.HasOne(cp => cp.Course).WithMany(c => c.Prerequisites).HasForeignKey(cp => cp.CourseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(cp => cp.PrerequisiteCourse).WithMany(c => c.PrerequisiteFor).HasForeignKey(cp => cp.PrerequisiteCourseId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.Lesson>(e =>
        {
            e.HasIndex(l => l.Slug).IsUnique();
            e.Property(l => l.LessonType).HasConversion<string>();
            e.HasOne(l => l.Course).WithMany(c => c.Lessons).HasForeignKey(l => l.CourseId);
        });

        b.Entity<StudyHub.API.Models.Learn.LessonResource>(e =>
        {
            e.Property(lr => lr.ResourceType).HasConversion<string>();
            e.HasOne(lr => lr.Lesson).WithMany(l => l.Resources).HasForeignKey(lr => lr.LessonId);
        });

        b.Entity<StudyHub.API.Models.Learn.LessonRelation>(e =>
        {
            e.HasKey(lr => new { lr.LessonId, lr.RelatedLessonId });
            e.Property(lr => lr.RelationType).HasConversion<string>();
            e.HasOne(lr => lr.Lesson).WithMany(l => l.RelatedLessons).HasForeignKey(lr => lr.LessonId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(lr => lr.RelatedLesson).WithMany(l => l.RelatedTo).HasForeignKey(lr => lr.RelatedLessonId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.Quiz>(e =>
        {
            e.HasIndex(q => q.LessonId).IsUnique();
            e.HasOne(q => q.Lesson).WithOne().HasForeignKey<StudyHub.API.Models.Learn.Quiz>(q => q.LessonId);
        });

        b.Entity<StudyHub.API.Models.Learn.QuizQuestion>(e =>
        {
            e.HasOne(qq => qq.Quiz).WithMany(q => q.Questions).HasForeignKey(qq => qq.QuizId);
        });

        b.Entity<StudyHub.API.Models.Learn.FlashcardDeck>(e =>
        {
            e.HasOne(fd => fd.Course).WithMany().HasForeignKey(fd => fd.CourseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(fd => fd.Lesson).WithMany().HasForeignKey(fd => fd.LessonId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.Flashcard>(e =>
        {
            e.HasOne(f => f.Deck).WithMany(fd => fd.Flashcards).HasForeignKey(f => f.DeckId);
        });

        b.Entity<StudyHub.API.Models.Learn.UserCourseProgress>(e =>
        {
            e.HasIndex(ucp => new { ucp.UserId, ucp.CourseId }).IsUnique();
            e.Property(ucp => ucp.Status).HasConversion<string>();
            e.HasOne(ucp => ucp.User).WithMany().HasForeignKey(ucp => ucp.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ucp => ucp.Course).WithMany().HasForeignKey(ucp => ucp.CourseId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.UserLessonProgress>(e =>
        {
            e.HasIndex(ulp => new { ulp.UserId, ulp.LessonId }).IsUnique();
            e.Property(ulp => ulp.Status).HasConversion<string>();
            e.HasOne(ulp => ulp.User).WithMany().HasForeignKey(ulp => ulp.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ulp => ulp.Lesson).WithMany().HasForeignKey(ulp => ulp.LessonId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.QuizAttempt>(e =>
        {
            e.HasOne(qa => qa.User).WithMany().HasForeignKey(qa => qa.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(qa => qa.Quiz).WithMany().HasForeignKey(qa => qa.QuizId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.FlashcardProgress>(e =>
        {
            e.HasIndex(fp => new { fp.UserId, fp.FlashcardId }).IsUnique();
            e.Property(fp => fp.Status).HasConversion<string>();
            e.HasOne(fp => fp.User).WithMany().HasForeignKey(fp => fp.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(fp => fp.Flashcard).WithMany().HasForeignKey(fp => fp.FlashcardId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.LearningStreak>(e =>
        {
            e.HasIndex(ls => ls.UserId).IsUnique();
            e.HasOne(ls => ls.User).WithOne().HasForeignKey<StudyHub.API.Models.Learn.LearningStreak>(ls => ls.UserId);
        });

        b.Entity<StudyHub.API.Models.Learn.XpTransaction>(e =>
        {
            e.Property(x => x.Source).HasConversion<string>();
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
        });

        b.Entity<StudyHub.API.Models.Learn.Achievement>(e =>
        {
            e.HasIndex(a => a.Slug).IsUnique();
            e.Property(a => a.Condition).HasConversion<string>();
        });

        b.Entity<StudyHub.API.Models.Learn.UserAchievement>(e =>
        {
            e.HasIndex(ua => new { ua.UserId, ua.AchievementId }).IsUnique();
            e.HasOne(ua => ua.User).WithMany().HasForeignKey(ua => ua.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ua => ua.Achievement).WithMany(a => a.UserAchievements).HasForeignKey(ua => ua.AchievementId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.CourseBookmark>(e =>
        {
            e.HasIndex(cb => new { cb.UserId, cb.CourseId }).IsUnique();
            e.HasOne(cb => cb.User).WithMany().HasForeignKey(cb => cb.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(cb => cb.Course).WithMany().HasForeignKey(cb => cb.CourseId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<StudyHub.API.Models.Learn.LessonComment>(e =>
        {
            e.HasOne(lc => lc.User).WithMany().HasForeignKey(lc => lc.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(lc => lc.Lesson).WithMany().HasForeignKey(lc => lc.LessonId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}