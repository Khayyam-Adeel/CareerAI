using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CareerPathAI.API.Controllers;

[ApiController]
[Route("api/degrees")]
public class DegreesController : ControllerBase
{
    private readonly IDegreeRepository _repo;

    public DegreesController(IDegreeRepository repo)
    {
        _repo = repo;
    }

    /// <summary>GET /api/degrees</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DegreeDto>>> GetAll()
    {
        var degrees = await _repo.GetAllAsync();
        return Ok(degrees.Select(ToDto));
    }

    /// <summary>GET /api/degrees/10</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<DegreeDto>> GetById(int id)
    {
        var degree = await _repo.GetByIdAsync(id);
        if (degree is null)
            return NotFound(new { message = $"Degree with id {id} was not found." });

        return Ok(ToDto(degree));
    }

    private static DegreeDto ToDto(Degree d) => new(
        d.Id, d.Name, d.Level, d.Field, d.Description, d.DurationInYears,
        d.Subjects, d.EligibilityRequirements
    );
}
