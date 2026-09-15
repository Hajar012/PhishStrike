"""Lightweight self-check for the phishing analyzer.

Run with:  python tests/test_phishing_analyzer.py
No test framework required.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.phishing_analyzer import analyze_email, MAX_CONTENT_LENGTH


NORMAL = (
    "From: colleague@company.com\n"
    "Subject: Meeting notes\n\n"
    "Hi Sara, here are the notes from today's meeting. "
    "Let me know if anything is missing. Thanks."
)

PHISH = (
    "From: Security Team <alerts@gmail.com>\n"
    "Reply-To: hacker@evil.ru\n"
    "Subject: URGENT!! Your account has been suspended\n\n"
    "Dear customer, your account will be closed due to unauthorized access. "
    "You must verify your account immediately and confirm your password at "
    "http://192.168.10.5/login within 24 hours or legal action will follow."
)


def ids(result):
    return {item["id"] for item in result["indicators"]}


def test_normal_email_is_safe():
    result = analyze_email(NORMAL)
    assert result["level"] == "safe", result
    assert result["indicator_count"] == 0, result
    assert result["score"] == 0, result


def test_obvious_phishing_is_critical():
    result = analyze_email(PHISH)
    assert result["level"] in ("high", "critical"), result
    assert result["score"] >= 61, result
    assert "credential_request" in ids(result)
    assert "ip_link" in ids(result)
    assert "urgency" in ids(result)
    assert result["recommendations"], result


def test_urgency_detected():
    result = analyze_email("Please act now, this is urgent!")
    assert "urgency" in ids(result)


def test_credential_request_detected():
    result = analyze_email("Please confirm your password to continue.")
    assert "credential_request" in ids(result)


def test_threatening_language_detected():
    result = analyze_email("Your account will be deactivated unless you reply.")
    assert "threat" in ids(result)


def test_arabic_content_detected():
    result = analyze_email(
        "عزيزي العميل، حسابك موقوف. تحقق من حسابك فوراً "
        "وأدخل كلمة المرور عبر http://bit.ly/abc لتفادي إغلاق الحساب."
    )
    assert "credential_request" in ids(result)
    assert "urgency" in ids(result)
    assert result["level"] in ("medium", "high", "critical"), result


def test_suspicious_sender_detected():
    result = analyze_email("From: PayPal <support@gmail.com>\nVerify your account.")
    assert "suspicious_sender" in ids(result)


def test_english_and_arabic_fields_present():
    result = analyze_email(PHISH)
    for item in result["indicators"]:
        assert item["title"]["en"] and item["title"]["ar"]
        assert item["explanation"]["en"] and item["explanation"]["ar"]


def test_deterministic():
    first = analyze_email(PHISH)
    second = analyze_email(PHISH)
    assert first["score"] == second["score"]
    assert first["level"] == second["level"]


def test_empty_input_rejected():
    for bad in ("", "   "):
        try:
            analyze_email(bad)
            assert False, "expected ValueError for empty input"
        except ValueError:
            pass


def test_long_input_rejected():
    try:
        analyze_email("a" * (MAX_CONTENT_LENGTH + 1))
        assert False, "expected ValueError for long input"
    except ValueError:
        pass


def main():
    tests = [value for name, value in sorted(globals().items())
             if name.startswith("test_") and callable(value)]
    for test in tests:
        test()
        print(f"PASS  {test.__name__}")
    print(f"\n{len(tests)} checks passed.")


if __name__ == "__main__":
    main()
