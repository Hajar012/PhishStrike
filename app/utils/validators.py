import re


EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$"
)


def is_valid_email(email: str) -> bool:
    if not email:
        return False

    email = email.strip()

    if len(email) > 254:
        return False

    return bool(EMAIL_PATTERN.fullmatch(email))