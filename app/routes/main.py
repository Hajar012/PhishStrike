from flask import Blueprint, render_template, request, jsonify

from app.utils.validators import is_valid_email
from app.services.hibp_service import check_email_breach
from app.services.phishing_analyzer import analyze_email, MAX_CONTENT_LENGTH


main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("index.html")


@main.route("/phishing")
def phishing_analyzer():
    return render_template("phishing.html")


@main.route("/api/check", methods=["POST"])
def check_email():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip()

    if not is_valid_email(email):
        return jsonify({
            "success": False,
            "error": "Please enter a valid email address."
        }), 400

    result = check_email_breach(email)

    return jsonify(result)


@main.route("/api/phishing", methods=["POST"])
def analyze_phishing():
    data = request.get_json(silent=True) or {}

    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({
            "success": False,
            "error": "Please provide email content to analyze."
        }), 400

    if len(content) > MAX_CONTENT_LENGTH:
        return jsonify({
            "success": False,
            "error": f"Email content must be under {MAX_CONTENT_LENGTH} characters."
        }), 400

    return jsonify(analyze_email(content))