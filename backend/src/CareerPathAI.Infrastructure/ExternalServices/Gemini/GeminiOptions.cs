namespace CareerPathAI.Infrastructure.ExternalServices.Gemini;

/// <summary>
/// Bind this to configuration section "Gemini" in appsettings.json or environment variables.
/// If ApiKey is empty, GeminiAiRecommenderClient short-circuits and the advisor falls back
/// to rule-based explanations only - no error, no crash, just slightly less polished text.
/// </summary>
public class GeminiOptions
{
    public const string SectionName = "Gemini";

    /// <summary>
    /// Get this for free at https://aistudio.google.com/app/apikey (Google AI Studio).
    /// No credit card required for the free tier. Treat it like a password - never commit it.
    /// Prefer setting this via environment variable GEMINI__APIKEY or dotnet user-secrets,
    /// not directly in appsettings.json.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Free-tier-eligible model as of mid-2026. Override in config if Google renames/retires it.
    /// </summary>
    public string Model { get; set; } = "gemini-2.5-flash";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);
}
