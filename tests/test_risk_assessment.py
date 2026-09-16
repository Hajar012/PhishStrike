"""Lightweight self-check for the SRS risk engine.

Run with:  python tests/test_risk_assessment.py
No test framework required.
"""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.risk_assessment import calculate_risk_score, determine_risk_level


def test_threshold_boundaries():
    assert determine_risk_level(0) == "safe"
    assert determine_risk_level(20) == "safe"
    assert determine_risk_level(21) == "low"
    assert determine_risk_level(40) == "low"
    assert determine_risk_level(41) == "medium"
    assert determine_risk_level(60) == "medium"
    assert determine_risk_level(61) == "high"
    assert determine_risk_level(80) == "high"
    assert determine_risk_level(81) == "critical"
    assert determine_risk_level(100) == "critical"


def test_no_breaches_is_safe_zero():
    result = calculate_risk_score([])
    assert result["score"] == 0, result
    assert result["level"] == "safe", result


def test_score_matches_level():
    breaches = [{
        "BreachDate": "2020-01-01",
        "DataClasses": ["Email addresses", "Passwords"],
        "PwnCount": 50000,
    }]
    result = calculate_risk_score(breaches)
    assert 0 <= result["score"] <= 100, result
    assert result["level"] == determine_risk_level(result["score"]), result


def test_deterministic():
    breaches = [
        {
            "BreachDate": "2023-06-01",
            "DataClasses": ["Email addresses", "Passwords", "Phone numbers"],
            "PwnCount": 120000,
        },
        {
            "BreachDate": "2015-02-10",
            "DataClasses": ["Email addresses"],
            "PwnCount": 900,
        },
    ]
    first = calculate_risk_score(breaches)
    second = calculate_risk_score(breaches)
    assert first == second, (first, second)


def main():
    tests = [value for name, value in sorted(globals().items())
             if name.startswith("test_") and callable(value)]
    for test in tests:
        test()
        print(f"PASS  {test.__name__}")
    print(f"\n{len(tests)} checks passed.")


if __name__ == "__main__":
    main()
