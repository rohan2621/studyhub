namespace StudyHub.API.Models;

public enum DevicePlatform { Web, iOS, Android }

public class Device
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string DeviceFingerprint { get; set; } = null!;
    public DevicePlatform Platform { get; set; }
    public string? PushToken { get; set; }          // Expo push token
    public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
