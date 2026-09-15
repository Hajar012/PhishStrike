import os
import requests

from app.services.risk_assessment import calculate_risk_score


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
        breaches = response.json()
        risk_assessment = calculate_risk_score(breaches)
        
        return {
            "status": "found",
            "breaches": breaches,
            "risk": risk_assessment
        }

    if response.status_code == 404:
        risk_assessment = calculate_risk_score([])
        
        return {
            "status": "not_found",
            "breaches": [],
            "risk": risk_assessment
        }

    response.raise_for_status()