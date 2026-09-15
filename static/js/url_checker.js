(function () {

    const urlForm = document.getElementById("urlForm");

    if (!urlForm) {
        return;
    }

    const urlInput = document.getElementById("urlInput");
    const message = document.getElementById("message");
    const result = document.getElementById("result");
    const riskBadge = document.getElementById("riskBadge");
    const resultTitle = document.getElementById("resultTitle");
    const indicatorCount = document.getElementById("indicatorCount");
    const indicatorList = document.getElementById("indicatorList");
    const recommendations = document.getElementById("recommendations");
    const checkUrlButton = document.getElementById("checkUrlButton");

    let currentLanguage = document.documentElement.lang === "ar" ? "ar" : "en";
    let lastResult = null;

    const translations = {
        en: {
            check: "CHECK URL",
            checking: "Checking...",
            empty: "Please paste a URL to check.",
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
                safe: "No suspicious traits found.",
                low: "A few weak risk indicators detected.",
                medium: "This link shows suspicious traits.",
                high: "This link is likely malicious.",
                critical: "This link is highly dangerous."
            },
            indicatorWord: "indicators detected"
        },

        ar: {
            check: "فحص الرابط",
            checking: "جارٍ الفحص...",
            empty: "يرجى لصق رابط لفحصه.",
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
                safe: "لم يتم العثور على سمات مشبوهة.",
                low: "تم رصد مؤشرات خطورة ضعيفة قليلة.",
                medium: "يُظهر هذا الرابط سمات مشبوهة.",
                high: "يُرجّح أن هذا الرابط ضار.",
                critical: "هذا الرابط خطير جداً."
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


    function applyUrlLanguage() {
        const t = translations[currentLanguage];
        checkUrlButton.querySelector("span").textContent = t.check;
        if (lastResult) {
            render(lastResult);
        }
    }


    document.addEventListener("languagechange", (event) => {
        currentLanguage = event.detail.language;
        applyUrlLanguage();
    });


    urlForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const t = translations[currentLanguage];
        const url = urlInput.value.trim();

        if (!url) {
            message.textContent = t.empty;
            result.classList.add("hidden");
            return;
        }

        message.textContent = t.checking;
        result.classList.add("hidden");
        checkUrlButton.disabled = true;

        try {
            const response = await fetch("/api/url-checker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url })
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
            console.error("URL check error:", error);
            message.textContent = t.error;
        } finally {
            checkUrlButton.disabled = false;
        }
    });


    applyUrlLanguage();

})();
