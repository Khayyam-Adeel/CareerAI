using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CareerPathAI.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    /// <summary>POST /api/auth/register</summary>
    [HttpPost("register")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        var outcome = await _authService.RegisterAsync(request);

        if (outcome.EmailAlreadyInUse)
            return Conflict(new { message = "An account with this email already exists." });

        return StatusCode(StatusCodes.Status201Created, outcome.User);
    }

    /// <summary>POST /api/auth/login</summary>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var outcome = await _authService.LoginAsync(request);

        if (!outcome.Succeeded)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(outcome.Result);
    }

    /// <summary>GET /api/auth/me</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> Me()
    {
        var subClaim = User.FindFirst("sub")?.Value;
        if (subClaim is null || !int.TryParse(subClaim, out var userId))
            return Unauthorized();

        var profile = await _authService.GetProfileAsync(userId);
        return profile is null ? Unauthorized() : Ok(profile);
    }
}
