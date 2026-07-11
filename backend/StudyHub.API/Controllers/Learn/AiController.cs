using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyHub.API.Services.AI;

namespace StudyHub.API.Controllers.Learn;

[ApiController]
[Route("learn/ai")]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("status")]
    [Authorize]
    public IActionResult GetStatus()
    {
        return Ok(new { isAvailable = _aiService.IsAvailable });
    }

    public class AiRequestDto
    {
        public string Query { get; set; } = string.Empty;
        public string Context { get; set; } = string.Empty;
    }

    [HttpPost("explain")]
    [Authorize]
    public async Task<IActionResult> Explain([FromBody] AiRequestDto dto)
    {
        var result = await _aiService.ExplainConceptAsync(dto.Query, dto.Context);
        return Ok(new { Result = result });
    }

    [HttpPost("ask")]
    [Authorize]
    public async Task<IActionResult> Ask([FromBody] AiRequestDto dto)
    {
        var result = await _aiService.AnswerQuestionAsync(dto.Query, dto.Context);
        return Ok(new { Result = result });
    }

    public class RoadmapRequestDto
    {
        public string Goal { get; set; } = string.Empty;
        public string CurrentLevel { get; set; } = string.Empty;
    }

    [HttpPost("roadmap")]
    [Authorize]
    public async Task<IActionResult> Roadmap([FromBody] RoadmapRequestDto dto)
    {
        var result = await _aiService.GenerateRoadmapAsync(dto.Goal, dto.CurrentLevel);
        return Ok(new { Result = result });
    }
}
