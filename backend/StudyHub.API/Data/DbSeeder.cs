using StudyHub.API.Models;
using StudyHub.API.Models.Learn;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudyHub.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // 1. Existing Seed logic
        await SeedSchoolDataAsync(db);
        
        // 2. New Learn Module Seed logic
        await SeedLearnDataAsync(db);
    }

    private static async Task SeedLearnDataAsync(AppDbContext db)
    {
        if (await db.Domains.AnyAsync())
            return;

        // Domains
        var domains = new List<Domain>
        {
            new Domain { Slug = "technology", Name = "Technology", IconEmoji = "??", Description = "Learn programming, networking, and software.", IsPublished = true },
            new Domain { Slug = "mathematics", Name = "Mathematics", IconEmoji = "??", Description = "Numbers, equations, and logic.", IsPublished = true },
            new Domain { Slug = "science", Name = "Science", IconEmoji = "??", Description = "Physics, chemistry, and biology.", IsPublished = true },
            new Domain { Slug = "language-arts", Name = "Language Arts", IconEmoji = "??", Description = "Reading, writing, and literature.", IsPublished = true },
            new Domain { Slug = "life-skills", Name = "Life Skills", IconEmoji = "??", Description = "Personal finance, communication, and growth.", IsPublished = true }
        };
        db.Domains.AddRange(domains);
        await db.SaveChangesAsync();

        var techDomain = domains.First(d => d.Slug == "technology");

        // Course
        var pythonCourse = new Course
        {
            DomainId = techDomain.Id,
            Slug = "python-beginners",
            Title = "Python Programming for Beginners",
            Tagline = "Start your coding journey",
            DifficultyLevel = DifficultyLevel.Beginner,
            EstimatedHours = 5.0m,
            IsPublished = true
        };
        db.Courses.Add(pythonCourse);
        await db.SaveChangesAsync();

        // 5 Lessons
        var lessons = new List<Lesson>
        {
            new Lesson { CourseId = pythonCourse.Id, Title = "Intro to Python", Slug = "intro-to-python", LessonType = LessonType.Introduction, SortOrder = 1, IsPublished = true, ContentMarkdown = "Welcome to Python..." },
            new Lesson { CourseId = pythonCourse.Id, Title = "Variables & Types", Slug = "variables-types", LessonType = LessonType.Concept, SortOrder = 2, IsPublished = true, ContentMarkdown = "Variables store data..." },
            new Lesson { CourseId = pythonCourse.Id, Title = "Control Flow", Slug = "control-flow", LessonType = LessonType.Concept, SortOrder = 3, IsPublished = true, ContentMarkdown = "If statements..." },
            new Lesson { CourseId = pythonCourse.Id, Title = "Functions", Slug = "functions", LessonType = LessonType.Concept, SortOrder = 4, IsPublished = true, ContentMarkdown = "Def keyword..." },
            new Lesson { CourseId = pythonCourse.Id, Title = "Mini Project", Slug = "mini-project", LessonType = LessonType.Project, SortOrder = 5, IsPublished = true, ContentMarkdown = "Build a calculator..." }
        };
        db.Lessons.AddRange(lessons);
        await db.SaveChangesAsync();

        // 5 Quizzes (1 per lesson)
        for (int i = 0; i < 5; i++)
        {
            var q = new Quiz { LessonId = lessons[i].Id, Title = "Quiz for "+lessons[i].Title, PassScorePercent = 70, MaxAttempts = 3 };
            db.Quizzes.Add(q);
            await db.SaveChangesAsync(); // Save to get Id
            
            db.QuizQuestions.Add(new QuizQuestion { QuizId = q.Id, QuestionText = "Sample Question", Options = new[] { "A", "B", "C", "D" }, CorrectOptionIndex = 0 });
        }

        // 1 Flashcard Deck
        var deck = new FlashcardDeck { CourseId = pythonCourse.Id, Title = "Python Basics" };
        db.FlashcardDecks.Add(deck);
        await db.SaveChangesAsync();

        // 10 Flashcards
        for (int i = 1; i <= 10; i++)
        {
            db.Flashcards.Add(new Flashcard { DeckId = deck.Id, FrontText = "Term "+i, BackText = "Definition "+i });
        }

        // Achievements
        var achievements = new List<Achievement>
        {
            new Achievement { Slug = "first-step", Title = "First Step", Description = "Complete first lesson", XpReward = 50, Condition = AchievementCondition.CompleteFirstLesson },
            new Achievement { Slug = "quiz-master", Title = "Quiz Master", Description = "Score 100% on a quiz", XpReward = 100, Condition = AchievementCondition.Score100PercentQuiz },
            new Achievement { Slug = "week-warrior", Title = "Week Warrior", Description = "7-day streak", XpReward = 150, Condition = AchievementCondition.SevenDayStreak },
            new Achievement { Slug = "course-finisher", Title = "Course Finisher", Description = "Complete full course", XpReward = 200, Condition = AchievementCondition.CompleteFullCourse },
            new Achievement { Slug = "speed-learner", Title = "Speed Learner", Description = "Complete 5 lessons in one day", XpReward = 200, Condition = AchievementCondition.CompleteFiveLessonsOneDay }
        };
        db.Achievements.AddRange(achievements);
        
        await db.SaveChangesAsync();
    }

    private static async Task SeedSchoolDataAsync(AppDbContext db)
    {
        if (db.Schools.Any(s => s.Name == "Kathmandu Model Secondary School"))
        {
            // Seed mock data if it hasn't been seeded yet
            if (await db.Users.AnyAsync(u => u.Email == "student@studyhub.com"))
                return;

            var school = await db.Schools.FirstAsync(s => s.Name == "Kathmandu Model Secondary School");
            var admin = await db.Users.FirstAsync(u => u.Email == "admin@studyhub.com");

            // Seed student
            var student = new User
            {
                Name = "Suman Shrestha",
                Email = "student@studyhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student@123", workFactor: 10),
                Role = UserRole.Student,
                SchoolId = school.Id,
                Grade = "10",
                Section = "A"
            };
            db.Users.Add(student);

            // Seed active token for student
            var token = new Token
            {
                Code = "SH-AAAA-BBBB",
                UserId = student.Id,
                Plan = TokenPlan.OneYear,
                Status = TokenStatus.Active,
                ExpiresAt = DateTime.UtcNow.AddYears(1),
                DeviceId = "MOCK_DEVICE_ID"
            };
            db.Tokens.Add(token);

            // Seed toppers
            var topper1 = new User
            {
                Name = "Aarav Sharma",
                Email = "topper1@studyhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Topper@123", workFactor: 10),
                Role = UserRole.TopperContributor,
                SchoolId = school.Id,
                Grade = "10",
                Section = "A"
            };
            var topper2 = new User
            {
                Name = "Neha Patel",
                Email = "topper2@studyhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Topper@123", workFactor: 10),
                Role = UserRole.TopperContributor,
                SchoolId = school.Id,
                Grade = "10",
                Section = "A"
            };
            db.Users.AddRange(topper1, topper2);

            // Seed notes
            var note1 = new Note
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Science",
                Chapter = "Force & Gravitation",
                Title = "Notes on Gravitational Force and Acceleration due to Gravity",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf",
                UploadedBy = admin.Id,
                Type = NoteType.Note
            };
            var note2 = new Note
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Mathematics",
                Chapter = "Trigonometry",
                Title = "Trigonometrical Equations and Identities Class Handouts",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf",
                UploadedBy = admin.Id,
                Type = NoteType.Note
            };
            db.Notes.AddRange(note1, note2);

            // Seed topper notes
            var topperNote1 = new Note
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Science",
                Chapter = "Chemistry — Chemical Reactions",
                Title = "Topper's Personal Hand-written Notes on Chemical Reactions & Balance",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf",
                UploadedBy = topper1.Id,
                Type = NoteType.TopperNote,
                Upvotes = 24
            };
            var topperNote2 = new Note
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Mathematics",
                Chapter = "Vectors",
                Title = "Vector Geometry Formula Sheet & Solved Past Questions",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf",
                UploadedBy = topper2.Id,
                Type = NoteType.TopperNote,
                Upvotes = 18
            };
            db.Notes.AddRange(topperNote1, topperNote2);

            // Seed homeworks
            var hw1 = new Homework
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Mathematics",
                Title = "Trigonometry Heights and Distances Assignment",
                Description = "Solve exercises 14.1 and 14.2. Submit photos of your steps.",
                DueAt = DateTime.UtcNow.AddDays(3),
                AssignedBy = admin.Id
            };
            var hw2 = new Homework
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Science",
                Title = "Electricity & Magnetism Numerical Problems",
                Description = "Complete the 10 numerical problems on Ohm's Law uploaded in notes.",
                DueAt = DateTime.UtcNow.AddDays(5),
                AssignedBy = admin.Id
            };
            db.Homeworks.AddRange(hw1, hw2);

            // Seed past papers
            var paper1 = new PastPaper
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Science",
                Year = 2024,
                Term = "First Term",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf"
            };
            var paper2 = new PastPaper
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Mathematics",
                Year = 2023,
                Term = "Final Term",
                FileUrl = "https://pdfobject.com/pdf/sample.pdf"
            };
            db.PastPapers.AddRange(paper1, paper2);

            // Seed timetable slots
            var slots = new List<TimetableSlot>
            {
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Monday", Period = 1, Subject = "Mathematics", StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(11, 0) },
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Monday", Period = 2, Subject = "Science", StartTime = new TimeOnly(11, 0), EndTime = new TimeOnly(12, 0) },
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Tuesday", Period = 1, Subject = "Mathematics", StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(11, 0) },
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Tuesday", Period = 2, Subject = "Science", StartTime = new TimeOnly(11, 0), EndTime = new TimeOnly(12, 0) },
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Wednesday", Period = 1, Subject = "Mathematics", StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(11, 0) },
                new() { SchoolId = school.Id, Grade = "10", Section = "A", Day = "Wednesday", Period = 2, Subject = "Science", StartTime = new TimeOnly(11, 0), EndTime = new TimeOnly(12, 0) }
            };
            db.TimetableSlots.AddRange(slots);

            // Seed discussion threads
            var thread1 = new DiscussionThread
            {
                SchoolId = school.Id,
                Grade = "10",
                Section = "A",
                Subject = "Science",
                Title = "How do we solve electricity circuits with parallel resistors?",
                Body = "I get confused when calculating equivalent resistance for mixed series-parallel networks. Can anyone explain the simple formula approach?",
                AuthorId = student.Id
            };
            db.DiscussionThreads.Add(thread1);

            await db.SaveChangesAsync();
            return;
        }

        var schools = new List<School>
        {
            new() { Name = "Kathmandu Model Secondary School", City = "Kathmandu" },
            new() { Name = "Budhanilkantha School", City = "Kathmandu" },
            new() { Name = "Rato Bangala School", City = "Lalitpur" }
        };

        db.Schools.AddRange(schools);

        var adminUser = new User
        {
            Name = "Super Admin",
            Email = "admin@studyhub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Role = UserRole.Admin,
            SchoolId = schools[0].Id,
            Grade = "N/A"
        };

        db.Users.Add(adminUser);
        await db.SaveChangesAsync();
    }
}
