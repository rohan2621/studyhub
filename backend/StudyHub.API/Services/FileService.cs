using System.Net.Http.Headers;

namespace StudyHub.API.Services;

public class FileService(IConfiguration config, IHttpClientFactory httpClientFactory)
{
    private readonly string _url = config["Supabase:Url"]!;
    private readonly string _key = config["Supabase:ServiceRoleKey"]!;
    private readonly string _bucket = config["Supabase:BucketName"]!;

    private static readonly HashSet<string> AllowedTypes =
    [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    private const long MaxFileSizeBytes = 20 * 1024 * 1024; // 20MB

    public string GetUploadUrl(string key) =>
        $"{_url}/storage/v1/object/{_bucket}/{key}";

    public string GetPublicUrl(string key) =>
        $"{_url}/storage/v1/object/public/{_bucket}/{key}";

    public (string uploadUrl, string publicUrl, string key) PrepareUpload(
        string fileName, string contentType, long fileSize)
    {
        if (!AllowedTypes.Contains(contentType))
            throw new InvalidOperationException("File type not allowed.");

        if (fileSize > MaxFileSizeBytes)
            throw new InvalidOperationException("File exceeds 20 MB limit.");

        var key = $"{Guid.NewGuid()}/{fileName}";
        var uploadUrl = GetUploadUrl(key);
        var publicUrl = GetPublicUrl(key);

        return (uploadUrl, publicUrl, key);
    }

    public async Task<string> UploadAppReleaseAsync(Stream fileStream, string fileName)
    {
        var key = $"apps/{Guid.NewGuid()}/{fileName}";
        var uploadUrl = GetUploadUrl(key);
        var publicUrl = GetPublicUrl(key);

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _key);

        using var content = new StreamContent(fileStream);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/vnd.android.package-archive");

        var response = await client.PostAsync(uploadUrl, content);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to upload APK to Supabase: {error}");
        }

        return publicUrl;
    }

    public async Task<string> UploadGeneralFileAsync(Stream fileStream, string fileName, string contentType)
    {
        if (!AllowedTypes.Contains(contentType))
            throw new InvalidOperationException("File type not allowed.");

        if (fileStream.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("File exceeds 20 MB limit.");

        var key = $"notes/{Guid.NewGuid()}/{fileName}";
        var uploadUrl = GetUploadUrl(key);
        var publicUrl = GetPublicUrl(key);

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _key);

        using var content = new StreamContent(fileStream);
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        var response = await client.PostAsync(uploadUrl, content);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Failed to upload file to Supabase: {error}");
        }

        return publicUrl;
    }
}