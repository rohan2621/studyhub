using System.Security.Cryptography;
using System.Text;

namespace StudyHub.API.Helpers;

public static class DeviceHasher
{
    public static string Hash(string fingerprint)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(fingerprint));
        return Convert.ToHexString(bytes).ToLower();
    }
}