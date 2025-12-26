using Microsoft.AspNetCore.Mvc;
using WagenheimerDotCom.Models;
using WagenheimerDotCom.Services;

namespace WagenheimerDotCom.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly IHighScoreService _highScoreService;

        public GameController(IHighScoreService highScoreService)
        {
            _highScoreService = highScoreService;
        }

        [HttpGet("scores")]
        public async Task<IActionResult> GetScores()
        {
            var scores = await _highScoreService.GetTopScoresAsync(5);
            return Ok(scores);
        }

        [HttpPost("score")]
        public async Task<IActionResult> SubmitScore([FromBody] HighScore score)
        {
            if (string.IsNullOrWhiteSpace(score.PlayerName))
            {
                score.PlayerName = "Anonymous";
            }
            
            score.Date = DateTime.UtcNow;
            await _highScoreService.AddScoreAsync(score);
            return Ok();
        }
    }
}
