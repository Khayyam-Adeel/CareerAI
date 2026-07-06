namespace CareerPathAI.Domain.Entities;

/// <summary>
/// A registered account. Deliberately lighter-weight than ASP.NET Core Identity's
/// IdentityUser - no roles, no lockout counters, no external logins (out of scope for now).
/// </summary>
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
}
