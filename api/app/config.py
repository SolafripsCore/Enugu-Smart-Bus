from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Enugu Smart Bus API"
    database_url: str = "sqlite:///./esb.db"
    jwt_secret: str = "insecure-development-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24 * 7
    cors_origins: str = "*"
    site_url: str = "https://enugusmartbus.com"
    resend_api_key: str = ""
    mail_from: str = "Enugu Smart Bus <onboarding@resend.dev>"
    contact_email: str = "support@enugusmartbus.com"
    # Comma separated phone numbers granted administrator access on sign-in.
    admin_phones: str = ""

    # Phone verification
    default_country_code: str = "234"
    otp_length: int = 6
    otp_minutes: int = 10
    otp_resend_seconds: int = 60
    otp_max_attempts: int = 5
    verification_token_minutes: int = 15
    pin_length: int = 4
    pin_max_attempts: int = 5
    pin_lockout_minutes: int = 15
    # Without an SMS provider the OTP is returned by the API so the flow can
    # still be completed end to end (development and pre-launch previews).
    expose_otp: bool = True

    # Payments (Paystack)
    paystack_secret_key: str = ""
    paystack_public_key: str = ""
    # Where Paystack returns the rider after checkout.
    paystack_callback_path: str = "/account"
    min_top_up: int = 100
    max_top_up: int = 500_000

    # SMS providers (first configured one wins)
    termii_api_key: str = ""
    termii_sender_id: str = "ESBus"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
