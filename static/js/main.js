const form = document.getElementById("emailForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("message");
const languageButton = document.getElementById("languageButton");

let currentLanguage = "en";

const translations = {
    en: {
        language: "العربية",
        subtitle: "Fighting Email Attacks",
        emailLabel: "Enter your email",
        placeholder: "example@email.com",
        check: "Check Email",
        valid: "Email format is valid.",
        invalid: "Please enter a valid email address.",
        error: "Something went wrong. Please try again."
    },

    ar: {
        language: "English",
        subtitle: "مكافحة هجمات البريد الإلكتروني",
        emailLabel: "أدخل بريدك الإلكتروني",
        placeholder: "example@email.com",
        check: "فحص البريد الإلكتروني",
        valid: "صيغة البريد الإلكتروني صحيحة.",
        invalid: "يرجى إدخال بريد إلكتروني صحيح.",
        error: "حدث خطأ. يرجى المحاولة مرة أخرى."
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


languageButton.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ar" : "en";
    updateLanguage();
});


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";

    try {
        const response = await fetch("/api/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailInput.value
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            message.textContent = translations[currentLanguage].valid;
        } else {
            message.textContent =
                translations[currentLanguage].invalid;
        }

    } catch (error) {
        message.textContent =
            translations[currentLanguage].error;
    }
});


updateLanguage();