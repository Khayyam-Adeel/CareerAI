using System.Text;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Application.Services;
using CareerPathAI.Infrastructure.ExternalServices.Gemini;
using CareerPathAI.Infrastructure.ExternalServices.Onet;
using CareerPathAI.Infrastructure.Repositories;
using CareerPathAI.Infrastructure.Security;
using CareerPathAI.Persistence.Data;
using CareerPathAI.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevCors = "AngularDevCors";
const string AuthRateLimitPolicy = "AuthPolicy";

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

// ---- Persistence: SQL Server via EF Core (the only DB-backed data in this codebase today;
// catalog data stays in-memory - see the TODO above). ----
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, EfUserRepository>();

// ---- Security: password hashing + JWT issuance/validation for login/signup. ----
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<AuthService>();

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
var jwtKey = jwtSection["Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured. Set it via: dotnet user-secrets set \"Jwt:Key\" \"<a strong random string, 32+ bytes>\"");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Rate limiting on register/login only - reduces brute-force/spam risk without affecting
// any other endpoint. Partitioned by client IP so one abusive caller can't lock out everyone.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(AuthRateLimitPolicy, httpContext =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst
            }));
});

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
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
