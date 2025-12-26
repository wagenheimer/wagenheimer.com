using Markdig;
using Markdig.Syntax;
using Markdig.SyntaxHighlighting;
using Microsoft.AspNetCore.Hosting;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services;

public interface IGameService
{
    Task<IEnumerable<GameProject>> GetGamesAsync();
    Task<GameProject?> GetGameBySlugAsync(string slug);
    Task SaveGameAsync(GameProject game);
    Task DeleteGameAsync(string slug);
}

public class MarkdownGameService : IGameService
{
    private readonly IWebHostEnvironment _env;
    private IEnumerable<GameProject>? _cache;

    public MarkdownGameService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<IEnumerable<GameProject>> GetGamesAsync()
    {
        if (_cache != null) return _cache;

        var gamesPath = Path.Combine(_env.ContentRootPath, "_games");
        if (!Directory.Exists(gamesPath))
        {
            Directory.CreateDirectory(gamesPath);
            return Enumerable.Empty<GameProject>();
        }

        var games = new List<GameProject>();
        var files = Directory.GetFiles(gamesPath, "*.md");

        var pipeline = new MarkdownPipelineBuilder()
            .UseYamlFrontMatter()
            .Build();

        foreach (var file in files)
        {
            var markdown = await File.ReadAllTextAsync(file);
            var document = Markdown.Parse(markdown, pipeline);
            
            var yamlBlock = document.Descendants<Markdig.Extensions.Yaml.YamlFrontMatterBlock>().FirstOrDefault();
            var yaml = yamlBlock != null ? markdown.Substring(yamlBlock.Span.Start, yamlBlock.Span.Length) : "";
            
            var title = ParseYamlValues(yaml, "title");
            var dateStr = ParseYamlValues(yaml, "releaseDate");
            var desc = ParseYamlValues(yaml, "description");
            var cover = ParseYamlValues(yaml, "coverImage");
            var steam = ParseYamlValues(yaml, "steamUrl");
            var itch = ParseYamlValues(yaml, "itchUrl");
            var play = ParseYamlValues(yaml, "playStoreUrl");
            var app = ParseYamlValues(yaml, "appStoreUrl");
            var tagsStr = ParseYamlValues(yaml, "tags");
            var featuredStr = ParseYamlValues(yaml, "isFeatured");
            
            DateTime.TryParse(dateStr, out var date);
            bool.TryParse(featuredStr, out var isFeatured);

            var filename = Path.GetFileNameWithoutExtension(file);

            games.Add(new GameProject
            {
                Slug = filename,
                Title = title ?? "Untitled",
                ReleaseDate = date,
                Description = desc ?? "",
                CoverImage = cover ?? "",
                SteamUrl = steam,
                ItchUrl = itch,
                PlayStoreUrl = play,
                AppStoreUrl = app,
                Tags = tagsStr?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray() ?? Array.Empty<string>(),
                IsFeatured = isFeatured,
                OriginalMarkdown = markdown
            });
        }

        _cache = games.OrderByDescending(p => p.ReleaseDate).ToList();
        return _cache;
    }

    public async Task<GameProject?> GetGameBySlugAsync(string slug)
    {
        var games = await GetGamesAsync();
        return games.FirstOrDefault(g => g.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
    }

    public async Task SaveGameAsync(GameProject game)
    {
        var gamesPath = Path.Combine(_env.ContentRootPath, "_games");
        if (!Directory.Exists(gamesPath)) Directory.CreateDirectory(gamesPath);

        var filename = $"{game.Slug}.md";
        var filePath = Path.Combine(gamesPath, filename);

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("---");
        sb.AppendLine($"title: \"{game.Title}\"");
        sb.AppendLine($"releaseDate: \"{game.ReleaseDate:yyyy-MM-dd}\"");
        sb.AppendLine($"description: \"{game.Description}\"");
        sb.AppendLine($"coverImage: \"{game.CoverImage}\"");
        if (!string.IsNullOrEmpty(game.SteamUrl)) sb.AppendLine($"steamUrl: \"{game.SteamUrl}\"");
        if (!string.IsNullOrEmpty(game.ItchUrl)) sb.AppendLine($"itchUrl: \"{game.ItchUrl}\"");
        if (!string.IsNullOrEmpty(game.PlayStoreUrl)) sb.AppendLine($"playStoreUrl: \"{game.PlayStoreUrl}\"");
        if (!string.IsNullOrEmpty(game.AppStoreUrl)) sb.AppendLine($"appStoreUrl: \"{game.AppStoreUrl}\"");
        sb.AppendLine($"tags: \"{string.Join(", ", game.Tags ?? Array.Empty<string>())}\"");
        sb.AppendLine($"isFeatured: {game.IsFeatured.ToString().ToLower()}");
        sb.AppendLine("---");
        sb.AppendLine();
        // Just keeping content empty or minimal for now as requirements focus on metadata for cards
        sb.AppendLine(game.Content ?? "");

        await File.WriteAllTextAsync(filePath, sb.ToString());
        
        _cache = null; // Invalidate cache
    }

    public Task DeleteGameAsync(string slug)
    {
        var gamesPath = Path.Combine(_env.ContentRootPath, "_games");
        var filePath = Path.Combine(gamesPath, $"{slug}.md");

        if (File.Exists(filePath)) File.Delete(filePath);
        
        _cache = null;
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
