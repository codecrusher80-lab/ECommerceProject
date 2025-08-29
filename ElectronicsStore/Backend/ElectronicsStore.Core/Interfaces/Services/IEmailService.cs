namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task SendEmailConfirmationAsync(string email, string name, string confirmationToken);
        Task SendPasswordResetAsync(string email, string name, string resetToken);
        Task SendOrderConfirmationAsync(string email, string name, string orderNumber, decimal totalAmount);
        Task SendOrderShippedAsync(string email, string name, string orderNumber, string trackingNumber);
        Task SendOrderDeliveredAsync(string email, string name, string orderNumber);
        Task SendWelcomeEmailAsync(string email, string name);
        Task SendPromotionalEmailAsync(string email, string name, string subject, string content);
    }
}