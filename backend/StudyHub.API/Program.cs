using System.Text;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using StudyHub.API.Data;
using StudyHub.API.Hubs;
using StudyHub.API.Jobs;
using StudyHub.API.Middleware;
using StudyHub.API.Services;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
       .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

// Redis — Upstash SSL
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var connStr = builder.Configuration.GetConnectionString("Redis")!;
    var uri = new Uri(connStr);
    var options = new ConfigurationOptions
    {
        EndPoints = { { uri.Host, uri.Port } },
        Password = uri.UserInfo.Split(':')[1],
        Ssl = true,
        AbortOnConnectFail = false,
        SslProtocols = System.Security.Authentication.SslProtocols.Tls12,
        ConnectTimeout = 10000,
        SyncTimeout = 10000,
    };
    return ConnectionMultiplexer.Connect(options);
});

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)),
            ClockSkew = TimeSpan.Zero
        };

        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) &&
                    ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<FileService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<TokenExpiryJob>();

// Hangfire
builder.Services.AddHangfire(cfg => cfg
    .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "StudyHub API",
        Version = "v1",
        Description = "Backend API for StudyHub — school content, token licensing, and device management."
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your_access_token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

// CORS
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()
     .WithOrigins(
         "http://localhost:3000",
         "http://localhost:3001",
         "http://localhost:8080",
            "http://192.168.191.1:8080/",
            "http://192.168.18.11:8080/",

         "https://yourdomain.com"
     )));

// Health checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

var app = builder.Build();

// Migrate & seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DbSeeder.SeedAsync(db);
}

// Middleware pipeline — ORDER MATTERS
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseSerilogRequestLogging();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "StudyHub API v1");
    c.RoutePrefix = "swagger";
});
app.UseAuthentication();
app.UseMiddleware<JwtBlacklistMiddleware>();
app.UseAuthorization();
app.UseMiddleware<RateLimitMiddleware>();
app.UseMiddleware<TokenCheckMiddleware>();
app.MapControllers();
app.MapHub<DiscussionHub>("/hubs/discussions");
app.MapHealthChecks("/health");
app.MapHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = []
});

// Recurring jobs
var jobManager = app.Services.GetRequiredService<IRecurringJobManager>();
jobManager.AddOrUpdate<TokenExpiryJob>("expire-tokens", j => j.RunAsync(), Cron.Hourly);

app.Run();