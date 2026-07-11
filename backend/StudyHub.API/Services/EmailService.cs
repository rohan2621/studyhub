using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace StudyHub.API.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger)
{
    private readonly string _host = config["Smtp:Host"]!;
    private readonly int _port = int.Parse(config["Smtp:Port"]!);
    private readonly string _username = config["Smtp:Username"]!;
    private readonly string _password = config["Smtp:Password"]!;
    private readonly string _fromEmail = config["Smtp:FromEmail"]!;
    private readonly string _fromName = config["Smtp:FromName"]!;
    private readonly string _baseUrl = config["AppBaseUrl"] ?? "http://localhost:3000";

    public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_username, _password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            logger.LogInformation("Email sent to {Email} — {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }

    public async Task SendPasswordResetAsync(string toEmail, string toName, string resetToken)
    {
        var resetUrl = $"{_baseUrl}/reset-password?token={resetToken}";

        var html = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
                <h2 style="color: #1a1a2e;">StudyHub Password Reset</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>You requested a password reset. Click the button below to set a new password.</p>
                <p>This link expires in <strong>15 minutes</strong>.</p>
                <a href="{resetUrl}"
                   style="display:inline-block; background:#4f46e5; color:white;
                          padding:12px 24px; border-radius:6px; text-decoration:none;
                          margin: 20px 0;">
                  Reset Password
                </a>
                <p style="color:#666; font-size:12px;">
                  If you didn't request this, ignore this email. Your password won't change.
                </p>
                <p style="color:#666; font-size:12px;">
                  Or copy this link: {resetUrl}
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#999; font-size:11px;">StudyHub — Your school study companion</p>
              </div>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, "Reset your StudyHub password", html);
    }

    public async Task SendWelcomeAsync(string toEmail, string toName, string schoolName)
    {
        var html = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
                <h2 style="color: #1a1a2e;">Welcome to StudyHub! 🎓</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Your account has been created successfully for <strong>{schoolName}</strong>.</p>
                <h3 style="color:#4f46e5;">Next Steps:</h3>
                <ol>
                  <li>Contact us on <strong>WhatsApp or Instagram</strong> to choose a plan</li>
                  <li>We'll issue your access token</li>
                  <li>Activate it on your device</li>
                  <li>Get full access to notes, homework, past papers and more!</li>
                </ol>
                <div style="background:#f0f0ff; border-radius:6px; padding:15px; margin:20px 0;">
                  <p style="margin:0; color:#4f46e5;"><strong>📱 Contact us:</strong></p>
                  <p style="margin:5px 0;">WhatsApp: +977-XXXXXXXXXX</p>
                  <p style="margin:5px 0;">Instagram: @studyhub.nepal</p>
                </div>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#999; font-size:11px;">StudyHub — Your school study companion</p>
              </div>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, "Welcome to StudyHub! 🎓", html);
    }

    public async Task SendTokenActivatedAsync(string toEmail, string toName, string plan, DateTime expiresAt)
    {
        var html = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
                <h2 style="color: #1a1a2e;">Access Token Activated ✅</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Your StudyHub access token has been activated successfully!</p>
                <div style="background:#f0fff4; border:1px solid #86efac; border-radius:6px; padding:15px; margin:20px 0;">
                  <p style="margin:0;"><strong>Plan:</strong> {plan}</p>
                  <p style="margin:5px 0;"><strong>Expires:</strong> {expiresAt:MMMM dd, yyyy}</p>
                </div>
                <p>You now have full access to all StudyHub content. Enjoy studying! 📚</p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#999; font-size:11px;">StudyHub — Your school study companion</p>
              </div>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, "Your StudyHub access is now active! ✅", html);
    }

    public async Task SendTokenExpiryReminderAsync(string toEmail, string toName, int daysLeft)
    {
        var html = $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
                <h2 style="color: #dc2626;">Your access expires in {daysLeft} day{(daysLeft == 1 ? "" : "s")}! ⏰</h2>
                <p>Hi <strong>{toName}</strong>,</p>
                <p>Your StudyHub access token is expiring soon. Renew it to keep your full access.</p>
                <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:6px; padding:15px; margin:20px 0;">
                  <p style="margin:0; color:#ea580c;"><strong>⚠️ Access expires in {daysLeft} day{(daysLeft == 1 ? "" : "s")}</strong></p>
                </div>
                <p>Contact us to renew:</p>
                <p>📱 WhatsApp: +977-XXXXXXXXXX</p>
                <p>📸 Instagram: @studyhub.nepal</p>
                <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
                <p style="color:#999; font-size:11px;">StudyHub — Your school study companion</p>
              </div>
            </body>
            </html>
            """;

        await SendAsync(toEmail, toName, $"⏰ Your StudyHub access expires in {daysLeft} days", html);
    }
}