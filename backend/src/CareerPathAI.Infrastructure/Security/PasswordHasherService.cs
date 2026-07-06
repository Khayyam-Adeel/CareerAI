using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CareerPathAI.Infrastructure.Security;

/// <summary>
/// Wraps PasswordHasher&lt;User&gt; from Microsoft.Extensions.Identity.Core. Note: the type
/// lives in the Microsoft.AspNetCore.Identity namespace even though the package is
/// Microsoft.Extensions.Identity.Core - not a typo.
/// </summary>
public class PasswordHasherService : IPasswordHasherService
{
    private readonly PasswordHasher<User> _hasher = new();

    public string HashPassword(User user, string plainTextPassword) =>
        _hasher.HashPassword(user, plainTextPassword);

    public PasswordVerificationOutcome VerifyPassword(User user, string plainTextPassword)
    {
        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, plainTextPassword);
        return result switch
        {
            PasswordVerificationResult.Success => PasswordVerificationOutcome.Success,
            PasswordVerificationResult.SuccessRehashNeeded => PasswordVerificationOutcome.SuccessRehashNeeded,
            _ => PasswordVerificationOutcome.Failed
        };
    }
}
