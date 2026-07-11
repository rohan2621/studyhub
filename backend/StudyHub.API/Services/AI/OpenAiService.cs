using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace StudyHub.API.Services.AI;

public class OpenAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OpenAiService(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = config["AI:ApiKey"] ?? string.Empty;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public bool IsAvailable => !string.IsNullOrEmpty(_apiKey);

    private async Task<string> CallOpenAiAsync(string prompt)
    {
        if (string.IsNullOrEmpty(_apiKey)) return "AI features are not configured.";

        var requestBody = new
        {
            model = "gpt-3.5-turbo",
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = 0.7
        };

        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            return "Failed to generate AI response. Please try again later.";
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseContent);
        return jsonDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;
    }

    public async Task<string> ExplainConceptAsync(string concept, string context) =>
        await CallOpenAiAsync($"Explain the concept of '{concept}' in simple terms. Context: {context}");

    public async Task<string> AnswerQuestionAsync(string question, string lessonContext) =>
        await CallOpenAiAsync($"Answer the student's question clearly. Question: '{question}'. Context: {lessonContext}");

    public async Task<string> GenerateQuizHintAsync(string question, string wrongAnswer) =>
        await CallOpenAiAsync($"Give a helpful hint for this question without giving the answer away. Question: '{question}'. The student guessed: '{wrongAnswer}'.");

    public async Task<string> GenerateFlashcardsAsync(string topic, int count) =>
        await CallOpenAiAsync($"Generate {count} flashcards for the topic: '{topic}'. Format as a JSON array of objects with 'Front' and 'Back' properties.");

    public async Task<string> GenerateRoadmapAsync(string goal, string currentLevel) =>
        await CallOpenAiAsync($"Generate a learning roadmap to achieve '{goal}'. The student's current level is: '{currentLevel}'.");

    public async Task<string> RecommendNextTopicAsync(string completedTopics, string weakTopics) =>
        await CallOpenAiAsync($"Based on the completed topics ({completedTopics}) and weak topics ({weakTopics}), recommend what the student should study next.");

    public async Task<string> SummarizeLessonAsync(string lessonContent) =>
        await CallOpenAiAsync($"Provide a concise summary of the following lesson content: {lessonContent}");

    public async Task<string> ReviewProjectAsync(string projectDescription, string userSubmission) =>
        await CallOpenAiAsync($"Review this student's project submission. Project description: {projectDescription}. Submission: {userSubmission}. Provide constructive feedback.");
}
