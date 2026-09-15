const phishingForm = document.getElementById("phishingForm");

if (phishingForm) {

    const contentInput = document.getElementById("emailContent");
    const message = document.getElementById("message");
    const result = document.getElementById("result");
    const riskBadge = document.getElementById("riskBadge");
    const resultTitle = document.getElementById("resultTitle");
    const indicatorCount = document.getElementById("indicatorCount");
    const indicatorList = document.getElementById("indicatorList");
    const recommendations = document.getElementById("recommendations");
    const analyzeButton = document.getElementById("analyzeButton");

    let currentLanguage = document.documentElement.lang === "ar" ? "ar" : "en";
    let lastResult = null;

    const translations = {
        en: {
            analyze: "ANALYZE EMAIL",
            analyzing: "Analyzing...",
            empty: "Please paste the email content to analyze.",
            error: "Something went wrong. Please try again.",
            heading: "Security Recommendations",
            evidence: "Evidence",
            levels: {
                safe: "Safe",
                low: "Low Risk",
                medium: "Medium Risk",
                high: "High Risk",
                critical: "Critical Risk"
            },
            severities: {
                high: "High",
                medium: "Medium",
                low: "Low"
            },
            titles: {
                safe: "No phishing indicators found.",
                low: "A few weak phishing indicators detected.",
                medium: "This email shows suspicious signs.",
                high: "This email is likely a phishing attempt.",
                critical: "This email is almost certainly phishing."
            },
            indicatorWord: "indicators detected"
        },

        ar: {
            analyze: "تحليل البريد",
            analyzing: "جارٍ التحليل...",
            empty: "يرجى لصق محتوى البريد لتحليله.",
            error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
            heading: "التوصيات الأمنية",
            evidence: "الدليل",
            levels: {
                safe: "آمن",
                low: "خطورة منخفضة",
                medium: "خطورة متوسطة",
                high: "خطورة مرتفعة",
                critical: "خطورة حرجة"
            },
            severities: {
                high: "مرتفعة",
                medium: "متوسطة",
                low: "منخفضة"
            },
            titles: {
                safe: "لم يتم العثور على مؤشرات تصيّد.",
                low: "تم رصد مؤشرات تصيّد ضعيفة قليلة.",
                medium: "يُظهر هذا البريد علامات مشبوهة.",
                high: "يُرجّح أن هذا البريد محاولة تصيّد.",
                critical: "هذا البريد شبه مؤكد أنه تصيّد."
            },
            indicatorWord: "مؤشرات مكتشفة"
        }
    };


    function render(data) {
        const t = translations[currentLanguage];

        result.classList.remove(
            "hidden", "result-safe", "result-low",
            "result-medium", "result-high", "result-critical"
        );

        const level = data.level || "safe";
        result.classList.add("result-" + level);

        riskBadge.textContent = `${t.levels[level]} · ${data.score}/100`;
        resultTitle.textContent = t.titles[level];
        indicatorCount.textContent = `${data.indicator_count} ${t.indicatorWord}`;

        indicatorList.innerHTML = (data.indicators || []).map((item) => {

            const evidence = (item.matches || []).length
                ? `
                    <div class="indicator-evidence">
                        <span>${t.evidence}</span>
                        ${item.matches.map((m) => `<code>${m}</code>`).join("")}
                    </div>
                  `
                : "";

            return `
                <article class="indicator-item severity-${item.severity}">
                    <div class="indicator-item-header">
                        <h3>${item.title[currentLanguage]}</h3>
                        <span class="severity-tag">${t.severities[item.severity]}</span>
                    </div>
                    <p>${item.explanation[currentLanguage]}</p>
                    ${evidence}
                </article>
            `;
        }).join("");

        recommendations.innerHTML = `
            <h3>${t.heading}</h3>
            <ul>${(data.recommendations || [])
                .map((r) => `<li>${r[currentLanguage]}</li>`)
                .join("")}</ul>
        `;
    }


    document.addEventListener("languagechange", (event) => {
        currentLanguage = event.detail.language;
        if (lastResult) {
            render(lastResult);
        } else {
            applyPhishingLanguage();
        }
    });


    function applyPhishingLanguage() {
        const t = translations[currentLanguage];
        analyzeButton.querySelector("span").textContent = t.analyze;
        if (message.textContent && !lastResult) {
            message.textContent = "";
        }
    }


    phishingForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const t = translations[currentLanguage];
        const content = contentInput.value.trim();

        if (!content) {
            message.textContent = t.empty;
            result.classList.add("hidden");
            return;
        }

        message.textContent = t.analyzing;
        result.classList.add("hidden");
        analyzeButton.disabled = true;

        try {
            const response = await fetch("/api/phishing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content })
            });

            const data = await response.json();
            message.textContent = "";

            if (response.ok && data.success) {
                lastResult = data;
                render(data);
            } else {
                message.textContent = data.error || t.error;
            }

        } catch (error) {
            console.error("Phishing analysis error:", error);
            message.textContent = t.error;
        } finally {
            analyzeButton.disabled = false;
        }
    });


    applyPhishingLanguage();
}
