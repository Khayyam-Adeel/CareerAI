using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;

namespace CareerPathAI.Application.Services;

public record RegisterOutcome(bool Succeeded, RegisterResponseDto? User, bool EmailAlreadyInUse);

public record LoginOutcome(bool Succeeded, LoginResponseDto? Result);

/// <summary>
/// Orchestrates registration, login and profile lookup. Duplicate-email (409) and
/// invalid-credentials (401) are signaled via plain outcome records rather than exceptions,
/// matching this codebase's existing plain-record style. Field-level validation (400) is
/// handled entirely upstream by [ApiController]'s automatic ModelState checks against the
/// DataAnnotations on the request DTOs, so it never reaches this service.
/// </summary>
public class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasherService _hasher;
    private readonly IJwtTokenGenerator _jwt;

    public AuthService(IUserRepository users, IPasswordHasherService hasher, IJwtTokenGenerator jwt)
    {
        _users = users;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<RegisterOutcome> RegisterAsync(RegisterRequestDto request)
    {
        if (await _users.EmailExistsAsync(request.Email))
            return new RegisterOutcome(false, null, true);

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);

        return new RegisterOutcome(
            true,
            new RegisterResponseDto(user.Id, user.Email, user.FirstName, user.LastName, user.CreatedAt),
            false);
    }

    public async Task<LoginOutcome> LoginAsync(LoginRequestDto request)
    {
        var user = await _users.GetByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            return new LoginOutcome(false, null);

        var verification = _hasher.VerifyPassword(user, request.Password);
        if (verification == PasswordVerificationOutcome.Failed)
            return new LoginOutcome(false, null);

        if (verification == PasswordVerificationOutcome.SuccessRehashNeeded)
            user.PasswordHash = _hasher.HashPassword(user, request.Password);

        user.LastLoginAt = DateTime.UtcNow;
        await _users.UpdateAsync(user);

        var token = _jwt.GenerateToken(user);
        return new LoginOutcome(true, new LoginResponseDto(
            token.Token,
            token.ExpiresAtUtc,
            new AuthUserDto(user.Id, user.Email, user.FirstName, user.LastName)));
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _users.GetByIdAsync(userId);
        return user is null
            ? null
            : new UserProfileDto(user.Id, user.Email, user.FirstName, user.LastName, user.CreatedAt, user.LastLoginAt);
    }
}
