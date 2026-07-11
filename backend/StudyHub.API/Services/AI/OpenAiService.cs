namespace StudyHub.API.Services.AI;

public class OpenAiService : IAiService
{
    public bool IsAvailable => true;

    public Task<string> ExplainConceptAsync(string concept, string context) =>
        throw new NotImplementedException();

    public Task<string> AnswerQuestionAsync(string question, string lessonContext) =>
        throw new NotImplementedException();

    public Task<string> GenerateQuizHintAsync(string question, string wrongAnswer) =>
        throw new NotImplementedException();

    public Task<string> GenerateFlashcardsAsync(string topic, int count) =>
        throw new NotImplementedException();

    public Task<string> GenerateRoadmapAsync(string goal, string currentLevel) =>
        throw new NotImplementedException();

    public Task<string> RecommendNextTopicAsync(string completedTopics, string weakTopics) =>
        throw new NotImplementedException();

    public Task<string> SummarizeLessonAsync(string lessonContent) =>
        throw new NotImplementedException();

    public Task<string> ReviewProjectAsync(string projectDescription, string userSubmission) =>
        throw new NotImplementedException();
}
