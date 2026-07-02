using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StudyHub.API.Models;

namespace StudyHub.API.Services;

public class TokenService(IConfiguration config)
{
    public string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("schoolId", user.SchoolId.ToString()),
            new Claim("grade", user.Grade),
            new Claim("section", user.Section),
            new Claim("name", user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(config["Jwt:AccessTokenExpiryMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public static DateTime GetPlanExpiry(TokenPlan plan) => plan switch
    {
        TokenPlan.OneWeek => DateTime.UtcNow.AddDays(7),
        TokenPlan.OneMonth => DateTime.UtcNow.AddMonths(1),
        TokenPlan.TwoMonths => DateTime.UtcNow.AddMonths(2),
        TokenPlan.ThreeMonths => DateTime.UtcNow.AddMonths(3),
        TokenPlan.SixMonths => DateTime.UtcNow.AddMonths(6),
        TokenPlan.OneYear => DateTime.UtcNow.AddYears(1),
        _ => throw new ArgumentOutOfRangeException(nameof(plan))
    };

    public static int GetPlanDays(TokenPlan plan) => plan switch
    {
        TokenPlan.OneWeek => 7,
        TokenPlan.OneMonth => 30,
        TokenPlan.TwoMonths => 60,
        TokenPlan.ThreeMonths => 90,
        TokenPlan.SixMonths => 180,
        TokenPlan.OneYear => 365,
        _ => 0
    };
}