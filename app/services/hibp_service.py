import os
import requests
from urllib.parse import quote


HIBP_BASE_URL = "https://haveibeenpwned.com/api/v3"


def check_email_breach(email: str):
    api_key = os.getenv("HIBP_API_KEY")

    if not api_key:
        return {
            "success": False,
            "status": "configuration_error",
            "message": "HIBP API key is not configured."
        }

    encoded_email = quote(email, safe="")

    url = f"{HIBP_BASE_URL}/breachedaccount/{encoded_email}"

    headers = {
        "hibp-api-key": api_key,
        "user-agent": "PhishStrike"
    }

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            return {
                "success": True,
                "status": "found",
                "breaches": response.json()
            }

        if response.status_code == 404:
            return {
                "success": True,
                "status": "not_found",
                "breaches": []
            }

        if response.status_code == 401:
            return {
                "success": False,
                "status": "unauthorized",
                "message": "HIBP API key is invalid."
            }

        if response.status_code == 403:
            return {
                "success": False,
                "status": "forbidden",
                "message": "HIBP access was denied."
            }

        if response.status_code == 429:
            return {
                "success": False,
                "status": "rate_limited",
                "message": "Too many requests. Please try again later."
            }

        if response.status_code == 503:
            return {
                "success": False,
                "status": "unavailable",
                "message": "HIBP is temporarily unavailable."
            }

        return {
            "success": False,
            "status": "api_error",
            "message": "The breach service could not complete the request."
        }

    except requests.Timeout:
        return {
            "success": False,
            "status": "timeout",
            "message": "The breach service took too long to respond."
        }

    except requests.RequestException:
        return {
            "success": False,
            "status": "connection_error",
            "message": "Could not connect to the breach service."
        }