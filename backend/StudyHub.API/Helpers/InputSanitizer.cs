using System.Text.RegularExpressions;

namespace StudyHub.API.Helpers;

public static class InputSanitizer
{
    public static string Sanitize(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return input;

        // Strip HTML tags
        input = Regex.Replace(input, @"<[^>]*>", string.Empty);

        // Encode dangerous characters
        input = input
            .Replace("&", "&amp;")
            .Replace("<", "&lt;")
            .Replace(">", "&gt;")
            .Replace("\"", "&quot;")
            .Replace("'", "&#x27;");

        return input.Trim();
    }

    public static bool ContainsSqlInjection(string input)
    {
        var patterns = new[]
        {
            @"(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)",
            @"(--|;|\/\*|\*\/|xp_)",
            @"(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+"
        };

        return patterns.Any(p =>
            Regex.IsMatch(input, p, RegexOptions.IgnoreCase));
    }
}