using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CareerPathAI.Infrastructure.ExternalServices.Onet;

/// <summary>
/// Calls O*NET Web Services' keyword search to find a real, government-maintained occupation
/// record matching a profession title. Used as an optional enrichment source - see IOnetClient
/// for why this can never replace the seeded degree/profession catalog.
///
/// Fails soft: missing credentials, network errors, 422 (no match), or any other problem all
/// result in a null return. Nothing in the app depends on O*NET being reachable.
/// </summary>
public class OnetClient : IOnetClient
{
    private readonly HttpClient _http;
    private readonly OnetOptions _options;
    private readonly ILogger<OnetClient> _logger;

    public OnetClient(HttpClient http, IOptions<OnetOptions> options, ILogger<OnetClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;

        if (_options.IsConfigured)
        {
            var credentials = Convert.ToBase64String(
                Encoding.ASCII.GetBytes($"{_options.Username}:{_options.Password}"));
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        }
    }

    public async Task<OnetOccupationMatch?> FindOccupationAsync(string title)
    {
        if (!_options.IsConfigured)
        {
            // Expected when no O*NET account has been set up yet - not an error.
            return null;
        }

        try
        {
            var url = $"{_options.BaseUrl.TrimEnd('/')}/online/search?keyword={Uri.EscapeDataString(title)}";

            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            using var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                // 422 = no match or bad keyword param; treat the same as "not found".
                _logger.LogInformation(
                    "O*NET search for '{Title}' returned {StatusCode}.", title, response.StatusCode);
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<OnetSearchResponse>();
            var bestMatch = result?.Occupation?.FirstOrDefault();

            if (bestMatch is null)
                return null;

            return new OnetOccupationMatch(bestMatch.Code, bestMatch.Title, Description: null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "O*NET lookup failed for '{Title}'; continuing with seed data only.", title);
            return null;
        }
    }
}
