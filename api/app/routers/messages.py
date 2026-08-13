from fastapi import APIRouter
from sqlmodel import select

from app.deps import SessionDep
from app.email import send_contact_notification, send_newsletter_welcome
from app.models import ContactMessage, NewsletterSubscriber
from app.schemas import ContactRequest, MessageResponse, NewsletterRequest

router = APIRouter(tags=["messages"])


@router.post("/contact", response_model=MessageResponse)
def contact(payload: ContactRequest, session: SessionDep) -> MessageResponse:
    entry = ContactMessage(
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone,
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    session.add(entry)
    session.commit()

    send_contact_notification(
        entry.name, entry.email, entry.phone, entry.subject, entry.message
    )

    return MessageResponse(
        message="Thanks for reaching out — our team will get back to you shortly."
    )


@router.post("/newsletter", response_model=MessageResponse)
def newsletter(payload: NewsletterRequest, session: SessionDep) -> MessageResponse:
    email = payload.email.lower()
    message = "You're subscribed. Watch your inbox for route and fare updates."

    existing = session.exec(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    ).first()
    if existing is not None:
        return MessageResponse(message=message)

    session.add(NewsletterSubscriber(email=email))
    session.commit()

    send_newsletter_welcome(email)

    return MessageResponse(message=message)
