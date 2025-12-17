from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from flask import current_app
import logging

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send email using SendGrid"""
    try:
        if not current_app.config.get('SENDGRID_API_KEY'):
            logger.warning("SendGrid API key not configured, skipping email send")
            return False
        
        message = Mail(
            from_email=Email(current_app.config['FROM_EMAIL'], current_app.config['FROM_NAME']),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        sg = SendGridAPIClient(current_app.config['SENDGRID_API_KEY'])
        response = sg.send(message)
        
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


def send_verification_email(to_email: str, user_name: str, verification_link: str) -> bool:
    """Send email verification"""
    subject = "Verify your AgriConnect account"
    html_content = f"""
    <html>
        <body>
            <h2>Welcome to AgriConnect, {user_name}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="{verification_link}">Verify Email</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, html_content)


def send_password_reset_email(to_email: str, user_name: str, reset_link: str) -> bool:
    """Send password reset email"""
    subject = "Reset your AgriConnect password"
    html_content = f"""
    <html>
        <body>
            <h2>Hello {user_name},</h2>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, html_content)


def send_order_confirmation_email(to_email: str, user_name: str, order_id: str, order_total: float) -> bool:
    """Send order confirmation email"""
    subject = f"Order Confirmation - {order_id}"
    html_content = f"""
    <html>
        <body>
            <h2>Thank you for your order, {user_name}!</h2>
            <p>Your order <strong>{order_id}</strong> has been confirmed.</p>
            <p>Order Total: ${order_total:.2f}</p>
            <p>You can track your order in your dashboard.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, html_content)
