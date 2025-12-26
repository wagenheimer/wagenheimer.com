using System;

namespace WagenheimerDotCom.Models
{
    public class HighScore
    {
        public string PlayerName { get; set; } = string.Empty;
        public int Score { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
    }
}
