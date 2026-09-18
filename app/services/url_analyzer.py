import re
from typing import Any, Dict, List, Tuple
from urllib.parse import urlsplit, parse_qs

from app.services.risk_assessment import determine_risk_level
from app.services.phishing_analyzer import (
    SUSPICIOUS_TLDS, IP_HOST, SHORTENERS, BRAND_WORDS, _text, _severity,
)


MAX_URL_LENGTH = 2048

DANGEROUS_SCHEMES = ("javascript:", "data:", "vbscript:", "file:")

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "sign-in", "verify", "secure", "account",
    "update", "confirm", "bank", "password", "wallet", "billing",
    "recover", "unlock",
]

ENCODED_CHAR = re.compile(r"%[0-9a-fA-F]{2}")


def _indicator(
    id: str, weight: int,
    title_en: str, title_ar: str,
    exp_en: str, exp_ar: str,
    matches: List[str],
) -> Dict[str, Any]:
    return {
        "id": id,
        "weight": weight,
        "severity": _severity(weight),
        "title": _text(title_en, title_ar),
        "explanation": _text(exp_en, exp_ar),
        "matches": matches[:4],
    }


def _parse(raw: str) -> Tuple[str, Any, bool]:
    if not raw:
        raise ValueError("empty url")
    if len(raw) > MAX_URL_LENGTH:
        raise ValueError("url too long")
    if re.search(r"\s", raw):
        raise ValueError("url contains whitespace")

    scheme_explicit = bool(re.match(r"^[a-z][a-z0-9+.-]*:", raw, re.IGNORECASE))
    candidate = raw if scheme_explicit else "https://" + raw

    try:
        parts = urlsplit(candidate)
    except ValueError:
        raise ValueError("url could not be parsed")

    host = (parts.hostname or "").lower()

    if not host:
        raise ValueError("url has no host")
    if "." not in host and not IP_HOST.match(host):
        raise ValueError("url host is not a domain")

    return host, parts, scheme_explicit


def _check_dangerous_scheme(url: str) -> List[Dict[str, Any]]:
    lowered = url.strip().lower()
    for scheme in DANGEROUS_SCHEMES:
        if lowered.startswith(scheme):
            return [_indicator(
                "dangerous_scheme", 85,
                "Dangerous link scheme", "مخطط رابط خطير",
                f"This is not a normal web link. A '{scheme}' link can run or embed content instead of opening a page.",
                f"هذا ليس رابط ويب عادياً. رابط من نوع '{scheme}' قد ينفّذ أو يضمّن محتوى بدل فتح صفحة.",
                [url],
            )]
    return []


def analyze_url(url: str) -> Dict[str, Any]:
    raw = (url or "").strip()

    dangerous = _check_dangerous_scheme(raw)
    if dangerous:
        score = min(100, dangerous[0]["weight"])
        level = determine_risk_level(score)
        return {
            "success": True,
            "status": "analyzed",
            "url": raw,
            "score": score,
            "level": level,
            "indicator_count": 1,
            "indicators": dangerous,
            "recommendations": RECOMMENDATIONS[level],
        }

    host, parts, scheme_explicit = _parse(raw)

    path = parts.path or ""
    query = parts.query or ""
    searchable = (host + path + "?" + query).lower()
    labels = host.split(".")
    registered = ".".join(labels[-2:])

    indicators: List[Dict[str, Any]] = []

    if scheme_explicit and parts.scheme.lower() == "http":
        indicators.append(_indicator(
            "no_https", 15,
            "Connection is not encrypted", "الاتصال غير مشفّر",
            "The link uses plain HTTP. Any data you enter can be read in transit.",
            "الرابط يستخدم HTTP غير المشفّر. أي بيانات تُدخلها يمكن قراءتها أثناء النقل.",
            [parts.scheme + "://"],
        ))

    if IP_HOST.match(host):
        indicators.append(_indicator(
            "ip_address", 30,
            "Address is a raw IP", "العنوان هو IP مباشر",
            "Legitimate websites use domain names, not numeric IP addresses.",
            "المواقع الشرعية تستخدم أسماء نطاقات، وليس عناوين IP رقمية.",
            [host],
        ))

    if parts.username is not None or "@" in parts.netloc:
        indicators.append(_indicator(
            "userinfo_trick", 25,
            "Hidden text before the @ sign", "نص مخفي قبل علامة @",
            "Everything before '@' is ignored by the browser, so the real destination is not what it appears to be.",
            "كل ما قبل '@' يتجاهله المتصفح، لذا الوجهة الحقيقية ليست كما تبدو.",
            [parts.netloc],
        ))

    if host.startswith("xn--") or ".xn--" in host:
        indicators.append(_indicator(
            "punycode", 25,
            "Look-alike (punycode) domain", "نطاق مشابه (punycode)",
            "The domain uses encoded characters that can imitate another brand's name.",
            "يستخدم النطاق أحرفاً مُرمّزة قد تحاكي اسم علامة تجارية أخرى.",
            [host],
        ))

    if host in SHORTENERS:
        indicators.append(_indicator(
            "shortener", 15,
            "Shortened link", "رابط مختصر",
            "The real destination is hidden behind a link-shortening service.",
            "الوجهة الحقيقية مخفية خلف خدمة اختصار الروابط.",
            [host],
        ))

    if any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
        indicators.append(_indicator(
            "suspicious_tld", 15,
            "Suspicious domain ending", "امتداد نطاق مشبوه",
            "This domain extension is frequently abused for phishing and scams.",
            "امتداد النطاق هذا يُستغل كثيراً في التصيّد والاحتيال.",
            [host],
        ))

    try:
        port = parts.port
    except ValueError:
        port = None

    if port not in (None, 80, 443):
        indicators.append(_indicator(
            "nonstandard_port", 12,
            "Unusual network port", "منفذ شبكة غير معتاد",
            f"The link connects to port {port}, which websites rarely use.",
            f"يتصل الرابط بالمنفذ {port}، وهو منفذ نادراً ما تستخدمه المواقع.",
            [f":{port}"],
        ))

    if not IP_HOST.match(host) and len(labels) >= 4:
        indicators.append(_indicator(
            "many_subdomains", 12,
            "Excessive subdomains", "نطاقات فرعية مفرطة",
            "Long chains of subdomains are often used to look trustworthy or hide the real domain.",
            "سلاسل النطاقات الفرعية الطويلة تُستخدم غالباً لإيهام الثقة أو إخفاء النطاق الحقيقي.",
            [host],
        ))

    encoded_matches = ENCODED_CHAR.findall(raw)
    if len(encoded_matches) >= 2:
        indicators.append(_indicator(
            "encoded_chars", 20,
            "Encoded / obfuscated characters", "أحرف مُرمّزة أو مموّهة",
            "Repeated percent-encoding is used to disguise the address and evade filters.",
            "تكرار ترميز النسبة المئوية يُستخدم لتمويه العنوان وتجاوز الفلاتر.",
            encoded_matches[:4],
        ))

    if len(raw) >= 100:
        length_weight = 15
    elif len(raw) >= 60:
        length_weight = 8
    else:
        length_weight = 0

    if length_weight:
        indicators.append(_indicator(
            "long_url", length_weight,
            "Unusually long URL", "رابط طويل بشكل غير معتاد",
            "Very long links can hide the true destination from the eye.",
            "الروابط الطويلة جداً قد تخفي الوجهة الحقيقية عن النظر.",
            [f"{len(raw)} characters"],
        ))

    param_count = len(parse_qs(query))
    if param_count >= 4:
        indicators.append(_indicator(
            "many_params", 12,
            "Excessive query parameters", "معاملات استعلام مفرطة",
            "A large number of parameters can indicate tracking, redirects, or obfuscation.",
            "العدد الكبير من المعاملات قد يشير إلى تتبع أو إعادة توجيه أو تمويه.",
            [f"{param_count} parameters"],
        ))

    keyword_matches = [kw for kw in SUSPICIOUS_KEYWORDS if kw in searchable][:4]
    if keyword_matches:
        indicators.append(_indicator(
            "suspicious_keywords", 15,
            "Sensitive keywords in the link", "كلمات حساسة في الرابط",
            "Words like login, verify, or password are used to make the link look official.",
            "كلمات مثل تسجيل الدخول أو التحقق أو كلمة المرور تُستخدم لجعل الرابط يبدو رسمياً.",
            keyword_matches,
        ))

    brand_matches = [b for b in BRAND_WORDS if b in host and b not in registered][:4]
    if brand_matches:
        indicators.append(_indicator(
            "brand_in_subdomain", 25,
            "Brand name in the wrong place", "اسم علامة تجارية في موضع خاطئ",
            "A brand name appears where it does not own the domain — a common impersonation trick.",
            "يظهر اسم علامة تجارية في موضع لا يملك فيه النطاق — وهو أسلوب انتحال شائع.",
            brand_matches + [host],
        ))

    obfuscated = []
    if "_" in host:
        obfuscated.append(host)
    if host.count("-") >= 3:
        obfuscated.append(host)
    if "\\" in path or ".." in path:
        obfuscated.append(path)
    if obfuscated:
        indicators.append(_indicator(
            "obfuscated_chars", 10,
            "Unusual characters", "أحرف غير معتادة",
            "Underscores, repeated hyphens, or path tricks can hide the real structure of the link.",
            "الشرطات السفلية أو الشرطات المتكررة أو حيل المسار قد تخفي البنية الحقيقية للرابط.",
            obfuscated,
        ))

    indicators.sort(key=lambda item: item["weight"], reverse=True)

    score = min(100, sum(item["weight"] for item in indicators))
    level = determine_risk_level(score)

    return {
        "success": True,
        "status": "analyzed",
        "url": raw,
        "score": score,
        "level": level,
        "indicator_count": len(indicators),
        "indicators": indicators,
        "recommendations": RECOMMENDATIONS[level],
    }


RECOMMENDATIONS = {
    "safe": [
        _text("No suspicious traits were found, but links can still change.",
              "لم يتم العثور على سمات مشبوهة، لكن الروابط قد تتغير."),
        _text("Type the official domain yourself instead of trusting a link.",
              "اكتب النطاق الرسمي بنفسك بدلاً من الوثوق برابط."),
    ],
    "low": [
        _text("Be careful before entering any personal information.",
              "كن حذراً قبل إدخال أي معلومات شخصية."),
        _text("Confirm the domain matches the official website.",
              "تأكد من أن النطاق يطابق الموقع الرسمي."),
    ],
    "medium": [
        _text("Avoid entering credentials or payment details on this link.",
              "تجنّب إدخال بيانات الدخول أو الدفع عبر هذا الرابط."),
        _text("Reach the service through its official app or a trusted bookmark.",
              "ادخل إلى الخدمة عبر تطبيقها الرسمي أو إشارة مرجعية موثوقة."),
    ],
    "high": [
        _text("Do not open this link. It shows multiple phishing traits.",
              "لا تفتح هذا الرابط. فهو يُظهر عدة سمات تصيّد."),
        _text("If you must reach the site, type the official address manually.",
              "إذا لزم الوصول إلى الموقع، اكتب العنوان الرسمي يدوياً."),
        _text("If you already entered data, change your passwords immediately.",
              "إذا أدخلت بيانات بالفعل، غيّر كلمات المرور فوراً."),
    ],
    "critical": [
        _text("This link is highly dangerous. Do not open it.",
              "هذا الرابط خطير جداً. لا تفتحه."),
        _text("Report the message containing it and delete it.",
              "أبلغ عن الرسالة التي تحتويه واحذفها."),
        _text("If you interacted with it, change your passwords and enable two-factor authentication.",
              "إذا تفاعلت معه، غيّر كلمات المرور وفعّل المصادقة الثنائية."),
    ],
}
