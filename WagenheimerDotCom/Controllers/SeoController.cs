using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Xml;
using WagenheimerDotCom.Services;

namespace WagenheimerDotCom.Controllers
{
    public class SeoController : Controller
    {
        private readonly IBlogService _blogService;
        private readonly IGameService _gameService;

        public SeoController(IBlogService blogService, IGameService gameService)
        {
            _blogService = blogService;
            _gameService = gameService;
        }

        [HttpGet("sitemap.xml")]
        public async Task<IActionResult> Sitemap()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var posts = await _blogService.GetPostsAsync();
            var games = await _gameService.GetGamesAsync();

            var sb = new StringBuilder();
            sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
            sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

            // Static Pages
            AddUrl(sb, baseUrl, "", DateTime.UtcNow, "1.0");
            AddUrl(sb, baseUrl, "blog", DateTime.UtcNow, "0.9");
            
            // Dynamic Posts
            foreach (var post in posts)
            {
                AddUrl(sb, baseUrl, $"blog/{post.Slug}", post.Date, "0.8");
            }

            // Games (if they have individual pages in the future, currently on home)
            // But we can link to them if detailed pages existed. For now, let's keep it simple.

            sb.AppendLine("</urlset>");

            return Content(sb.ToString(), "application/xml");
        }

        [HttpGet("feed.xml")]
        public async Task<IActionResult> Feed()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var posts = (await _blogService.GetPostsAsync()).Take(20); // Last 20 posts

            var sb = new StringBuilder();
            sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
            sb.AppendLine("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">");
            sb.AppendLine("<channel>");
            sb.AppendLine("<title>Cezar Wagenheimer - Blog</title>");
            sb.AppendLine($"<link>{baseUrl}/blog</link>");
            sb.AppendLine("<description>Insights sobre desenvolvimento, games e tecnologia.</description>");
            sb.AppendLine("<language>pt-BR</language>");
            sb.AppendLine($"<atom:link href=\"{baseUrl}/feed.xml\" rel=\"self\" type=\"application/rss+xml\" />");

            foreach (var post in posts)
            {
                sb.AppendLine("<item>");
                sb.AppendLine($"<title><![CDATA[{post.Title}]]></title>");
                sb.AppendLine($"<link>{baseUrl}/blog/{post.Slug}</link>");
                sb.AppendLine($"<guid>{baseUrl}/blog/{post.Slug}</guid>");
                sb.AppendLine($"<pubDate>{post.Date:R}</pubDate>"); // RFC1123
                sb.AppendLine($"<description><![CDATA[{post.Description}]]></description>");
                if (post.Tags != null)
                {
                    foreach (var tag in post.Tags)
                    {
                        sb.AppendLine($"<category>{tag}</category>");
                    }
                }
                sb.AppendLine("</item>");
            }

            sb.AppendLine("</channel>");
            sb.AppendLine("</rss>");

            return Content(sb.ToString(), "application/xml");
        }

        private void AddUrl(StringBuilder sb, string baseUrl, string path, DateTime lastMod, string priority)
        {
            sb.AppendLine("<url>");
            sb.AppendLine($"<loc>{baseUrl}/{path}</loc>");
            sb.AppendLine($"<lastmod>{lastMod:yyyy-MM-dd}</lastmod>");
            sb.AppendLine($"<changefreq>weekly</changefreq>");
            sb.AppendLine($"<priority>{priority}</priority>");
            sb.AppendLine("</url>");
        }
    }
}
