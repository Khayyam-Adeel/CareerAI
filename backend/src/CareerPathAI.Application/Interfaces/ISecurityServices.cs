using CareerPathAI.Domain.Entities;

namespace CareerPathAI.Application.Interfaces;

public enum PasswordVerificationOutcome
{
    Failed,
    Success,
    SuccessRehashNeeded
}

/// <summary>
/// Abstraction over PasswordHasher&lt;User&gt; so Application never takes a dependency on
/// Microsoft.Extensions.Identity.Core. Implemented in
/// Infrastructure/Security/PasswordHasherService.cs.
/// </summary>
public interface IPasswordHasherService
{
    string HashPassword(User user, string plainTextPassword);
    PasswordVerificationOutcome VerifyPassword(User user, string plainTextPassword);
}

public record JwtResult(string Token, DateTime ExpiresAtUtc);

/// <summary>
/// Implemented in Infrastructure/Security/JwtTokenGenerator.cs.
/// </summary>
public interface IJwtTokenGenerator
{
    JwtResult GenerateToken(User user);
}
