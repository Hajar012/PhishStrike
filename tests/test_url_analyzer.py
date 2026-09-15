"""Lightweight self-check for the suspicious URL analyzer.

Run with:  python tests/test_url_analyzer.py
No test framework required.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.url_analyzer import analyze_url, MAX_URL_LENGTH


def ids(result):
    return {item["id"] for item in result["indicators"]}


def test_normal_https_url_is_safe():
    result = analyze_url("https://www.example.com/products/list")
    assert result["level"] == "safe", result
    assert result["score"] == 0, result
    assert result["indicator_count"] == 0, result


def test_http_flagged():
    result = analyze_url("http://example.com/login")
    assert "no_https" in ids(result)
    assert result["level"] != "safe", result


def test_ip_based_url_flagged():
    result = analyze_url("http://192.168.10.5/login")
    assert "ip_address" in ids(result)
    assert result["level"] in ("medium", "high", "critical"), result


def test_shortener_flagged():
    result = analyze_url("https://bit.ly/abc123")
    assert "shortener" in ids(result)


def test_suspicious_tld_flagged():
    result = analyze_url("https://example.top/download")
    assert "suspicious_tld" in ids(result)


def test_brand_in_subdomain_flagged():
    result = analyze_url("https://paypal.secure-login.xyz/verify")
    assert "brand_in_subdomain" in ids(result)
    assert result["level"] in ("medium", "high", "critical"), result


def test_userinfo_at_sign_flagged():
    result = analyze_url("https://user@evil.example.com/")
    assert "userinfo_trick" in ids(result)


def test_punycode_flagged():
    result = analyze_url("https://xn--paypal-9d4b.com/")
    assert "punycode" in ids(result)


def test_encoded_characters_flagged():
    result = analyze_url("https://example.com/a%20b%2Fc%3Fd")
    assert "encoded_chars" in ids(result)


def test_long_url_flagged():
    result = analyze_url("https://example.com/" + "a" * 120)
    assert "long_url" in ids(result)


def test_many_params_flagged():
    result = analyze_url("https://example.com/p?a=1&b=2&c=3&d=4")
    assert "many_params" in ids(result)


def test_many_subdomains_flagged():
    result = analyze_url("https://a.b.c.example.com/x")
    assert "many_subdomains" in ids(result)


def test_dangerous_scheme_is_critical():
    result = analyze_url("javascript:alert(1)")
    assert "dangerous_scheme" in ids(result)
    assert result["level"] == "critical", result


def test_english_and_arabic_fields_present():
    result = analyze_url("http://192.168.10.5/login")
    for item in result["indicators"]:
        assert item["title"]["en"] and item["title"]["ar"]
        assert item["explanation"]["en"] and item["explanation"]["ar"]


def test_deterministic():
    first = analyze_url("http://paypal.secure-login.xyz/verify")
    second = analyze_url("http://paypal.secure-login.xyz/verify")
    assert first["score"] == second["score"]
    assert first["level"] == second["level"]


def test_invalid_input_rejected():
    for bad in ("", "   ", "not a url", "http://", "https://"):
        try:
            analyze_url(bad)
            assert False, f"expected ValueError for {bad!r}"
        except ValueError:
            pass


def test_too_long_rejected():
    try:
        analyze_url("https://example.com/" + "a" * (MAX_URL_LENGTH + 1))
        assert False, "expected ValueError for long url"
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
