import os
import requests


HIBP_URL = "https://haveibeenpwned.com/api/v3/breachedaccount"


def check_email_breach(email):
    api_key = os.getenv("HIBP_API_KEY")

    headers = {
        "hibp-api-key": api_key,
        "user-agent": "PhishStrike"
    }

    params = {
        "truncateResponse": "false"
    }

    response = requests.get(
        f"{HIBP_URL}/{email}",
        headers=headers,
        params=params,
        timeout=10
    )

    if response.status_code == 200:
        return {
            "status": "found",
            "breaches": response.json()
        }

    if response.status_code == 404:
        return {
            "status": "not_found",
            "breaches": []
        }

    response.raise_for_status()