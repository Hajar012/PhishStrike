from flask import Flask, jsonify
from dotenv import load_dotenv
from pathlib import Path
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["30 per minute"]
)


def create_app():
    load_dotenv()

    base_dir = Path(__file__).resolve().parent.parent

    app = Flask(
        __name__,
        template_folder=str(base_dir / "templates"),
        static_folder=str(base_dir / "static")
    )

    app.config.from_object("app.config.Config")

    limiter.init_app(app)

    from app.routes.main import main
    app.register_blueprint(main)

    @app.errorhandler(429)
    def rate_limit_error(error):
        return jsonify({
            "error": "Too many requests. Please try again later."
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Something went wrong. Please try again."
        }), 500

    return app