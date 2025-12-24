using System;

namespace WagenheimerDotCom.Models;

public class BlogPost
{
    public string Slug { get; set; } = "";
    public string Title { get; set; } = "";
    public DateTime Date { get; set; }
    public string Description { get; set; } = "";
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string Content { get; set; } = ""; // HTML content
    public string OriginalMarkdown { get; set; } = "";
}
