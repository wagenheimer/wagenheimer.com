using System;
using System.ComponentModel.DataAnnotations;

namespace WagenheimerDotCom.Models
{
    public class Comment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string PostSlug { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Author { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "O comentário é obrigatório.")]
        public string Content { get; set; } = string.Empty;
        
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public bool IsApproved { get; set; } = false;
    }
}
