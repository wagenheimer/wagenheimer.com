using System.ComponentModel.DataAnnotations;

namespace WagenheimerDotCom.Models
{
    public class ContactRequest
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email inválido.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A mensagem é obrigatória.")]
        public string Message { get; set; } = string.Empty;
    }
}
