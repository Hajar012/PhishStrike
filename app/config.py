import os


class Config:
    HIBP_API_KEY = os.getenv("HIBP_API_KEY", "")