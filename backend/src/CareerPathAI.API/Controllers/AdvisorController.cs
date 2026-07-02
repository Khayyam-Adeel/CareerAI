using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareerPathAI.API.Controllers;

[ApiController]
[Route("api/advisor")]
public class AdvisorController : ControllerBase
{
    private readonly CareerAdvisorService _advisorService;

    public AdvisorController(CareerAdvisorService advisorService)
    {
        _advisorService = advisorService;
    }

    /// <summary>
    /// POST /api/advisor/recommend
    /// Body: { "interests": [...], "favoriteSubjects": [...], "skills": [...], "goal": "..." }
    /// </summary>
    [HttpPost("recommend")]
    public async Task<ActionResult<AdvisorResultDto>> Recommend([FromBody] AdvisorRequestDto request)
    {
        if (request.Interests.Count == 0 && request.FavoriteSubjects.Count == 0 && request.Skills.Count == 0)
        {
            return BadRequest(new
            {
                message = "Provide at least one interest, favorite subject, or skill so the advisor has something to match on."
            });
        }

        var result = await _advisorService.RecommendAsync(request);
        return Ok(result);
    }
}
