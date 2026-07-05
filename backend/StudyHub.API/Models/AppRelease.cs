using System;

namespace StudyHub.API.Models
{
    public class AppRelease
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        /// <summary>
        /// Incremental version code (e.g., 2). Used by the app to determine if an update is newer.
        /// </summary>
        public int VersionCode { get; set; }
        
        /// <summary>
        /// Human readable version name (e.g., "1.0.1").
        /// </summary>
        public string VersionName { get; set; } = string.Empty;
        
        /// <summary>
        /// Details of what changed in this release.
        /// </summary>
        public string ReleaseNotes { get; set; } = string.Empty;
        
        /// <summary>
        /// The URL path to download the APK.
        /// </summary>
        public string FileUrl { get; set; } = string.Empty;
        
        /// <summary>
        /// If true, the user is forced to update and cannot dismiss the prompt.
        /// </summary>
        public bool IsMandatory { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
