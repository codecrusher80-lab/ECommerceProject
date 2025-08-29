using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace ElectronicsStore.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly SmtpClient _smtpClient;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _baseUrl;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@electronicsstore.com";
            _fromName = _configuration["EmailSettings:FromName"] ?? "Electronics Store";
            _baseUrl = _configuration["EmailSettings:BaseUrl"] ?? "https://electronicsstore.com";

            // Initialize SMTP client
            var host = _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
            var port = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];
            var enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");

            _smtpClient = new SmtpClient(host, port)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                _smtpClient.Credentials = new NetworkCredential(username, password);
            }
        }

        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml,
                    BodyEncoding = Encoding.UTF8,
                    SubjectEncoding = Encoding.UTF8
                };

                mailMessage.To.Add(to);

                await _smtpClient.SendMailAsync(mailMessage);
                _logger.LogInformation($"Email sent successfully to {to} with subject: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to} with subject: {subject}");
                throw;
            }
        }

        public async Task SendEmailConfirmationAsync(string email, string name, string confirmationToken)
        {
            try
            {
                var confirmationUrl = $"{_baseUrl}/confirm-email?token={confirmationToken}&email={Uri.EscapeDataString(email)}";
                
                var subject = "Confirm Your Email Address - Electronics Store";
                var body = GetEmailTemplate("EmailConfirmation", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "ConfirmationUrl", confirmationUrl },
                    { "BaseUrl", _baseUrl }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email confirmation to {email}");
                throw;
            }
        }

        public async Task SendPasswordResetAsync(string email, string name, string resetToken)
        {
            try
            {
                var resetUrl = $"{_baseUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(email)}";
                
                var subject = "Reset Your Password - Electronics Store";
                var body = GetEmailTemplate("PasswordReset", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "ResetUrl", resetUrl },
                    { "BaseUrl", _baseUrl }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password reset email to {email}");
                throw;
            }
        }

        public async Task SendOrderConfirmationAsync(string email, string name, string orderNumber, decimal totalAmount)
        {
            try
            {
                var subject = $"Order Confirmation #{orderNumber} - Electronics Store";
                var body = GetEmailTemplate("OrderConfirmation", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "OrderNumber", orderNumber },
                    { "TotalAmount", $"₹{totalAmount:F2}" },
                    { "OrderUrl", $"{_baseUrl}/orders/{orderNumber}" },
                    { "BaseUrl", _baseUrl }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send order confirmation email to {email}");
                throw;
            }
        }

        public async Task SendOrderShippedAsync(string email, string name, string orderNumber, string trackingNumber)
        {
            try
            {
                var subject = $"Your Order #{orderNumber} Has Been Shipped - Electronics Store";
                var body = GetEmailTemplate("OrderShipped", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "OrderNumber", orderNumber },
                    { "TrackingNumber", trackingNumber },
                    { "TrackingUrl", $"{_baseUrl}/track-order?number={trackingNumber}" },
                    { "OrderUrl", $"{_baseUrl}/orders/{orderNumber}" },
                    { "BaseUrl", _baseUrl }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send order shipped email to {email}");
                throw;
            }
        }

        public async Task SendOrderDeliveredAsync(string email, string name, string orderNumber)
        {
            try
            {
                var subject = $"Your Order #{orderNumber} Has Been Delivered - Electronics Store";
                var body = GetEmailTemplate("OrderDelivered", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "OrderNumber", orderNumber },
                    { "OrderUrl", $"{_baseUrl}/orders/{orderNumber}" },
                    { "ReviewUrl", $"{_baseUrl}/orders/{orderNumber}/review" },
                    { "BaseUrl", _baseUrl }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send order delivered email to {email}");
                throw;
            }
        }

        public async Task SendWelcomeEmailAsync(string email, string name)
        {
            try
            {
                var subject = "Welcome to Electronics Store!";
                var body = GetEmailTemplate("Welcome", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "BaseUrl", _baseUrl },
                    { "ShopUrl", $"{_baseUrl}/products" },
                    { "ProfileUrl", $"{_baseUrl}/profile" }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send welcome email to {email}");
                throw;
            }
        }

        public async Task SendPromotionalEmailAsync(string email, string name, string subject, string content)
        {
            try
            {
                var body = GetEmailTemplate("Promotional", new Dictionary<string, string>
                {
                    { "Name", name },
                    { "Content", content },
                    { "BaseUrl", _baseUrl },
                    { "ShopUrl", $"{_baseUrl}/products" },
                    { "UnsubscribeUrl", $"{_baseUrl}/unsubscribe?email={Uri.EscapeDataString(email)}" }
                });

                await SendEmailAsync(email, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send promotional email to {email}");
                throw;
            }
        }

        private string GetEmailTemplate(string templateName, Dictionary<string, string> replacements)
        {
            var template = templateName switch
            {
                "EmailConfirmation" => GetEmailConfirmationTemplate(),
                "PasswordReset" => GetPasswordResetTemplate(),
                "OrderConfirmation" => GetOrderConfirmationTemplate(),
                "OrderShipped" => GetOrderShippedTemplate(),
                "OrderDelivered" => GetOrderDeliveredTemplate(),
                "Welcome" => GetWelcomeTemplate(),
                "Promotional" => GetPromotionalTemplate(),
                _ => GetDefaultTemplate()
            };

            foreach (var replacement in replacements)
            {
                template = template.Replace($"{{{replacement.Key}}}", replacement.Value);
            }

            return template;
        }

        private string GetEmailConfirmationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Confirm Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Electronics Store</h1>
    </div>
    <div class='content'>
        <h2>Welcome {Name}!</h2>
        <p>Thank you for creating an account with Electronics Store. To complete your registration, please confirm your email address by clicking the button below:</p>
        <p style='text-align: center;'>
            <a href='{ConfirmationUrl}' class='button'>Confirm Email Address</a>
        </p>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetPasswordResetTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Electronics Store</h1>
    </div>
    <div class='content'>
        <h2>Reset Your Password</h2>
        <p>Hello {Name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style='text-align: center;'>
            <a href='{ResetUrl}' class='button'>Reset Password</a>
        </p>
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetOrderConfirmationTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .order-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Order Confirmed!</h1>
    </div>
    <div class='content'>
        <h2>Thank you for your order, {Name}!</h2>
        <div class='order-info'>
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> {OrderNumber}</p>
            <p><strong>Total Amount:</strong> {TotalAmount}</p>
        </div>
        <p>We're processing your order and will send you shipping details soon.</p>
        <p style='text-align: center;'>
            <a href='{OrderUrl}' class='button'>View Order Details</a>
        </p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetOrderShippedTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Order Shipped</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        .tracking-info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Your Order is On Its Way!</h1>
    </div>
    <div class='content'>
        <h2>Great news, {Name}!</h2>
        <div class='tracking-info'>
            <h3>Shipping Information</h3>
            <p><strong>Order Number:</strong> {OrderNumber}</p>
            <p><strong>Tracking Number:</strong> {TrackingNumber}</p>
        </div>
        <p>Your order has been shipped and is on its way to you!</p>
        <p style='text-align: center;'>
            <a href='{TrackingUrl}' class='button'>Track Your Order</a>
            <a href='{OrderUrl}' class='button'>View Order Details</a>
        </p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetOrderDeliveredTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Order Delivered</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Order Delivered Successfully!</h1>
    </div>
    <div class='content'>
        <h2>Congratulations, {Name}!</h2>
        <p>Your order #{OrderNumber} has been delivered successfully. We hope you love your new products!</p>
        <p>Your feedback is important to us. Please take a moment to review your purchase:</p>
        <p style='text-align: center;'>
            <a href='{ReviewUrl}' class='button'>Write a Review</a>
            <a href='{OrderUrl}' class='button'>View Order Details</a>
        </p>
        <p>Thank you for choosing Electronics Store!</p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetWelcomeTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Welcome to Electronics Store</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        .features { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Welcome to Electronics Store!</h1>
    </div>
    <div class='content'>
        <h2>Hello {Name},</h2>
        <p>Welcome to Electronics Store! We're excited to have you as part of our community.</p>
        <div class='features'>
            <h3>What you can do:</h3>
            <ul>
                <li>Browse thousands of electronics products</li>
                <li>Get exclusive deals and offers</li>
                <li>Track your orders in real-time</li>
                <li>Write and read product reviews</li>
                <li>Create wishlists for future purchases</li>
            </ul>
        </div>
        <p style='text-align: center;'>
            <a href='{ShopUrl}' class='button'>Start Shopping</a>
            <a href='{ProfileUrl}' class='button'>Complete Profile</a>
        </p>
        <p>Happy shopping!</p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        private string GetPromotionalTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Special Offer - Electronics Store</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #FF5722; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Special Offer Just for You!</h1>
    </div>
    <div class='content'>
        <h2>Hello {Name},</h2>
        {Content}
        <p style='text-align: center;'>
            <a href='{ShopUrl}' class='button'>Shop Now</a>
        </p>
        <p>Best regards,<br>Electronics Store Team</p>
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
        <p><a href='{UnsubscribeUrl}' style='color: #666;'>Unsubscribe from promotional emails</a></p>
    </div>
</body>
</html>";
        }

        private string GetDefaultTemplate()
        {
            return @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <title>Electronics Store</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Electronics Store</h1>
    </div>
    <div class='content'>
        {Content}
    </div>
    <div class='footer'>
        <p>&copy; 2024 Electronics Store. All rights reserved.</p>
    </div>
</body>
</html>";
        }

        public void Dispose()
        {
            _smtpClient?.Dispose();
        }
    }
}