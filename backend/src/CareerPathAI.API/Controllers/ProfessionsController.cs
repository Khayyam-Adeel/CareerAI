using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using CareerPathAI.Infrastructure.ExternalServices.Onet;
using Microsoft.AspNetCore.Mvc;

namespace CareerPathAI.API.Controllers;

[ApiController]
[Route("api/professions")]
public class ProfessionsController : ControllerBase
{
    private readonly IProfessionRepository _repo;
    private readonly IOnetClient _onetClient;

    public ProfessionsController(IProfessionRepository repo, IOnetClient onetClient)
    {
        _repo = repo;
        _onetClient = onetClient;
    }

    /// <summary>GET /api/professions?field=Technology&amp;keyword=cloud</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProfessionDto>>> GetAll(
        [FromQuery] string? field, [FromQuery] string? keyword)
    {
        var professions = await _repo.SearchAsync(field, keyword);
        return Ok(professions.Select(ToDto));
    }

    /// <summary>GET /api/professions/100</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProfessionDto>> GetById(int id)
    {
        var profession = await _repo.GetByIdAsync(id);
        if (profession is null)
            return NotFound(new { message = $"Profession with id {id} was not found." });

        return Ok(ToDto(profession));
    }

    /// <summary>GET /api/professions/compare?aId=100&amp;bId=101</summary>
    [HttpGet("compare")]
    public async Task<ActionResult<CareerComparisonDto>> Compare([FromQuery] int aId, [FromQuery] int bId)
    {
        var a = await _repo.GetByIdAsync(aId);
        var b = await _repo.GetByIdAsync(bId);

        if (a is null || b is null)
            return NotFound(new { message = "One or both professions were not found." });

        return Ok(new CareerComparisonDto(ToDto(a), ToDto(b)));
    }

    /// <summary>
    /// GET /api/professions/100/onet-match
    /// Optional live enrichment lookup against O*NET's real occupation database.
    /// Returns 204 No Content (not an error) if O*NET isn't configured or has no match -
    /// this is an enhancement, not a dependency, so the frontend should treat "nothing back"
    /// as "just show the seed data" rather than as a failure.
    /// </summary>
    [HttpGet("{id:int}/onet-match")]
    public async Task<ActionResult<OnetOccupationMatch>> GetOnetMatch(int id)
    {
        var profession = await _repo.GetByIdAsync(id);
        if (profession is null)
            return NotFound(new { message = $"Profession with id {id} was not found." });

        var match = await _onetClient.FindOccupationAsync(profession.Title);
        return match is null ? NoContent() : Ok(match);
    }

    private static ProfessionDto ToDto(Profession p) => new(
        p.Id, p.Title, p.Description, p.Field, p.SalaryMin, p.SalaryMax,
        p.Currency, p.Demand, p.RequiredSkills, p.Certifications, p.Tags
    );
}
