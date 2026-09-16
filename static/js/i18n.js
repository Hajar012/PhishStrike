(function (global) {
    "use strict";

    var STORAGE_KEY = "phishstrike-language";

    var translations = {
        en: {
            "status.online": "SYSTEM ONLINE",
            "status.index": "EMAIL SECURITY SCANNER",
            "status.phishing": "PHISHING EMAIL ANALYZER",
            "status.url": "SUSPICIOUS URL CHECKER",
            "status.quiz": "SECURITY AWARENESS QUIZ",

            "footer.index": "EMAIL SECURITY TOOL",
            "footer.phishing": "PHISHING ANALYSIS TOOL",
            "footer.url": "URL ANALYSIS TOOL",
            "footer.quiz": "SECURITY AWARENESS TOOL",

            "nav.email": "Email Scanner",
            "nav.phishing": "Phishing Analyzer",
            "nav.url": "URL Checker",
            "nav.quiz": "Security Quiz",

            "pageTitle.index": "PhishStrike — Email Security Scanner",
            "pageTitle.phishing": "PhishStrike — Phishing Email Analyzer",
            "pageTitle.url": "PhishStrike — Suspicious URL Checker",
            "pageTitle.quiz": "PhishStrike — Security Awareness Quiz",

            "common.ready": "READY",
            "common.source": "SOURCE",
            "common.processing": "PROCESSING",
            "common.language": "LANGUAGE",
            "common.analysis": "ANALYSIS",
            "common.indicators": "INDICATORS",
            "common.checks": "CHECKS",
            "common.questions": "QUESTIONS",
            "common.mode": "MODE",

            "index.heroTag": "<span>//</span> FIGHTING EMAIL ATTACKS",
            "index.heroTitle": "Is your email <span>exposed?</span>",
            "index.scanLabel": "SECURITY SCAN",
            "index.processingValue": "TEMPORARY",
            "index.privacy1": "No password required",
            "index.privacy2": "Your credentials are never requested",

            "phishing.heroTag": "<span>//</span> DETECTING PHISHING ATTEMPTS",
            "phishing.heroTitle": "Is this email <span>suspicious?</span>",
            "phishing.subtitle": "Paste suspicious email content to analyze it for phishing indicators. No AI required — deterministic rule-based analysis.",
            "phishing.scanLabel": "PHISHING ANALYSIS",
            "phishing.label": "Paste suspicious email content",
            "phishing.placeholder": "Your account has been suspended...",
            "phishing.privacy1": "Content is processed temporarily",
            "phishing.privacy2": "No permanent storage of email content",
            "phishing.analysisValue": "RULE-BASED",
            "phishing.indicatorsValue": "8+ PATTERNS",

            "url.heroTag": "<span>//</span> INSPECTING SUSPICIOUS LINKS",
            "url.heroTitle": "Is this link <span>dangerous?</span>",
            "url.subtitle": "Paste a suspicious URL to analyze its structure and risk indicators. The link is analyzed as text and is never opened.",
            "url.scanLabel": "URL ANALYSIS",
            "url.label": "Paste a suspicious URL",
            "url.privacy1": "Analyzed as text",
            "url.privacy2": "The link is never opened or executed",
            "url.analysisValue": "TEXT-BASED",
            "url.checksValue": "12+ PATTERNS",

            "quiz.heroTag": "<span>//</span> TEST YOUR SECURITY INSTINCTS",
            "quiz.heroTitle": "How aware <span>are you?</span>",
            "quiz.subtitle": "Answer a short set of phishing and security questions. Your score is calculated locally — nothing is stored.",
            "quiz.scanLabel": "SECURITY QUIZ",
            "quiz.modeValue": "INTERACTIVE"
        },

        ar: {
            "status.online": "النظام متصل",
            "status.index": "فاحص أمن البريد الإلكتروني",
            "status.phishing": "محلّل رسائل التصيّد",
            "status.url": "فاحص الروابط المشبوهة",
            "status.quiz": "اختبار الوعي الأمني",

            "footer.index": "أداة أمن البريد الإلكتروني",
            "footer.phishing": "أداة تحليل التصيّد",
            "footer.url": "أداة تحليل الروابط",
            "footer.quiz": "أداة التوعية الأمنية",

            "nav.email": "فحص البريد",
            "nav.phishing": "محلّل التصيّد",
            "nav.url": "فاحص الروابط",
            "nav.quiz": "اختبار الأمان",

            "pageTitle.index": "PhishStrike — فاحص أمن البريد الإلكتروني",
            "pageTitle.phishing": "PhishStrike — محلّل رسائل التصيّد",
            "pageTitle.url": "PhishStrike — فاحص الروابط المشبوهة",
            "pageTitle.quiz": "PhishStrike — اختبار الوعي الأمني",

            "common.ready": "جاهز",
            "common.source": "المصدر",
            "common.processing": "المعالجة",
            "common.language": "اللغة",
            "common.analysis": "التحليل",
            "common.indicators": "المؤشرات",
            "common.checks": "الفحوصات",
            "common.questions": "الأسئلة",
            "common.mode": "الوضع",

            "index.heroTag": "<span>//</span> مكافحة هجمات البريد الإلكتروني",
            "index.heroTitle": "هل بريدك الإلكتروني <span>مكشوف؟</span>",
            "index.scanLabel": "فحص أمني",
            "index.processingValue": "مؤقتة",
            "index.privacy1": "لا حاجة إلى كلمة مرور",
            "index.privacy2": "لا نطلب بيانات دخولك أبداً",

            "phishing.heroTag": "<span>//</span> كشف محاولات التصيّد",
            "phishing.heroTitle": "هل هذا البريد <span>مشبوه؟</span>",
            "phishing.subtitle": "الصق محتوى بريد مشبوه لتحليله بحثاً عن مؤشرات التصيّد. تحليل قائم على قواعد ثابتة دون الحاجة إلى ذكاء اصطناعي.",
            "phishing.scanLabel": "تحليل التصيّد",
            "phishing.label": "الصق محتوى البريد المشبوه",
            "phishing.placeholder": "تم تعليق حسابك...",
            "phishing.privacy1": "تتم معالجة المحتوى مؤقتاً",
            "phishing.privacy2": "لا يتم تخزين محتوى البريد بشكل دائم",
            "phishing.analysisValue": "قائم على القواعد",
            "phishing.indicatorsValue": "أكثر من 8 أنماط",

            "url.heroTag": "<span>//</span> فحص الروابط المشبوهة",
            "url.heroTitle": "هل هذا الرابط <span>خطير؟</span>",
            "url.subtitle": "الصق رابطاً مشبوهاً لتحليل بنيته ومؤشرات خطورته. يُحلَّل الرابط كنص ولا يُفتح أبداً.",
            "url.scanLabel": "تحليل الرابط",
            "url.label": "الصق رابطاً مشبوهاً",
            "url.privacy1": "يُحلَّل كنص",
            "url.privacy2": "لا يُفتح الرابط أو يُنفَّذ أبداً",
            "url.analysisValue": "قائم على النص",
            "url.checksValue": "أكثر من 12 نمطاً",

            "quiz.heroTag": "<span>//</span> اختبر حسّك الأمني",
            "quiz.heroTitle": "ما مدى <span>وعيك؟</span>",
            "quiz.subtitle": "أجب عن مجموعة قصيرة من أسئلة التصيّد والأمان. تُحسب نتيجتك محلياً ولا يُخزَّن أي شيء.",
            "quiz.scanLabel": "اختبار الأمان",
            "quiz.modeValue": "تفاعلي"
        }
    };

    function getInitialLanguage() {
        try {
            var saved = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
            if (saved === "ar" || saved === "en") {
                return saved;
            }
        } catch (error) {
            // localStorage unavailable (private mode, etc.) — fall back to default.
        }
        return "en";
    }

    function saveLanguage(language) {
        try {
            if (global.localStorage) {
                global.localStorage.setItem(STORAGE_KEY, language);
            }
        } catch (error) {
            // Persistence is best-effort only.
        }
    }

    function resolveKey(key, page) {
        return page ? key.replace("@page", page) : key;
    }

    function translate(language) {
        var dict = translations[language] || translations.en;
        var page = document.body && document.body.getAttribute("data-page");

        document.querySelectorAll("[data-i18n]").forEach(function (element) {
            var value = dict[resolveKey(element.getAttribute("data-i18n"), page)];
            if (value !== undefined) {
                element.textContent = value;
            }
        });

        document.querySelectorAll("[data-i18n-html]").forEach(function (element) {
            var value = dict[resolveKey(element.getAttribute("data-i18n-html"), page)];
            if (value !== undefined) {
                element.innerHTML = value;
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
            var value = dict[resolveKey(element.getAttribute("data-i18n-placeholder"), page)];
            if (value !== undefined) {
                element.placeholder = value;
            }
        });

        var title = page ? dict["pageTitle." + page] : null;
        if (title) {
            document.title = title;
        }

        return dict;
    }

    global.PhishStrikeI18n = {
        translations: translations,
        getInitialLanguage: getInitialLanguage,
        saveLanguage: saveLanguage,
        translate: translate
    };

    document.addEventListener("languagechange", function (event) {
        translate(event.detail && event.detail.language ? event.detail.language : "en");
    });
})(typeof globalThis !== "undefined" ? globalThis : this);
