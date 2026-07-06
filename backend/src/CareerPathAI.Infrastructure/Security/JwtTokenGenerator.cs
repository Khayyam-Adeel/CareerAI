using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CareerPathAI.Infrastructure.Security;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _options;

    public JwtTokenGenerator(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public JwtResult GenerateToken(User user)
    {
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: creds);

        return new JwtResult(new JwtSecurityTokenHandler().WriteToken(token), expiresAtUtc);
    }
}
