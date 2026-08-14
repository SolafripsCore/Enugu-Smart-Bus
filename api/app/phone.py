"""Normalisation of Nigerian (and international) mobile numbers to E.164."""

import re

from app.config import get_settings

settings = get_settings()

DIGITS = re.compile(r"\D+")


class InvalidPhoneNumber(ValueError):
    pass


def normalize_phone(raw: str) -> str:
    """Return the number as +<country><subscriber>.

    Accepts the shapes Nigerians actually type: 0803..., 803..., 234803...,
    +234 803 ... and international numbers already in E.164.
    """
    value = (raw or "").strip()
    international = value.startswith("+")
    digits = DIGITS.sub("", value)
    country = settings.default_country_code

    if not digits:
        raise InvalidPhoneNumber("Enter your phone number.")

    if digits.startswith(country):
        # Drop the national trunk prefix people keep when typing +234 0803...
        subscriber = digits[len(country) :].removeprefix("0")
    elif international:
        if len(digits) < 8 or len(digits) > 15:
            raise InvalidPhoneNumber("Enter a valid phone number.")
        return f"+{digits}"
    elif digits.startswith("0"):
        subscriber = digits[1:]
    else:
        subscriber = digits

    if country == "234" and not re.fullmatch(r"[789]\d{9}", subscriber):
        raise InvalidPhoneNumber(
            "Enter a valid Nigerian mobile number, e.g. 0803 000 0000."
        )
    if len(subscriber) < 8 or len(subscriber) > 12:
        raise InvalidPhoneNumber("Enter a valid phone number.")

    return f"+{country}{subscriber}"


def mask_phone(phone: str) -> str:
    """+2348031234567 -> +234 803 *** 4567"""
    if len(phone) < 8:
        return phone
    return f"{phone[:7]} *** {phone[-4:]}"
