from flask import Blueprint, render_template, request, jsonify

from app.utils.validators import is_valid_email
from app.services.hibp_service import check_email_breach


main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("index.html")


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