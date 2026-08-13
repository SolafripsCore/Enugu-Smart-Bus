import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

RESEND_ENDPOINT = "https://api.resend.com/emails"


def email_enabled() -> bool:
    return bool(settings.resend_api_key)


def send_email(to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    """Send a transactional email through Resend.

    Returns False (without raising) when email is not configured or the
    provider rejects the request, so request handlers can degrade gracefully.
    """
    if not email_enabled():
        return False

    payload: dict[str, object] = {
        "from": settings.mail_from,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        response = httpx.post(
            RESEND_ENDPOINT,
            json=payload,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            timeout=10.0,
        )
        response.raise_for_status()
    except httpx.HTTPError:
        logger.exception("Failed to send email to %s", to)
        return False
    return True


def send_password_reset(to: str, full_name: str, token: str) -> bool:
    link = f"{settings.site_url.rstrip('/')}/reset-password?token={token}"
    html = f"""
    <p>Hello {full_name},</p>
    <p>We received a request to reset your Enugu Smart Bus password.
    Use the link below within {settings.reset_token_minutes} minutes:</p>
    <p><a href="{link}">Reset your password</a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>— Enugu Smart Bus</p>
    """
    return send_email(to, "Reset your Enugu Smart Bus password", html)


def send_contact_notification(
    name: str, email: str, phone: str | None, subject: str, message: str
) -> bool:
    html = f"""
    <p><strong>New contact message from the website</strong></p>
    <p><strong>Name:</strong> {name}<br/>
    <strong>Email:</strong> {email}<br/>
    <strong>Phone:</strong> {phone or "—"}<br/>
    <strong>Subject:</strong> {subject}</p>
    <p>{message}</p>
    """
    return send_email(
        settings.contact_email,
        f"[Website] {subject}",
        html,
        reply_to=email,
    )


def send_newsletter_welcome(to: str) -> bool:
    html = """
    <p>Thanks for subscribing to Enugu Smart Bus updates.</p>
    <p>You'll hear from us about new routes, fare offers and service
    announcements across Enugu State.</p>
    <p>— Enugu Smart Bus</p>
    """
    return send_email(to, "You're subscribed to Enugu Smart Bus updates", html)
