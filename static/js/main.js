const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const languageButton = document.getElementById("languageButton");

const result = document.getElementById("result");
const riskBadge = document.getElementById("riskBadge");
const resultTitle = document.getElementById("resultTitle");
const breachCount = document.getElementById("breachCount");
const breachList = document.getElementById("breachList");
const recommendations = document.getElementById("recommendations");

let currentLanguage = "en";

const translations = {
    en: {
        language: "العربية",
        subtitle: "Fighting Email Attacks",
        emailLabel: "Enter your email",
        placeholder: "example@email.com",
        check: "Check Email",
        checking: "Checking...",
        found: "Breaches found",
        safe: "No known breaches found",
        safeTitle: "Your email was not found in the checked breaches.",
        recommendations: "Security Recommendations",
        safeAdvice: "Continue using strong, unique passwords and enable two-factor authentication.",
        invalid: "Please enter a valid email address.",
        error: "Something went wrong. Please try again.",
        low: "Low Risk",
        medium: "Medium Risk",
        high: "High Risk"
    },

    ar: {
        language: "English",
        subtitle: "مكافحة هجمات البريد الإلكتروني",
        emailLabel: "أدخل بريدك الإلكتروني",
        placeholder: "example@email.com",
        check: "فحص البريد الإلكتروني",
        checking: "جاري الفحص...",
        found: "عدد التسريبات",
        safe: "لم يتم العثور على تسريبات معروفة",
        safeTitle: "لم يتم العثور على بريدك الإلكتروني ضمن التسريبات التي تم فحصها.",
        recommendations: "التوصيات الأمنية",
        safeAdvice: "استمر في استخدام كلمات مرور قوية وفريدة، وفعّل المصادقة الثنائية.",
        invalid: "يرجى إدخال بريد إلكتروني صحيح.",
        error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        low: "خطر منخفض",
        medium: "خطر متوسط",
        high: "خطر مرتفع"
    }
};


function updateLanguage() {
    const t = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir =
        currentLanguage === "ar" ? "rtl" : "ltr";

    languageButton.textContent = t.language;
    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("emailLabel").textContent = t.emailLabel;
    emailInput.placeholder = t.placeholder;
    document.getElementById("checkButton").textContent = t.check;

    message.textContent = "";
}


function showSafeResult() {
    const t = translations[currentLanguage];

    result.classList.remove("hidden");

    riskBadge.textContent = "✓ " + t.safe;
    resultTitle.textContent = t.safeTitle;

    breachCount.textContent = t.found + ": 0";
    breachList.innerHTML = "";

    recommendations.innerHTML = `
        <h3>${t.recommendations}</h3>
        <p>${t.safeAdvice}</p>
    `;
}


function showBreachResult(breaches) {
    const t = translations[currentLanguage];

    result.classList.remove("hidden");

    let riskLevel;

    if (breaches.length <= 2) {
        riskLevel = t.low;
    } else if (breaches.length <= 5) {
        riskLevel = t.medium;
    } else {
        riskLevel = t.high;
    }

    riskBadge.textContent = "⚠ " + riskLevel;
    resultTitle.textContent = t.found;
    breachCount.textContent = `${t.found}: ${breaches.length}`;

    breachList.innerHTML = breaches.map(breach => `
        <div class="breach-item">
            <strong>${breach.Name}</strong>
            <span>${breach.BreachDate || ""}</span>
        </div>
    `).join("");

    recommendations.innerHTML = `
        <h3>${t.recommendations}</h3>
        <p>
            ${currentLanguage === "en"
                ? "Review affected accounts, change reused passwords, and enable two-factor authentication."
                : "راجع الحسابات المتأثرة، وغيّر كلمات المرور المستخدمة في أكثر من حساب، وفعّل المصادقة الثنائية."
            }
        </p>
    `;
}


languageButton.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ar" : "en";
    updateLanguage();
});


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const t = translations[currentLanguage];

    message.textContent = t.checking;
    result.classList.add("hidden");

    try {
        const response = await fetch("/api/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value.trim()
            })
        });

        const data = await response.json();
        message.textContent = "";
        if (response.ok && data.success) {

            if (data.status === "found") {
                showBreachResult(data.breaches);
            } else if (data.status === "not_found") {
                showSafeResult();
            } else {
                message.textContent = t.error;
            }

        } else {
            message.textContent = t.invalid;
        }

    } catch (error) {
        message.textContent = t.error;
    }
});


updateLanguage();