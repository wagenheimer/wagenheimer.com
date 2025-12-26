using System.Collections.Generic;
using System.Threading.Tasks;
using WagenheimerDotCom.Models;

namespace WagenheimerDotCom.Services
{
    public interface ICommentService
    {
        Task<IEnumerable<Comment>> GetCommentsForPostAsync(string slug);
        Task<IEnumerable<Comment>> GetPendingCommentsAsync();
        Task AddCommentAsync(Comment comment);
        Task ApproveCommentAsync(string id);
        Task DeleteCommentAsync(string id);
    }
}
