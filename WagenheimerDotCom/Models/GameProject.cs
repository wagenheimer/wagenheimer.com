namespace WagenheimerDotCom.Models;

public class GameProject
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string? SteamUrl { get; set; }
    public string? ItchUrl { get; set; }
    public string? PlayStoreUrl { get; set; }
    public string? AppStoreUrl { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public bool IsFeatured { get; set; }
    public DateTime ReleaseDate { get; set; } = DateTime.Now;
    
    public string? Content { get; set; } 
    public string? OriginalMarkdown { get; set; }
}
