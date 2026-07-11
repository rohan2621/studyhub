using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("files")]
[Authorize]
public class FilesController(FileService fileService) : ControllerBase
{
    [HttpPost("upload")]
    [Authorize(Roles = "Teacher,TopperContributor,Admin")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = 536870912)] // 512 MB
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "File is required." });

        var allowedMimeTypes = new[]
        {
            "application/pdf",
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "audio/mpeg",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        };

        if (!allowedMimeTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { error = "Invalid file type. Only standard documents and media are allowed." });

        try
        {
            var fileName = file.FileName;
            
            // Clean up file name to prevent path traversal issues
            var safeName = System.Text.RegularExpressions.Regex.Replace(fileName, "[^a-zA-Z0-9.\\-_]", "");

            string publicUrl;
            using (var stream = file.OpenReadStream())
            {
                publicUrl = await fileService.UploadGeneralFileAsync(stream, safeName, file.ContentType);
            }

            return Ok(new
            {
                url = publicUrl
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}