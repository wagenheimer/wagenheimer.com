using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services
{
    public class CommentService : ICommentService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _filePath;

        public CommentService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _filePath = Path.Combine(_environment.ContentRootPath, "_data", "comments.json");
        }

        public async Task<IEnumerable<Comment>> GetCommentsForPostAsync(string slug)
        {
            var comments = await LoadCommentsAsync();
            return comments.Where(c => c.PostSlug == slug && c.IsApproved).OrderByDescending(c => c.Date);
        }

        public async Task<IEnumerable<Comment>> GetPendingCommentsAsync()
        {
            var comments = await LoadCommentsAsync();
            return comments.Where(c => !c.IsApproved).OrderByDescending(c => c.Date);
        }

        public async Task AddCommentAsync(Comment comment)
        {
            comment.Id = Guid.NewGuid().ToString();
            comment.Date = DateTime.UtcNow;
            comment.IsApproved = false; // Always require approval
            
            var comments = (await LoadCommentsAsync()).ToList();
            comments.Add(comment);
            await SaveCommentsAsync(comments);
        }

        public async Task ApproveCommentAsync(string id)
        {
            var comments = (await LoadCommentsAsync()).ToList();
            var comment = comments.FirstOrDefault(c => c.Id == id);
            if (comment != null)
            {
                comment.IsApproved = true;
                await SaveCommentsAsync(comments);
            }
        }

        public async Task DeleteCommentAsync(string id)
        {
            var comments = (await LoadCommentsAsync()).ToList();
            var comment = comments.FirstOrDefault(c => c.Id == id);
            if (comment != null)
            {
                comments.Remove(comment);
                await SaveCommentsAsync(comments);
            }
        }

        private async Task<IEnumerable<Comment>> LoadCommentsAsync()
        {
            if (!File.Exists(_filePath))
            {
                return new List<Comment>();
            }

            try
            {
                var json = await File.ReadAllTextAsync(_filePath);
                return JsonSerializer.Deserialize<List<Comment>>(json) ?? new List<Comment>();
            }
            catch
            {
                return new List<Comment>();
            }
        }

        private async Task SaveCommentsAsync(List<Comment> comments)
        {
            var dir = Path.GetDirectoryName(_filePath);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var json = JsonSerializer.Serialize(comments, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, json);
        }
    }
}
