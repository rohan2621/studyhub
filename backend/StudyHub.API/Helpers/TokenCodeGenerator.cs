using System.Security.Cryptography;

namespace StudyHub.API.Helpers;

public static class TokenCodeGenerator
{
    public static string Generate()
    {
        var part1 = RandomNumberGenerator.GetHexString(4).ToUpper();
        var part2 = RandomNumberGenerator.GetHexString(4).ToUpper();
        return $"SH-{part1}-{part2}";
    }
}