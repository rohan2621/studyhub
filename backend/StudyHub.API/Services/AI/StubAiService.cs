namespace StudyHub.API.Services.AI;

public class StubAiService : IAiService
{
    public bool IsAvailable => false;

    public Task<string> ExplainConceptAsync(string concept, string context) =>
        Task.FromResult("AI features are currently unavailable. Please configure an AI provider.");

    public Task<string> AnswerQuestionAsync(string question, string lessonContext) =>
        Task.FromResult("AI Tutor is currently offline.");

    public Task<string> GenerateQuizHintAsync(string question, string wrongAnswer) =>
        Task.FromResult("Review the lesson material again, you can do it!");

    public Task<string> GenerateFlashcardsAsync(string topic, int count) =>
        Task.FromResult("[]"); 

    public Task<string> GenerateRoadmapAsync(string goal, string currentLevel) =>
        Task.FromResult("Roadmap generation is currently unavailable.");

    public Task<string> RecommendNextTopicAsync(string completedTopics, string weakTopics) =>
        Task.FromResult("Continue with the next lesson in your course.");

    public Task<string> SummarizeLessonAsync(string lessonContent) =>
        Task.FromResult("Summary unavailable.");

    public Task<string> ReviewProjectAsync(string projectDescription, string userSubmission) =>
        Task.FromResult("Project review is currently offline.");
}
