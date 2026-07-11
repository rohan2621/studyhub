namespace StudyHub.API.Services.AI;

public interface IAiService
{
    bool IsAvailable { get; }
    Task<string> ExplainConceptAsync(string concept, string context);
    Task<string> AnswerQuestionAsync(string question, string lessonContext);
    Task<string> GenerateQuizHintAsync(string question, string wrongAnswer);
    Task<string> GenerateFlashcardsAsync(string topic, int count);
    Task<string> GenerateRoadmapAsync(string goal, string currentLevel);
    Task<string> RecommendNextTopicAsync(string completedTopics, string weakTopics);
    Task<string> SummarizeLessonAsync(string lessonContent);
    Task<string> ReviewProjectAsync(string projectDescription, string userSubmission);
}
