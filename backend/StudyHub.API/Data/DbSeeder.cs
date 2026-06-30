using StudyHub.API.Models;

namespace StudyHub.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.Schools.Any()) return;

        var schools = new List<School>
        {
            new() { Name = "Kathmandu Model Secondary School", City = "Kathmandu" },
            new() { Name = "Budhanilkantha School", City = "Kathmandu" },
            new() { Name = "Rato Bangala School", City = "Lalitpur" }
        };

        db.Schools.AddRange(schools);

        var admin = new User
        {
            Name = "Super Admin",
            Email = "admin@studyhub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin,
            SchoolId = schools[0].Id,
            Grade = "N/A"
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}