using Microsoft.EntityFrameworkCore;
using StudyHub.API.Data;
using StudyHub.API.Models;

namespace StudyHub.API.Services;

public class NotificationService(AppDbContext db)
{
    public async Task CreateAsync(Guid userId, NotificationType type, string title, string body, string? actionUrl = null)
    {
        db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            ActionUrl = actionUrl
        });
        await db.SaveChangesAsync();
    }

    public async Task CreateForSchoolAsync(Guid schoolId, NotificationType type, string title, string body, string? actionUrl = null)
    {
        var userIds = await db.Users
            .Where(u => u.SchoolId == schoolId)
            .Select(u => u.Id)
            .ToListAsync();

        var notifications = userIds.Select(uid => new Notification
        {
            UserId = uid,
            Type = type,
            Title = title,
            Body = body,
            ActionUrl = actionUrl
        });

        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync();
    }

    public async Task CreateForAllAsync(NotificationType type, string title, string body, string? actionUrl = null)
    {
        var userIds = await db.Users
            .Where(u => u.Role == UserRole.Student)
            .Select(u => u.Id)
            .ToListAsync();

        var notifications = userIds.Select(uid => new Notification
        {
            UserId = uid,
            Type = type,
            Title = title,
            Body = body,
            ActionUrl = actionUrl
        });

        db.Notifications.AddRange(notifications);
        await db.SaveChangesAsync();
    }
}