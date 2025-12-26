using System.Threading.Tasks;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services
{
    public interface IContactService
    {
        Task SendMessageAsync(ContactRequest request);
    }
}
