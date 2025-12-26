using Markdig;
using Markdig.Syntax;
using Markdig.SyntaxHighlighting;
using Microsoft.AspNetCore.Hosting;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services;

public interface IBlogService
{
    Task<IEnumerable<BlogPost>> GetPostsAsync(string culture = "en");
    Task<BlogPost?> GetPostBySlugAsync(string slug, string culture = "en");
    Task SavePostAsync(BlogPost post, string culture = "en");
    Task DeletePostAsync(string slug);
}

public class MarkdownBlogService : IBlogService
{
    private readonly IWebHostEnvironment _env;
    // Cache key now needs to include culture
    private readonly Dictionary<string, IEnumerable<BlogPost>> _cache = new();

    public MarkdownBlogService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<IEnumerable<BlogPost>> GetPostsAsync(string culture = "en")
    {
        // Normalize culture to just 2 chars if possible (e.g. pt-BR -> pt)
        var lang = culture.Length > 2 ? culture.Substring(0, 2).ToLower() : culture.ToLower();
        if (lang != "pt" && lang != "en") lang = "en";

        if (_cache.ContainsKey(lang)) return _cache[lang];

        var postsPath = Path.Combine(_env.ContentRootPath, "_posts");
        if (!Directory.Exists(postsPath))
        {
            Directory.CreateDirectory(postsPath);
            return Enumerable.Empty<BlogPost>();
        }

        var posts = new List<BlogPost>();
        // Only get files for the specific culture
        var files = Directory.GetFiles(postsPath, $"*.{lang}.md");

        var pipeline = new MarkdownPipelineBuilder()
            .UseYamlFrontMatter()
            .UseAdvancedExtensions()
            .UseSyntaxHighlighting()
            .Build();

        foreach (var file in files)
        {
            var markdown = await File.ReadAllTextAsync(file);
            var document = Markdown.Parse(markdown, pipeline);
            
            var yamlBlock = document.Descendants<Markdig.Extensions.Yaml.YamlFrontMatterBlock>().FirstOrDefault();
            var yaml = yamlBlock != null ? markdown.Substring(yamlBlock.Span.Start, yamlBlock.Span.Length) : "";
            
            var title = ParseYamlValues(yaml, "title");
            var dateStr = ParseYamlValues(yaml, "date");
            var desc = ParseYamlValues(yaml, "description");
            var tagsStr = ParseYamlValues(yaml, "tags");
            
            DateTime.TryParse(dateStr, out var date);

            var html = Markdown.ToHtml(markdown, pipeline);
            
            // Slug should not include the language suffix for cleaner URLs if we did routing differently, 
            // but here consistency with filename is key. 
            // Let's strip the .lang part from the slug so the URL looks like /blog/my-post (and we infer lang from context)
            var filename = Path.GetFileNameWithoutExtension(file); // e.g. my-post.en
            var slug = filename.Substring(0, filename.LastIndexOf('.')); // e.g. my-post

            posts.Add(new BlogPost
            {
                Slug = slug,
                Title = title ?? "Untitled",
                Date = date,
                Description = desc ?? "",
                Tags = tagsStr?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray() ?? Array.Empty<string>(),
                Content = html,
                OriginalMarkdown = markdown
            });
        }

        var ordered = posts.OrderByDescending(p => p.Date).ToList();
        _cache[lang] = ordered;
        return ordered;
    }

    public async Task<BlogPost?> GetPostBySlugAsync(string slug, string culture = "en")
    {
        var posts = await GetPostsAsync(culture);
        return posts.FirstOrDefault(p => p.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
    }

    public async Task SavePostAsync(BlogPost post, string culture = "en")
    {
        var lang = culture.Length > 2 ? culture.Substring(0, 2).ToLower() : culture.ToLower();
        if (lang != "pt" && lang != "en") lang = "en";

        var postsPath = Path.Combine(_env.ContentRootPath, "_posts");
        if (!Directory.Exists(postsPath)) Directory.CreateDirectory(postsPath);

        // Filename format: slug.lang.md
        var filename = $"{post.Slug}.{lang}.md";
        var filePath = Path.Combine(postsPath, filename);

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("---");
        sb.AppendLine($"title: \"{post.Title}\"");
        sb.AppendLine($"date: \"{post.Date:yyyy-MM-dd}\"");
        sb.AppendLine($"description: \"{post.Description}\"");
        sb.AppendLine($"tags: \"{string.Join(", ", post.Tags ?? Array.Empty<string>())}\"");
        sb.AppendLine("---");
        sb.AppendLine();
        sb.AppendLine(post.OriginalMarkdown);

        await File.WriteAllTextAsync(filePath, sb.ToString());
        
        // Invalidate cache for this language
        if (_cache.ContainsKey(lang)) _cache.Remove(lang);
    }

    public Task DeletePostAsync(string slug)
    {
        var postsPath = Path.Combine(_env.ContentRootPath, "_posts");
        
        // Delete both versions to keep it clean, or we could require culture.
        // For admin simplicity, let's delete all variations of this slug.
        var enPath = Path.Combine(postsPath, $"{slug}.en.md");
        var ptPath = Path.Combine(postsPath, $"{slug}.pt.md");

        if (File.Exists(enPath)) File.Delete(enPath);
        if (File.Exists(ptPath)) File.Delete(ptPath);
        
        _cache.Clear();
        return Task.CompletedTask;
    }

    private string? ParseYamlValues(string yaml, string key)
    {
        var lines = yaml.Split('\n');
        foreach (var line in lines)
        {
            var parts = line.Split(':', 2);
            if (parts.Length == 2 && parts[0].Trim().Equals(key, StringComparison.OrdinalIgnoreCase))
            {
                return parts[1].Trim().Trim('"').Trim('\'');
            }
        }
        return null;
    }
}
