using CareerPathAI.Application.Interfaces;
using CareerPathAI.Application.Services;
using CareerPathAI.Infrastructure.ExternalServices.Gemini;
using CareerPathAI.Infrastructure.ExternalServices.Onet;
using CareerPathAI.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevCors = "AngularDevCors";

// ---- Services ------------------------------------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "CareerPath AI API",
        Version = "v1",
        Description = "Career & education roadmap API for CareerPath AI."
    });
});

// Repository registrations.
// TODO (future): replace these two lines with EF Core-backed implementations
// (e.g. AddScoped<IProfessionRepository, EfProfessionRepository>) once SQL Server is introduced.
// No other layer needs to change - Application and API depend only on the interfaces.
builder.Services.AddSingleton<IProfessionRepository, InMemoryProfessionRepository>();
builder.Services.AddSingleton<IDegreeRepository, InMemoryDegreeRepository>();

// Gemini (free-tier AI) configuration. Reads the "Gemini" section from appsettings.json,
// appsettings.{Environment}.json, user secrets, or the GEMINI__APIKEY environment variable.
// If no ApiKey is set, GeminiAiRecommenderClient self-disables and the advisor silently
// falls back to its rule-based explanations - nothing breaks.
builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection(GeminiOptions.SectionName));
builder.Services.AddHttpClient<IAiRecommenderClient, GeminiAiRecommenderClient>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

// O*NET (free, US Dept of Labor) configuration - optional enrichment source for real-world
// occupation data. Requires a developer account (signup + approval) at
// https://services.onetcenter.org/ - until configured, this self-disables with no impact.
builder.Services.Configure<OnetOptions>(builder.Configuration.GetSection(OnetOptions.SectionName));
builder.Services.AddHttpClient<IOnetClient, OnetClient>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});

// Application services.
builder.Services.AddScoped<RoadmapService>();
builder.Services.AddScoped<CareerAdvisorService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularDevCors, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ---- Middleware pipeline --------------------------------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(AngularDevCors);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
