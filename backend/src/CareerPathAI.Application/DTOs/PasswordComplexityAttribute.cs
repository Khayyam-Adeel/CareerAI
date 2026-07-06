using System.ComponentModel.DataAnnotations;

namespace CareerPathAI.Application.DTOs;

/// <summary>
/// Minimum 8 chars, at least one letter and one digit. Pure BCL - no new package needed,
/// since no single built-in DataAnnotations attribute expresses this combination.
/// </summary>
public class PasswordComplexityAttribute : ValidationAttribute
{
    public PasswordComplexityAttribute()
        : base("Password must be at least 8 characters and include at least one letter and one number.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string s || s.Length < 8)
            return false;

        return s.Any(char.IsLetter) && s.Any(char.IsDigit);
    }
}
