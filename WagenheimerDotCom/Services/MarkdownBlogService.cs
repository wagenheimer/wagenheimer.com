using Markdig;
using Markdig.Syntax;
using Markdig.SyntaxHighlighting;
using Microsoft.AspNetCore.Hosting;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services;

public interface IBlogService
{
    Task<IEnumerable<BlogPost>> GetPostsAsync();
    Task<BlogPost?> GetPostBySlugAsync(string slug);
}

public class MarkdownBlogService : IBlogService
{
    private readonly IWebHostEnvironment _env;
    private IEnumerable<BlogPost>? _cache;

    public MarkdownBlogService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<IEnumerable<BlogPost>> GetPostsAsync()
    {
        if (_cache != null) return _cache;

        var postsPath = Path.Combine(_env.ContentRootPath, "_posts");
        if (!Directory.Exists(postsPath))
        {
            Directory.CreateDirectory(postsPath);
            return Enumerable.Empty<BlogPost>();
        }

        var posts = new List<BlogPost>();
        var files = Directory.GetFiles(postsPath, "*.md");

        var pipeline = new MarkdownPipelineBuilder()
            .UseYamlFrontMatter()
            .UseAdvancedExtensions()
            .UseSyntaxHighlighting()
            .Build();

        foreach (var file in files)
        {
            var markdown = await File.ReadAllTextAsync(file);
            var document = Markdown.Parse(markdown, pipeline);
            
            // Extract Frontmatter
            var yamlBlock = document.Descendants<Markdig.Extensions.Yaml.YamlFrontMatterBlock>().FirstOrDefault();
            var yaml = yamlBlock != null ? markdown.Substring(yamlBlock.Span.Start, yamlBlock.Span.Length) : "";
            
            // Simple parsing of YAML Key-Values manually or use a YAML parser. 
            // For simplicity and dependency reduction, we'll parse manually line by line (risky but okay for personal blog).
            // BETTER: Use Markdig's Yaml block to just get properties? No, Markdig allows access but we need to parse the text.
            // Let's use a simple manual parser for title, date, etc.
            
            var title = ParseYamlValues(yaml, "title");
            var dateStr = ParseYamlValues(yaml, "date");
            var desc = ParseYamlValues(yaml, "description");
            var tagsStr = ParseYamlValues(yaml, "tags");
            
            DateTime.TryParse(dateStr, out var date);

            var html = Markdown.ToHtml(markdown, pipeline);
            
            posts.Add(new BlogPost
            {
                Slug = Path.GetFileNameWithoutExtension(file),
                Title = title ?? "Untitled",
                Date = date,
                Description = desc ?? "",
                Tags = tagsStr?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray() ?? Array.Empty<string>(),
                Content = html,
                OriginalMarkdown = markdown
            });
        }

        _cache = posts.OrderByDescending(p => p.Date).ToList();
        return _cache;
    }

    public async Task<BlogPost?> GetPostBySlugAsync(string slug)
    {
        var posts = await GetPostsAsync();
        return posts.FirstOrDefault(p => p.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
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
