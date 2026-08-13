from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Enugu Smart Bus API"
    database_url: str = "sqlite:///./esb.db"
    jwt_secret: str = "insecure-development-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24 * 7
    reset_token_minutes: int = 30
    cors_origins: str = "*"
    site_url: str = "https://enugu-smart-bus-psi.vercel.app"
    resend_api_key: str = ""
    mail_from: str = "Enugu Smart Bus <onboarding@resend.dev>"
    contact_email: str = "support@enugusmartbus.com"
    # Without a transactional email provider the reset token is returned by the
    # API so the flow can still be completed from the web app.
    expose_reset_token: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
