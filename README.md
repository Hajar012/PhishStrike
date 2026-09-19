# PHISHSTRIKE

A bilingual web-based security toolkit for checking email breach exposure, analyzing potentially suspicious email content, and evaluating URLs using deterministic security rules.

PhishStrike was developed as a university graduation project with a focus on practical security awareness and clear, explainable results.

## Features

- Email Breach Checker using the Have I Been Pwned (HIBP) API
- Rule-based Phishing Analyzer for email content
- URL Checker using deterministic URL analysis
- Shared risk assessment from Safe to Critical
- Security awareness quiz
- English and Arabic interface with RTL support
- Responsive design for desktop, tablet, and mobile
- Sound notifications for detected risks/breaches
- Client-side sanitization for externally returned HTML
- No database or persistent storage of scanned content

## Technology Stack

- Python
- Flask
- HTML5
- CSS3
- JavaScript
- Have I Been Pwned API
- pytest / JavaScript test scripts

## Project Structure

```text
PhishStrike/
├── app/
│   ├── routes/
│   ├── services/
│   ├── config.py
│   └── ...
├── static/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── audio/
├── templates/
├── tests/
├── run.py
├── requirements.txt
├── .env.example
└── README.md
```

## Risk Assessment

PhishStrike uses a shared 0–100 risk scale:

| Score | Level |
|---|---|
| 0–20 | Safe |
| 21–40 | Low |
| 41–60 | Medium |
| 61–80 | High |
| 81–100 | Critical |

The same risk-level criteria are used across the Email Scanner, Phishing Analyzer, and URL Checker.

## Security

- HIBP API credentials are kept server-side through environment variables.
- `.env` files are excluded from version control.
- User-provided content is escaped/sanitized before being inserted into the page.
- URLs are analyzed as text and are not opened or fetched by the application.
- Flask debug mode is disabled by default.
- No scanned email or URL data is stored in a database.

## Running Locally

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file based on `.env.example` and provide the required configuration, including the HIBP API key.

### 4. Run the application

```bash
python run.py
```

Then open the local address shown by Flask in your browser.

## Testing

The project includes tests for:

- Risk assessment
- Phishing analysis
- URL analysis
- Quiz scoring
- HTML sanitization

Run the project's existing test commands from the repository environment.

## Current Project Status

The main application features, bilingual interface, security hardening, responsive design, sound notifications, and code cleanup have been implemented and tested.

The following remain outside the completed implementation:

- Arabic translation of HIBP's externally provided breach descriptions
- Production deployment
- Final documentation/SRS updates

## Note

PhishStrike is an educational project and its results should be treated as security-awareness guidance rather than a complete security assessment.
