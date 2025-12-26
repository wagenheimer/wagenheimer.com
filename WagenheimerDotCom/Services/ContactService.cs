using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services
{
    public class ContactService : IContactService
    {
        private readonly ILogger<ContactService> _logger;

        public ContactService(ILogger<ContactService> logger)
        {
            _logger = logger;
        }

        public async Task SendMessageAsync(ContactRequest request)
        {
            // Simulating network delay
            await Task.Delay(1000);

            // In a real scenario, this would use SMTP or an external API (SendGrid, Mailgun)
            _logger.LogInformation("--------------------------------------------------");
            _logger.LogInformation($"[CONTACT FORM] Received message from: {request.Name} ({request.Email})");
            _logger.LogInformation($"[CONTACT FORM] Message: {request.Message}");
            _logger.LogInformation("--------------------------------------------------");
        }
    }
}
