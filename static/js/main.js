const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const languageButton = document.getElementById("languageButton");
const soundButton = document.getElementById("soundButton");
const breachSound = document.getElementById("breachSound");

const result = document.getElementById("result");
const riskBadge = document.getElementById("riskBadge");
const resultTitle = document.getElementById("resultTitle");
const breachCount = document.getElementById("breachCount");
const breachList = document.getElementById("breachList");
const recommendations = document.getElementById("recommendations");

const { escapeHtml, sanitizeDescription } = window.PhishStrikeSanitize;
const { getInitialLanguage, saveLanguage } = window.PhishStrikeI18n;

let currentLanguage = getInitialLanguage();

const translations = {
    en: {
        language: "العربية",
        subtitle:
            "Check your email against known data breaches and understand your security risk.",
        emailLabel: "Enter your email address",
        placeholder: "example@email.com",
        check: "SCAN EMAIL",
        checking: "Checking...",
        found: "Breaches Found",
        noBreaches: "No Known Breaches Found",
        safeTitle: "Your email was not found in the checked breaches.",
        recommendations: "Security Recommendations",
        safeAdvice:
            "Continue using strong, unique passwords and enable two-factor authentication.",
        invalid: "Please enter a valid email address.",
        error: "Something went wrong. Please try again.",
        safe: "Safe",
        low: "Low Risk",
        medium: "Medium Risk",
        high: "High Risk",
        critical: "Critical Risk",
        breached: "Your email appeared in known data breaches.",
        breachDate: "Breach Date",
        exposedData: "Exposed Data",
        affectedAccounts: "Affected Accounts",
        soundOn: "SOUND ON",
        soundOff: "SOUND OFF"
    },

    ar: {
        language: "English",
        subtitle:
            "تحقق من بريدك الإلكتروني مقابل تسريبات البيانات المعروفة وافهم مستوى الخطورة.",
        emailLabel: "أدخل بريدك الإلكتروني",
        placeholder: "example@email.com",
        check: "فحص البريد الإلكتروني",
        checking: "جارٍ الفحص...",
        found: "التسريبات المكتشفة",
        noBreaches: "لم يتم العثور على تسريبات معروفة",
        safeTitle:
            "لم يتم العثور على بريدك الإلكتروني ضمن التسريبات التي تم فحصها.",
        recommendations: "التوصيات الأمنية",
        safeAdvice:
            "استمر في استخدام كلمات مرور قوية وفريدة، وفعّل المصادقة الثنائية.",
        invalid: "يرجى إدخال بريد إلكتروني صحيح.",
        error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        safe: "آمن",
        low: "خطورة منخفضة",
        medium: "خطورة متوسطة",
        high: "خطورة مرتفعة",
        critical: "خطورة حرجة",
        breached: "ظهر بريدك الإلكتروني في تسريبات بيانات معروفة.",
        breachDate: "تاريخ التسريب",
        exposedData: "البيانات المكشوفة",
        affectedAccounts: "الحسابات المتأثرة",
        soundOn: "الصوت مفعّل",
        soundOff: "الصوت مغلق"
    }
};


const SOUND_STORAGE_KEY = "phishstrike-sound";


function getInitialSound() {
    try {
        const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
        if (saved === "off") {
            return false;
        }
        if (saved === "on") {
            return true;
        }
    } catch (error) {
        // localStorage unavailable — keep the default.
    }
    return true;
}


let soundEnabled = getInitialSound();


function saveSound() {
    try {
        window.localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "on" : "off");
    } catch (error) {
        // Persistence is best-effort only.
    }
}


function updateSoundButton() {
    if (!soundButton) {
        return;
    }
    const t = translations[currentLanguage];
    soundButton.textContent = soundEnabled ? t.soundOn : t.soundOff;
    soundButton.classList.toggle("is-off", !soundEnabled);
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
}


function playBreachSound() {
    if (!soundEnabled || !breachSound) {
        return;
    }
    try {
        breachSound.currentTime = 0;
        const played = breachSound.play();
        if (played && played.catch) {
            played.catch(() => {});
        }
    } catch (error) {
        // Ignore playback errors (autoplay policy, missing file, etc.).
    }
}


function updateLanguage() {
    const t = translations[currentLanguage];

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir =
        currentLanguage === "ar" ? "rtl" : "ltr";

    languageButton.textContent = t.language;
    updateSoundButton();

    document.dispatchEvent(
        new CustomEvent("languagechange", {
            detail: { language: currentLanguage }
        })
    );

    if (!form) {
        return;
    }

    document.getElementById("subtitle").textContent = t.subtitle;
    document.getElementById("emailLabel").textContent = t.emailLabel;

    emailInput.placeholder = t.placeholder;

    document.getElementById("checkButton").textContent = t.check;

    message.textContent = "";
}


function showSafeResult(riskAssessment) {
    const t = translations[currentLanguage];

    result.classList.remove("hidden");
    result.classList.remove("result-danger");
    result.classList.remove("result-critical");
    result.classList.add("result-safe");

    riskBadge.textContent = "✓ " + t.noBreaches + (riskAssessment ? ` (${riskAssessment.score}/100)` : "");
    resultTitle.textContent = t.safeTitle;

    breachCount.textContent = `${t.found}: 0`;

    breachList.innerHTML = "";

    recommendations.innerHTML = `
        <h3>${t.recommendations}</h3>
        <p>${t.safeAdvice}</p>
    `;
}


function showBreachResult(breaches, riskAssessment) {
    const t = translations[currentLanguage];

    if (breaches && breaches.length > 0) {
        playBreachSound();
    }

    result.classList.remove("hidden");
    result.classList.remove("result-safe");
    
    // Clear all risk classes first
    result.classList.remove("result-low", "result-medium", "result-high", "result-critical");
    
    // Add appropriate risk class
    const riskLevel = riskAssessment.level;
    let riskDisplayText;
    
    switch(riskLevel) {
        case "low":
            riskDisplayText = t.low;
            result.classList.add("result-low");
            break;
        case "medium":
            riskDisplayText = t.medium;
            result.classList.add("result-medium");
            break;
        case "high":
            riskDisplayText = t.high;
            result.classList.add("result-high");
            break;
        case "critical":
            riskDisplayText = t.critical;
            result.classList.add("result-critical");
            break;
        default:
            riskDisplayText = t.medium;
            result.classList.add("result-medium");
    }

    riskBadge.textContent = "⚠ " + riskDisplayText + ` (${riskAssessment.score}/100)`;

    resultTitle.textContent = t.breached;

    breachCount.textContent =
        `${t.found}: ${breaches.length}`;


    breachList.innerHTML = breaches.map((breach) => {

        const dataClasses = breach.DataClasses || [];

        let formattedDate = "—";

        if (breach.BreachDate) {
            formattedDate = new Date(
                breach.BreachDate
            ).toLocaleDateString(
                currentLanguage === "ar"
                    ? "ar-SA"
                    : "en-US",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
        }

        const affectedAccounts = breach.PwnCount
            ? Number(breach.PwnCount).toLocaleString()
            : "—";


        return `
            <article class="breach-card">

                <div class="breach-card-header">

                    <div class="breach-name">

                        ${
                            breach.LogoPath
                                ? `
                                    <img
                                        src="${escapeHtml(breach.LogoPath)}"
                                        alt=""
                                        class="breach-logo"
                                    >
                                  `
                                : ""
                        }

                        <div>
                            <h3>
                                ${escapeHtml(breach.Title || breach.Name)}
                            </h3>

                            <span>
                                ${escapeHtml(breach.Domain || "")}
                            </span>
                        </div>

                    </div>

                    <span class="breach-alert">
                        BREACHED
                    </span>

                </div>


                <div class="breach-description">
                    ${sanitizeDescription(breach.Description)}
                </div>


                <div class="breach-stats">

                    <div class="breach-stat">
                        <span class="stat-label">
                            ${t.breachDate}
                        </span>

                        <strong>
                            ${formattedDate}
                        </strong>
                    </div>


                    <div class="breach-stat">
                        <span class="stat-label">
                            ${t.affectedAccounts}
                        </span>

                        <strong>
                            ${affectedAccounts}
                        </strong>
                    </div>


                    <div class="breach-stat">
                        <span class="stat-label">
                            ${t.exposedData}
                        </span>

                        <strong>
                            ${dataClasses.length}
                        </strong>
                    </div>

                </div>


                ${
                    dataClasses.length > 0
                        ? `
                            <div class="data-classes">

                                ${dataClasses
                                    .map(
                                        (item) =>
                                            `<span>${escapeHtml(item)}</span>`
                                    )
                                    .join("")}

                            </div>
                          `
                        : ""
                }

            </article>
        `;

    }).join("");


    recommendations.innerHTML = `
        <h3>${t.recommendations}</h3>

        <p>
            ${
                currentLanguage === "en"
                    ? "Change any reused passwords, enable two-factor authentication, and review the affected accounts."
                    : "غيّر كلمات المرور المستخدمة في أكثر من حساب، وفعّل المصادقة الثنائية، وراجع الحسابات المتأثرة."
            }
        </p>
    `;
}


languageButton.addEventListener("click", () => {

    currentLanguage =
        currentLanguage === "en"
            ? "ar"
            : "en";

    saveLanguage(currentLanguage);

    updateLanguage();
});


if (soundButton) soundButton.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    saveSound();

    updateSoundButton();
});


if (form) form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const t = translations[currentLanguage];

    const email = emailInput.value.trim();


    // Browser email validation
    if (!emailInput.checkValidity()) {

        message.textContent = t.invalid;

        result.classList.add("hidden");

        return;
    }


    // Show loading message
    message.textContent = t.checking;

    result.classList.add("hidden");


    try {

        const response = await fetch(
            "/api/check",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );


        const data = await response.json();


        // Remove "Checking..." after API response
        message.textContent = "";


        if (response.ok && data.status === "found") {

            showBreachResult(
                data.breaches || [],
                data.risk || { level: "medium", score: 50 }
            );

        } else if (
            response.ok &&
            data.status === "not_found"
        ) {

            showSafeResult(data.risk);

        } else {

            message.textContent = t.error;
        }


    } catch (error) {

        console.error(
            "Email scan error:",
            error
        );

        message.textContent = t.error;
    }

});


updateLanguage();