from pathlib import Path
from typing import Any, Dict

import resend
from jinja2 import Environment, FileSystemLoader

from app.core.config import settings

# Configure Resend
resend.api_key = settings.RESEND_API_KEY

template_dir = Path(__file__).parent.parent / "templates"
env = Environment(loader=FileSystemLoader(str(template_dir)))


def render_template(template_name: str, context: Dict[str, Any]) -> str:
    template = env.get_template(template_name)
    return template.render(context)


def send_verification_email(email_to: str, verification_code: str) -> Dict[str, Any]:
    """
    Send verification email using Resend and Jinja2 template.
    """
    html_content = render_template(
        "email_verification.html", {"verification_code": verification_code}
    )

    params: resend.Emails.SendParams = {
        "from": settings.EMAIL_FROM,
        "to": [email_to],
        "subject": "Verify your CityHunter email",
        "html": html_content,
    }

    try:
        response = resend.Emails.send(params)
        return response
    except Exception as e:
        print(f"Error sending email: {e}")
        raise e
