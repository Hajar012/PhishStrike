import os


class Config:
    HIBP_API_KEY = os.getenv("HIBP_API_KEY", "")
    MAX_EMAIL_LENGTH = 254
    RATELIMIT_DEFAULT = "30 per minute"