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
        emailLabel: "Enter your email address",
        placeholder: "example@email.com",
        check: "SCAN EMAIL",
        checking: "Checking...",
        found: "Breaches Found",
        safe: "No Known Breaches Found",
        safeTitle: "Your email was not found in the checked breaches.",
        recommendations: "Security Recommendations",
        safeAdvice:
            "Continue using strong, unique passwords and enable two-factor authentication.",
        invalid: "Please enter a valid email address.",
        error: "Something went wrong. Please try again.",
        low: "Low Risk",
        medium: "Medium Risk",
        high: "High Risk",
        breached: "Your email appeared in known data breaches.",
        breachDate: "Breach Date",
        exposedData: "Exposed Data",
        affectedAccounts: "Affected Accounts"
    },

    ar: {
        language: "English",
        subtitle: "مكافحة هجمات البريد الإلكتروني",
        emailLabel: "أدخل بريدك الإلكتروني",
        placeholder: "example@email.com",
        check: "فحص البريد الإلكتروني",
        checking: "جارٍ الفحص...",
        found: "التسريبات المكتشفة",
        safe: "لم يتم العثور على تسريبات معروفة",
        safeTitle:
            "لم يتم العثور على بريدك الإلكتروني ضمن التسريبات التي تم فحصها.",
        recommendations: "التوصيات الأمنية",
        safeAdvice:
            "استمر في استخدام كلمات مرور قوية وفريدة، وفعّل المصادقة الثنائية.",
        invalid: "يرجى إدخال بريد إلكتروني صحيح.",
        error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
        low: "خطورة منخفضة",
        medium: "خطورة متوسطة",
        high: "خطورة مرتفعة",
        breached: "ظهر بريدك الإلكتروني في تسريبات بيانات معروفة.",
        breachDate: "تاريخ التسريب",
        exposedData: "البيانات المكشوفة",
        affectedAccounts: "الحسابات المتأثرة"
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
    result.classList.remove("result-danger");
    result.classList.add("result-safe");

    riskBadge.textContent = "✓ " + t.safe;
    resultTitle.textContent = t.safeTitle;

    breachCount.textContent = `${t.found}: 0`;

    breachList.innerHTML = "";

    recommendations.innerHTML = `
        <h3>${t.recommendations}</h3>
        <p>${t.safeAdvice}</p>
    `;
}


function showBreachResult(breaches) {
    const t = translations[currentLanguage];

    result.classList.remove("hidden");
    result.classList.remove("result-safe");
    result.classList.add("result-danger");

    let riskLevel;

    if (breaches.length <= 2) {
        riskLevel = t.low;
    } else if (breaches.length <= 5) {
        riskLevel = t.medium;
    } else {
        riskLevel = t.high;
    }

    riskBadge.textContent = "⚠ " + riskLevel;

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
                                        src="${breach.LogoPath}"
                                        alt=""
                                        class="breach-logo"
                                    >
                                  `
                                : ""
                        }

                        <div>
                            <h3>
                                ${breach.Title || breach.Name}
                            </h3>

                            <span>
                                ${breach.Domain || ""}
                            </span>
                        </div>

                    </div>

                    <span class="breach-alert">
                        BREACHED
                    </span>

                </div>


                <div class="breach-description">
                    ${breach.Description || ""}
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
                                            `<span>${item}</span>`
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

    updateLanguage();
});


form.addEventListener("submit", async (event) => {

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
                data.breaches || []
            );

        } else if (
            response.ok &&
            data.status === "not_found"
        ) {

            showSafeResult();

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