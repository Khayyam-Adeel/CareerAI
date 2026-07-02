using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace CareerPathAI.API.Controllers;

[ApiController]
[Route("api/roadmap")]
public class RoadmapController : ControllerBase
{
    private readonly RoadmapService _roadmapService;

    public RoadmapController(RoadmapService roadmapService)
    {
        _roadmapService = roadmapService;
    }

    /// <summary>
    /// GET /api/roadmap/100  -> primary roadmap (Matric ... -> Profession) for profession id 100.
    /// Optional ?degreeId=11 to pick a specific qualifying degree instead of the default.
    /// </summary>
    [HttpGet("{professionId:int}")]
    public async Task<ActionResult<RoadmapDto>> GetRoadmap(int professionId, [FromQuery] int? degreeId)
    {
        var roadmap = await _roadmapService.BuildRoadmapAsync(professionId, degreeId);
        if (roadmap is null)
            return NotFound(new { message = $"No roadmap could be built for profession id {professionId}." });

        return Ok(roadmap);
    }

    /// <summary>
    /// GET /api/roadmap/100/alternatives -> ALL valid degree-path roadmaps leading to this profession.
    /// </summary>
    [HttpGet("{professionId:int}/alternatives")]
    public async Task<ActionResult<List<RoadmapDto>>> GetAllRoadmaps(int professionId)
    {
        var roadmaps = await _roadmapService.BuildAllRoadmapsAsync(professionId);
        if (roadmaps.Count == 0)
            return NotFound(new { message = $"No roadmaps found for profession id {professionId}." });

        return Ok(roadmaps);
    }
}
