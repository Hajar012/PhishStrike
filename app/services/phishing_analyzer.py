import re
from typing import Any, Dict, List
from urllib.parse import urlsplit

from app.services.risk_assessment import determine_risk_level


MAX_CONTENT_LENGTH = 5000

URL_PATTERN = re.compile(r"https?://[^\s<>\"')]+", re.IGNORECASE)

IP_HOST = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "ow.ly",
    "buff.ly", "adf.ly", "cutt.ly", "rb.gy", "shorturl.at", "rebrand.ly",
}

SUSPICIOUS_TLDS = {
    ".zip", ".mov", ".xyz", ".top", ".click", ".link", ".gq", ".tk",
    ".cf", ".ml", ".work", ".country", ".kim", ".loan", ".men",
    ".review", ".stream", ".download", ".racing", ".party", ".science",
    ".gdn", ".bid",
}

FREE_MAIL = {
    "gmail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com", "outlook.com",
    "live.com", "aol.com", "proton.me", "protonmail.com", "gmx.com",
    "mail.com", "yandex.com", "icloud.com", "msn.com", "zoho.com",
    "tutanota.com",
}

BRAND_WORDS = [
    "paypal", "microsoft", "apple", "google", "amazon", "netflix", "bank",
    "instagram", "facebook", "whatsapp", "dhl", "fedex", "ups", "irs",
    "government", "بنك", "باي بال",
]

SUSPICIOUS_EXTENSIONS = re.compile(
    r"\.(exe|scr|bat|cmd|js|vbs|jar|ps1|msi|hta|iso|img|docm|xlsm|pptm|rar|7z)\b",
    re.IGNORECASE,
)


def _text(en: str, ar: str) -> Dict[str, str]:
    return {"en": en, "ar": ar}


PATTERN_RULES = [
    {
        "id": "urgency",
        "weight": 15,
        "patterns": [
            r"\burgent\b", r"\bimmediately\b", r"\bact now\b", r"\bright away\b",
            r"within \d+ (hours|minutes|days)", r"final (notice|warning|reminder)",
            r"\bexpires? (today|soon)\b", r"limited time",
            r"عاجل", r"فورا|فوراً", r"خلال \d+ (ساعة|ساعات|يوم|أيام)",
            r"تحذير أخير", r"آخر فرصة",
        ],
        "title": _text("Urgency / pressure tactics", "أساليب إلحاح وضغط"),
        "explanation": _text(
            "The message pushes you to act quickly, a common trick to stop you from thinking or verifying.",
            "الرسالة تدفعك للتصرف بسرعة، وهو أسلوب شائع لمنعك من التفكير أو التحقق.",
        ),
    },
    {
        "id": "threat",
        "weight": 20,
        "patterns": [
            r"account (has been |will be )?(suspended|locked|closed|deactivated|disabled)",
            r"\bunauthorized\b", r"legal action", r"\bsuspend(ed|ing)?\b",
            r"permanently (closed|deleted)", r"avoid (account )?(closure|suspension)",
            r"تم (إيقاف|إغلاق|تعليق)", r"سيتم (إغلاق|حذف)", r"نشاط غير مصرح به",
            r"إجراء قانوني", r"حسابك (مقفل|موقوف)",
        ],
        "title": _text("Threatening language", "لغة تهديدية"),
        "explanation": _text(
            "The message threatens account loss or legal trouble to scare you into complying.",
            "الرسالة تهدد بفقدان الحساب أو مساءلة قانونية لدفعك للانصياع.",
        ),
    },
    {
        "id": "credential_request",
        "weight": 30,
        "patterns": [
            r"\bpassword\b", r"\busername\b", r"\blog ?in\b", r"\bsign ?in\b",
            r"verify your (account|identity|details)",
            r"confirm your (account|identity|password|details)",
            r"update your (account|password|details)",
            r"\bone[- ]time (code|password)\b", r"\botp\b", r"\bpin\b",
            r"كلمة المرور", r"اسم المستخدم", r"تسجيل الدخول",
            r"تحقق من (حسابك|هويتك)", r"تأكيد (حسابك|بياناتك)",
            r"رمز التحقق", r"رقم سري",
        ],
        "title": _text("Requests credentials or login", "يطلب بيانات دخول"),
        "explanation": _text(
            "Legitimate services never ask you to send or confirm passwords, codes, or login details by email.",
            "الخدمات الموثوقة لا تطلب منك إرسال أو تأكيد كلمات المرور أو الرموز أو بيانات الدخول عبر البريد.",
        ),
    },
    {
        "id": "sensitive_info_request",
        "weight": 30,
        "patterns": [
            r"credit card", r"\bcvv\b", r"social security", r"\bssn\b",
            r"bank account", r"date of birth", r"card number",
            r"بطاقة (الائتمان|البنك)", r"رقم البطاقة", r"الحساب البنكي",
            r"الرقم السري للبطاقة", r"تاريخ الميلاد",
        ],
        "title": _text("Requests sensitive information", "يطلب معلومات حساسة"),
        "explanation": _text(
            "The email asks for highly sensitive personal or financial data that should never be shared by email.",
            "البريد يطلب بيانات شخصية أو مالية شديدة الحساسية لا يجب مشاركتها عبر البريد أبداً.",
        ),
    },
    {
        "id": "reward",
        "weight": 15,
        "patterns": [
            r"you (have )?won", r"\bcongratulations\b", r"\bprize\b", r"\blottery\b",
            r"free gift", r"claim your", r"\brefund\b", r"cash bonus",
            r"لقد فزت", r"مبروك", r"جائزة", r"هدية مجانية", r"استرداد",
            r"مكافأة نقدية", r"مليون",
        ],
        "title": _text("Too-good-to-be-true reward", "عرض مغرٍ يصعب تصديقه"),
        "explanation": _text(
            "Unexpected prizes or money are classic bait to make you click without checking.",
            "الجوائز أو الأموال غير المتوقعة طُعم كلاسيكي لجعلك تنقر دون تفكير.",
        ),
    },
    {
        "id": "generic_greeting",
        "weight": 8,
        "patterns": [
            r"dear (customer|user|client|member|sir|madam|sir/madam|valued)",
            r"عزيزي العميل", r"عزيزي المستخدم", r"عميلنا العزيز", r"السيد المحترم",
        ],
        "title": _text("Generic greeting", "تحية عامة"),
        "explanation": _text(
            "A generic greeting instead of your name suggests a bulk, impersonal message.",
            "تحية عامة بدل اسمك تشير إلى رسالة جماعية غير موجهة لك شخصياً.",
        ),
    },
    {
        "id": "attachment",
        "weight": 12,
        "patterns": [
            r"attach(ed|ment)", r"open the (attached|file)",
            r"download (using the )?(link|attachment)",
            r"مرفق", r"افتح الملف", r"قم بتحميل المرفق",
        ],
        "title": _text("Mentions an attachment", "يذكر مرفقاً"),
        "explanation": _text(
            "Unrequested attachments can carry malware. Be careful with executables, archives, and macro files.",
            "المرفقات غير المتوقعة قد تحمل برمجيات خبيثة. توخَّ الحذر مع الملفات التنفيذية والضغط وملفات الماكرو.",
        ),
    },
    {
        "id": "formatting",
        "weight": 6,
        "patterns": [r"!{2,}", r"\?\?{2,}"],
        "title": _text("Excessive punctuation", "علامات ترقيم مفرطة"),
        "explanation": _text(
            "Repeated exclamation marks are used to create alarm and pressure.",
            "تكرار علامات التعجب يُستخدم لإثارة الذعر والضغط.",
        ),
    },
]


def _collect_matches(text: str, patterns: List[str], limit: int = 4) -> List[str]:
    found: List[str] = []
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            value = match.group(0).strip()
            if value and value.lower() not in [f.lower() for f in found]:
                found.append(value)
            if len(found) >= limit:
                return found
    return found


def _severity(weight: int) -> str:
    if weight >= 25:
        return "high"
    if weight >= 12:
        return "medium"
    return "low"


def _make_indicator(rule: Dict[str, Any], matches: List[str]) -> Dict[str, Any]:
    return {
        "id": rule["id"],
        "weight": rule["weight"],
        "severity": _severity(rule["weight"]),
        "title": rule["title"],
        "explanation": rule["explanation"],
        "matches": matches,
    }


def _analyze_links(text: str) -> List[Dict[str, Any]]:
    indicators: List[Dict[str, Any]] = []
    flags = {
        "insecure_link": {"weight": 12, "urls": []},
        "ip_link": {"weight": 30, "urls": []},
        "shortener_link": {"weight": 12, "urls": []},
        "obfuscated_link": {"weight": 25, "urls": []},
        "suspicious_tld": {"weight": 12, "urls": []},
    }

    for url in URL_PATTERN.findall(text):
        parts = urlsplit(url)
        host = (parts.hostname or "").lower()
        if not host:
            continue

        if parts.scheme.lower() == "http":
            flags["insecure_link"]["urls"].append(url)
        if IP_HOST.match(host):
            flags["ip_link"]["urls"].append(url)
        if host in SHORTENERS:
            flags["shortener_link"]["urls"].append(url)
        if "@" in (parts.netloc or "") or "xn--" in host or len(re.findall(r"%[0-9a-f]{2}", url, re.IGNORECASE)) >= 2:
            flags["obfuscated_link"]["urls"].append(url)
        if any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
            flags["suspicious_tld"]["urls"].append(url)

    definitions = {
        "insecure_link": (
            "Link uses HTTP",
            "رابط يستخدم HTTP",
            "The link is not encrypted (http://). Legitimate login pages use https://.",
            "الرابط غير مشفّر (http://). صفحات الدخول الشرعية تستخدم https://.",
        ),
        "ip_link": (
            "Link uses a raw IP address",
            "رابط يستخدم عنوان IP",
            "Real services use domain names, not numeric IP addresses.",
            "الخدمات الحقيقية تستخدم أسماء نطاقات، وليس عناوين IP رقمية.",
        ),
        "shortener_link": (
            "Shortened link hides its destination",
            "رابط مختصر يخفي وجهته",
            "Shortened links conceal where they really lead. Expand before trusting.",
            "الروابط المختصرة تخفي وجهتها الحقيقية. اكتشفها قبل الوثوق بها.",
        ),
        "obfuscated_link": (
            "Link is obfuscated",
            "رابط مموّه",
            "Encoded characters, an '@' in the URL, or a punycode domain can disguise the real destination.",
            "الأحرف المُرمّزة أو علامة '@' في الرابط أو نطاق punycode قد تخفي الوجهة الحقيقية.",
        ),
        "suspicious_tld": (
            "Suspicious domain ending",
            "امتداد نطاق مشبوه",
            "The domain uses a TLD frequently abused for phishing.",
            "النطاق يستخدم امتداداً يُستغل كثيراً في التصيّد.",
        ),
    }

    for key, data in flags.items():
        if data["urls"]:
            title_en, title_ar, exp_en, exp_ar = definitions[key]
            indicators.append({
                "id": key,
                "weight": data["weight"],
                "severity": _severity(data["weight"]),
                "title": _text(title_en, title_ar),
                "explanation": _text(exp_en, exp_ar),
                "matches": data["urls"][:4],
            })

    return indicators


def _analyze_sender(text: str) -> List[Dict[str, Any]]:
    from_match = re.search(r"(?im)^\s*from:\s*(.+)$", text)
    if not from_match:
        return []

    header = from_match.group(1)
    address_match = re.search(r"[\w.!#$%&'*+/=?^`{|}~-]+@([\w.-]+)", header)
    if not address_match:
        return []

    domain = address_match.group(1).lower().rstrip(".")
    display_match = re.search(r"[\"']?([^\"'<]+?)[\"']?\s*<", header)
    display_name = (display_match.group(1).strip() if display_match else "")
    matches = [header.strip()[:120]]
    reasons_en: List[str] = []
    reasons_ar: List[str] = []

    if domain in FREE_MAIL:
        reasons_en.append("sent from a free public mailbox")
        reasons_ar.append("مُرسَل من صندوق بريد عام مجاني")
        if display_name and any(word in display_name.lower() for word in BRAND_WORDS):
            reasons_en.append("claims to be a known brand while using a free mailbox")
            reasons_ar.append("يدّعي أنه جهة معروفة بينما يستخدم بريداً مجانياً")

    reply_match = re.search(r"(?im)^\s*reply-to:\s*(.+)$", text)
    if reply_match:
        reply_domain_match = re.search(r"@([\w.-]+)", reply_match.group(1))
        if reply_domain_match and reply_domain_match.group(1).lower().rstrip(".") != domain:
            reasons_en.append("reply-to address differs from the sender")
            reasons_ar.append("عنوان الرد يختلف عن المُرسِل")

    if not reasons_en:
        return []

    return [{
        "id": "suspicious_sender",
        "weight": 20,
        "severity": _severity(20),
        "title": _text("Suspicious sender", "مُرسِل مشبوه"),
        "explanation": _text(
            "The sender identity looks inconsistent: " + ", ".join(reasons_en) + ".",
            "هوية المُرسِل تبدو غير متسقة: " + "، ".join(reasons_ar) + ".",
        ),
        "matches": matches,
    }]


RECOMMENDATIONS = {
    "safe": [
        _text("No strong phishing indicators were found, but stay cautious.",
              "لم يتم العثور على مؤشرات تصيّد قوية، لكن ابقَ حذراً."),
        _text("Verify unexpected requests through an official channel before acting.",
              "تحقق من الطلبات غير المتوقعة عبر قناة رسمية قبل التصرف."),
    ],
    "low": [
        _text("Do not share passwords, codes, or card details by email.",
              "لا تشارك كلمات المرور أو الرموز أو بيانات البطاقة عبر البريد."),
        _text("Inspect links before clicking and confirm the sender is genuine.",
              "افحص الروابط قبل النقر وتأكد من أن المُرسِل حقيقي."),
    ],
    "medium": [
        _text("Do not click links or open attachments until you verify the sender.",
              "لا تنقر الروابط أو تفتح المرفقات حتى تتحقق من المُرسِل."),
        _text("Contact the organization using a known, official phone number or website.",
              "تواصل مع الجهة عبر رقم هاتف أو موقع رسمي معروف."),
    ],
    "high": [
        _text("Treat this email as phishing. Do not click, reply, or open attachments.",
              "تعامل مع هذا البريد كتصيّد. لا تنقر ولا ترد ولا تفتح المرفقات."),
        _text("Report the message to your IT or security team and delete it.",
              "أبلغ فريق تقنية المعلومات أو الأمن بالرسالة واحذفها."),
        _text("If you already interacted, change your passwords and enable two-factor authentication.",
              "إذا تفاعلت معها بالفعل، غيّر كلمات المرور وفعّل المصادقة الثنائية."),
    ],
    "critical": [
        _text("This email shows strong phishing signs. Do not interact with it at all.",
              "يُظهر هذا البريد مؤشرات تصيّد قوية. لا تتفاعل معه إطلاقاً."),
        _text("Report and delete the message immediately.",
              "أبلغ عن الرسالة واحذفها فوراً."),
        _text("If you entered credentials, change them now and check your accounts for suspicious activity.",
              "إذا أدخلت بيانات الدخول، غيّرها الآن وراجع حساباتك بحثاً عن نشاط مشبوه."),
    ],
}


def analyze_email(content: str) -> Dict[str, Any]:
    text = (content or "").strip()
    if not text:
        raise ValueError("empty content")

    if len(text) > MAX_CONTENT_LENGTH:
        raise ValueError("content too long")

    indicators: List[Dict[str, Any]] = []

    for rule in PATTERN_RULES:
        matches = _collect_matches(text, rule["patterns"])
        if matches:
            indicators.append(_make_indicator(rule, matches))

    indicators.extend(_analyze_links(text))
    indicators.extend(_analyze_sender(text))

    indicators.sort(key=lambda item: item["weight"], reverse=True)

    score = min(100, sum(item["weight"] for item in indicators))
    level = determine_risk_level(score)

    return {
        "success": True,
        "status": "analyzed",
        "score": score,
        "level": level,
        "indicator_count": len(indicators),
        "indicators": indicators,
        "recommendations": RECOMMENDATIONS[level],
    }
