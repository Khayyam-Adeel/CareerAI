namespace CareerPathAI.Infrastructure.Security;

/// <summary>
/// Bind this to configuration section "Jwt" in appsettings.json.
/// Key is a true secret and must be set via `dotnet user-secrets` - never committed with a
/// real value (see appsettings.json, which only carries an empty placeholder).
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60;
}
