using System.Text.Json.Serialization;

namespace CareerPathAI.Infrastructure.ExternalServices.Onet;

// Minimal subset of O*NET Web Services JSON responses - just enough to support keyword
// search and pull basic occupation info. See https://services.onetcenter.org/reference/

internal class OnetSearchResponse
{
    [JsonPropertyName("keyword")]
    public string? Keyword { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("occupation")]
    public List<OnetOccupationSummary>? Occupation { get; set; }
}

internal class OnetOccupationSummary
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("href")]
    public string? Href { get; set; }
}

internal class OnetOccupationReport
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}
