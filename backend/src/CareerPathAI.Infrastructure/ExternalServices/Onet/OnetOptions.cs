namespace CareerPathAI.Infrastructure.ExternalServices.Onet;

/// <summary>
/// Bind this to configuration section "Onet" in appsettings.json or environment variables.
///
/// O*NET Web Services is free but requires signing up for a developer account at
/// https://services.onetcenter.org/ and waiting for approval (unlike Gemini, there is no
/// instant self-serve API key - you get a Username/Password pair via email once approved).
///
/// If Username or Password is empty, OnetProfessionDataSource.IsConfigured is false and the
/// app keeps using the built-in CatalogSeed data with zero behavior change.
/// </summary>
public class OnetOptions
{
    public const string SectionName = "Onet";

    /// <summary>Issued by O*NET after developer registration is approved.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Issued alongside Username. Prefer environment variables over appsettings.json.</summary>
    public string Password { get; set; } = string.Empty;

    public string BaseUrl { get; set; } = "https://services.onetcenter.org/ws/";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Username) && !string.IsNullOrWhiteSpace(Password);
}
