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
    public class HighScoreService : IHighScoreService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _filePath;

        public HighScoreService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _filePath = Path.Combine(_environment.ContentRootPath, "_data", "highscores.json");
        }

        public async Task<IEnumerable<HighScore>> GetTopScoresAsync(int count = 10)
        {
            var scores = await LoadScoresAsync();
            return scores.OrderByDescending(s => s.Score).Take(count);
        }

        public async Task AddScoreAsync(HighScore score)
        {
            var scores = (await LoadScoresAsync()).ToList();
            scores.Add(score);
            
            // Optional: Keep only top 100 to avoid file growing indefinitely
            var topScores = scores.OrderByDescending(s => s.Score).Take(100).ToList();
            
            await SaveScoresAsync(topScores);
        }

        private async Task<IEnumerable<HighScore>> LoadScoresAsync()
        {
            if (!File.Exists(_filePath))
            {
                return new List<HighScore>();
            }

            try
            {
                var json = await File.ReadAllTextAsync(_filePath);
                return JsonSerializer.Deserialize<List<HighScore>>(json) ?? new List<HighScore>();
            }
            catch
            {
                return new List<HighScore>();
            }
        }

        private async Task SaveScoresAsync(List<HighScore> scores)
        {
            var dir = Path.GetDirectoryName(_filePath);
            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var json = JsonSerializer.Serialize(scores, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, json);
        }
    }
}
