using System.Collections.Generic;
using System.Threading.Tasks;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services
{
    public interface IHighScoreService
    {
        Task<IEnumerable<HighScore>> GetTopScoresAsync(int count = 10);
        Task AddScoreAsync(HighScore score);
    }
}
