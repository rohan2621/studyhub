using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyHub.API.Services;

namespace StudyHub.API.Controllers;

[ApiController]
[Route("files")]
[Authorize]
public class FilesController(FileService fileService) : ControllerBase
{
    [HttpPost("presign")]
    [Authorize(Roles = "Teacher,TopperContributor,Admin")]
    public IActionResult GetUploadInfo([FromBody] PresignRequest req)
    {
        try
        {
            var (uploadUrl, publicUrl, key) = fileService.PrepareUpload(
                req.FileName, req.ContentType, req.FileSizeBytes);

            return Ok(new
            {
                uploadUrl,
                publicUrl,
                key,
                method = "POST",
                headers = new
                {
                    Authorization = fileService.GetStorageAuthorizationHeader(),
                    ContentType = req.ContentType
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record PresignRequest(string FileName, string ContentType, long FileSizeBytes);