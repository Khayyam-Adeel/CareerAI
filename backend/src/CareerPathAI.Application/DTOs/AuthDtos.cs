using System.ComponentModel.DataAnnotations;

namespace CareerPathAI.Application.DTOs;

public record RegisterRequestDto(
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, PasswordComplexity] string Password,
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(100)] string LastName
);

public record RegisterResponseDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt
);

public record LoginRequestDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthUserDto(int Id, string Email, string FirstName, string LastName);

public record LoginResponseDto(string Token, DateTime ExpiresAt, AuthUserDto User);

public record UserProfileDto(
    int Id,
    string Email,
    string FirstName,
    string LastName,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);
