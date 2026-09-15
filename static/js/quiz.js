(function (global) {
    "use strict";

    const QUESTIONS = [
        {
            prompt: {
                en: "You receive an email from your bank asking you to confirm your password through a link. What should you do?",
                ar: "تلقّيت رسالة من بنكك تطلب تأكيد كلمة المرور عبر رابط. ماذا تفعل؟"
            },
            options: [
                { en: "Click the link and enter your password", ar: "انقر الرابط وأدخل كلمة المرور" },
                { en: "Call the bank on its official number to verify", ar: "اتصل بالبنك على رقمه الرسمي للتحقق" },
                { en: "Reply to the email with your password", ar: "رُدّ على الرسالة بكلمة المرور" },
                { en: "Forward it to friends to ask their opinion", ar: "أرسلها لأصدقائك لأخذ رأيهم" }
            ],
            answer: 1,
            explanation: {
                en: "Banks never ask for passwords by email. Verify through an official channel you look up yourself.",
                ar: "البنوك لا تطلب كلمات المرور عبر البريد. تحقق عبر قناة رسمية تبحث عنها بنفسك."
            }
        },
        {
            prompt: {
                en: "Which part of a URL should you check to confirm a website is genuine?",
                ar: "أي جزء من الرابط يجب فحصه للتأكد من أن الموقع حقيقي؟"
            },
            options: [
                { en: "The word before the main domain, like paypal in paypal.evil.com", ar: "الكلمة قبل النطاق الأساسي، مثل paypal في paypal.evil.com" },
                { en: "The registered domain right before the extension, like example.com", ar: "النطاق المسجّل قبل الامتداد، مثل example.com" },
                { en: "The page title shown in the browser tab", ar: "عنوان الصفحة في تبويب المتصفح" },
                { en: "The length of the link", ar: "طول الرابط" }
            ],
            answer: 1,
            explanation: {
                en: "Attackers put a brand name in the subdomain to look real. The real owner is the registered domain before the extension.",
                ar: "يضع المهاجمون اسم علامة تجارية في النطاق الفرعي ليبدو حقيقياً. المالك الحقيقي هو النطاق المسجّل قبل الامتداد."
            }
        },
        {
            prompt: {
                en: "Which is the strongest password practice?",
                ar: "ما أقوى ممارسة لكلمات المرور؟"
            },
            options: [
                { en: "One very strong password reused everywhere", ar: "كلمة مرور قوية واحدة تُستخدم في كل مكان" },
                { en: "A long unique passphrase per account plus two-factor authentication", ar: "عبارة مرور طويلة وفريدة لكل حساب مع المصادقة الثنائية" },
                { en: "Your pet's name and birth year", ar: "اسم حيوانك الأليف وسنة ميلادك" },
                { en: "A short password you can remember easily", ar: "كلمة مرور قصيرة يسهل تذكّرها" }
            ],
            answer: 1,
            explanation: {
                en: "Unique passphrases stop one breach from unlocking every account, and 2FA adds a second barrier.",
                ar: "عبارات المرور الفريدة تمنع تسريباً واحداً من فتح كل حساباتك، والمصادقة الثنائية تضيف حاجزاً ثانياً."
            }
        },
        {
            prompt: {
                en: "Someone calls claiming to be from IT and urgently asks for your one-time code. What is the safest response?",
                ar: "يتصل شخص يدّعي أنه من قسم التقنية ويطلب بإلحاح رمز التحقق لمرة واحدة. ما التصرف الأكثر أماناً؟"
            },
            options: [
                { en: "Give the code, since IT needs it", ar: "أعطِه الرمز لأن قسم التقنية يحتاجه" },
                { en: "Hang up and call IT back on the official number", ar: "أغلق الخط واتصل بقسم التقنية على الرقم الرسمي" },
                { en: "Give only the first half of the code", ar: "أعطِه نصف الرمز فقط" },
                { en: "Email the code instead", ar: "أرسل الرمز بالبريد بدلاً من ذلك" }
            ],
            answer: 1,
            explanation: {
                en: "A one-time code defeats 2FA only if you share it. Real IT never asks for it, and urgency is a red flag.",
                ar: "رمز التحقق يُبطل المصادقة الثنائية فقط إذا شاركته. قسم التقنية الحقيقي لا يطلبه، والإلحاح علامة تحذير."
            }
        },
        {
            prompt: {
                en: "An unexpected email from an unknown sender includes an invoice.exe attachment. What should you do?",
                ar: "بريد غير متوقع من مُرسِل مجهول يحتوي مرفق invoice.exe. ماذا تفعل؟"
            },
            options: [
                { en: "Open it to see what it is", ar: "افتحه لترى ما هو" },
                { en: "Report it and delete it without opening", ar: "أبلغ عنه واحذفه دون فتحه" },
                { en: "Forward it to colleagues to check", ar: "أرسله لزملائك للتحقق منه" },
                { en: "Reply asking for more details", ar: "رُدّ طالباً مزيداً من التفاصيل" }
            ],
            answer: 1,
            explanation: {
                en: "Executable attachments are a common malware delivery method. Do not open unexpected ones.",
                ar: "الملفات التنفيذية وسيلة شائعة لتوصيل البرمجيات الخبيثة. لا تفتح المرفقات غير المتوقعة."
            }
        },
        {
            prompt: {
                en: "Which combination is a classic sign of a phishing email?",
                ar: "أي مزيج يُعد علامة كلاسيكية على بريد تصيّد؟"
            },
            options: [
                { en: "A generic greeting, urgent language, and a mismatched sender", ar: "تحية عامة ولغة ملحّة ومُرسِل غير متطابق" },
                { en: "Your correct name in the greeting", ar: "اسمك الصحيح في التحية" },
                { en: "A plain-text message with no images", ar: "رسالة نصية بسيطة بلا صور" },
                { en: "A message that includes a signature", ar: "رسالة تتضمن توقيعاً" }
            ],
            answer: 0,
            explanation: {
                en: "Generic greetings, manufactured urgency, and sender mismatches are hallmarks of phishing.",
                ar: "التحيات العامة والإلحاح المصطنع وعدم تطابق المُرسِل من أبرز سمات التصيّد."
            }
        },
        {
            prompt: {
                en: "A site shows a padlock and uses HTTPS. What does that mean?",
                ar: "يُظهر الموقع قفل أمان ويستخدم HTTPS. ماذا يعني ذلك؟"
            },
            options: [
                { en: "The site is definitely safe and trustworthy", ar: "الموقع آمن وموثوق بالتأكيد" },
                { en: "The connection is encrypted, but the site can still be malicious", ar: "الاتصال مشفّر، لكن الموقع قد يبقى ضاراً" },
                { en: "The site is approved by the government", ar: "الموقع معتمد من الحكومة" },
                { en: "Nothing at all", ar: "لا يعني شيئاً على الإطلاق" }
            ],
            answer: 1,
            explanation: {
                en: "HTTPS encrypts the connection. Phishing sites also use it, so check the domain itself.",
                ar: "HTTPS يشفّر الاتصال. مواقع التصيّد تستخدمه أيضاً، لذا افحص النطاق نفسه."
            }
        },
        {
            prompt: {
                en: "You get an email saying you won a prize and must submit personal details to claim it. What should you do?",
                ar: "تتلقّى رسالة تقول إنك فزت بجائزة وعليك إرسال بياناتك الشخصية لاستلامها. ماذا تفعل؟"
            },
            options: [
                { en: "Submit the details before the offer expires", ar: "أرسل البيانات قبل انتهاء العرض" },
                { en: "Reply to ask for a bigger prize", ar: "رُدّ لطلب جائزة أكبر" },
                { en: "Do not click, ignore or report the message", ar: "لا تنقر، وتجاهل الرسالة أو أبلغ عنها" },
                { en: "Share it with friends so they can win too", ar: "شاركها مع أصدقائك ليفوزوا أيضاً" }
            ],
            answer: 2,
            explanation: {
                en: "Unexpected prizes are bait. Never hand over personal details to claim them.",
                ar: "الجوائز غير المتوقعة طُعم. لا تُسلّم بياناتك الشخصية لاستلامها."
            }
        }
    ];

    const LEVELS = {
        excellent: {
            class: "result-safe",
            title: { en: "Excellent awareness", ar: "وعي ممتاز" },
            summary: {
                en: "You can spot most common phishing and social-engineering tricks.",
                ar: "تستطيع كشف معظم أساليب التصيّد والهندسة الاجتماعية الشائعة."
            }
        },
        good: {
            class: "result-low",
            title: { en: "Good awareness", ar: "وعي جيد" },
            summary: {
                en: "You recognize many warning signs, but a few answers can still be sharpened.",
                ar: "تتعرّف على العديد من العلامات التحذيرية، لكن بعض الإجابات ما زالت تحتاج تحسيناً."
            }
        },
        fair: {
            class: "result-medium",
            title: { en: "Basic awareness", ar: "وعي أساسي" },
            summary: {
                en: "You know the basics, but some risky situations could still fool you.",
                ar: "تعرف الأساسيات، لكن بعض المواقف الخطرة قد تخدعك بعد."
            }
        },
        needs: {
            class: "result-high",
            title: { en: "Needs improvement", ar: "يحتاج إلى تحسين" },
            summary: {
                en: "Several common tricks were missed. Review the recommendations below.",
                ar: "لم يتم التعرف على عدة حيل شائعة. راجع التوصيات أدناه."
            }
        }
    };

    const RECOMMENDATIONS = {
        excellent: [
            { en: "Keep two-factor authentication enabled on important accounts.", ar: "أبقِ المصادقة الثنائية مفعّلة على الحسابات المهمة." },
            { en: "Stay skeptical of unexpected messages even when they look official.", ar: "ابقَ متشككاً تجاه الرسائل غير المتوقعة حتى إن بدت رسمية." }
        ],
        good: [
            { en: "Slow down before clicking links in unexpected emails.", ar: "تمهّل قبل النقر على روابط في رسائل غير متوقعة." },
            { en: "Verify the real domain, not the display name.", ar: "تحقق من النطاق الحقيقي، وليس الاسم الظاهر." }
        ],
        fair: [
            { en: "Never share passwords or one-time codes by email or phone.", ar: "لا تشارك كلمات المرور أو رموز التحقق عبر البريد أو الهاتف." },
            { en: "Reach services through official apps or addresses you type yourself.", ar: "ادخل إلى الخدمات عبر تطبيقاتها الرسمية أو عناوين تكتبها بنفسك." }
        ],
        needs: [
            { en: "Treat urgent requests for credentials as phishing by default.", ar: "تعامل مع الطلبات الملحّة لبيانات الدخول كتصيّد افتراضياً." },
            { en: "Turn on two-factor authentication and use unique passwords.", ar: "فعّل المصادقة الثنائية واستخدم كلمات مرور فريدة." },
            { en: "When in doubt, contact the organization through a known official channel.", ar: "عند الشك، تواصل مع الجهة عبر قناة رسمية معروفة." }
        ]
    };

    const UI = {
        en: {
            question: "QUESTION {n} / {total}",
            correct: "Correct",
            incorrect: "Incorrect",
            correctAnswer: "Correct answer",
            next: "NEXT QUESTION",
            seeResults: "SEE RESULTS",
            score: "Your score",
            correctCount: "{c} of {t} correct",
            review: "Review incorrect answers",
            recommendations: "Practical recommendations",
            restart: "TRY AGAIN"
        },
        ar: {
            question: "السؤال {n} / {total}",
            correct: "إجابة صحيحة",
            incorrect: "إجابة خاطئة",
            correctAnswer: "الإجابة الصحيحة",
            next: "السؤال التالي",
            seeResults: "عرض النتيجة",
            score: "نتيجتك",
            correctCount: "{c} من {t} صحيحة",
            review: "مراجعة الإجابات الخاطئة",
            recommendations: "توصيات عملية",
            restart: "حاول مرة أخرى"
        }
    };

    function calculateScore(answers) {
        const total = QUESTIONS.length;
        const correct = QUESTIONS.reduce(
            (sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0),
            0
        );
        return {
            correct: correct,
            total: total,
            percent: total ? Math.round((correct / total) * 100) : 0
        };
    }

    function awarenessLevel(percent) {
        if (percent >= 85) return "excellent";
        if (percent >= 65) return "good";
        if (percent >= 45) return "fair";
        return "needs";
    }

    global.PhishStrikeQuiz = {
        QUESTIONS: QUESTIONS,
        calculateScore: calculateScore,
        awarenessLevel: awarenessLevel
    };

    if (typeof document === "undefined") {
        return;
    }


    const body = document.getElementById("quizBody");

    if (!body) {
        return;
    }

    const progress = document.getElementById("quizProgress");
    const progressBar = document.getElementById("quizProgressBar");

    let currentLanguage = document.documentElement.lang === "ar" ? "ar" : "en";
    let current = 0;
    let locked = false;
    let finished = false;
    let answers = new Array(QUESTIONS.length).fill(null);

    function fill(text, values) {
        return text.replace(/\{(\w+)\}/g, (match, key) => values[key]);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function renderQuestion() {
        const t = UI[currentLanguage];
        const question = QUESTIONS[current];

        progress.textContent = fill(t.question, { n: current + 1, total: QUESTIONS.length });
        progressBar.style.width = `${((current + 1) / QUESTIONS.length) * 100}%`;

        const options = question.options.map((option, index) => {
            let classes = "quiz-option";

            if (locked) {
                if (index === question.answer) {
                    classes += " correct";
                } else if (index === answers[current]) {
                    classes += " wrong";
                }
            }

            return `
                <button type="button" class="${classes}" data-index="${index}"${locked ? " disabled" : ""}>
                    <span class="quiz-option-marker">${String.fromCharCode(65 + index)}</span>
                    <span>${escapeHtml(option[currentLanguage])}</span>
                </button>
            `;
        }).join("");

        let feedback = "";

        if (locked) {
            const isCorrect = answers[current] === question.answer;
            feedback = `
                <div class="quiz-feedback ${isCorrect ? "is-correct" : "is-wrong"}">
                    <strong>${isCorrect ? t.correct : t.incorrect}</strong>
                    <p>${escapeHtml(question.explanation[currentLanguage])}</p>
                </div>
                <button type="button" class="scan-button quiz-next">
                    <span>${current < QUESTIONS.length - 1 ? t.next : t.seeResults}</span>
                    <span class="button-arrow">→</span>
                </button>
            `;
        }

        body.innerHTML = `
            <p class="quiz-prompt">${escapeHtml(question.prompt[currentLanguage])}</p>
            <div class="quiz-options">${options}</div>
            ${feedback}
        `;
    }

    function renderResult() {
        const t = UI[currentLanguage];
        const result = calculateScore(answers);
        const level = awarenessLevel(result.percent);
        const info = LEVELS[level];

        const incorrect = QUESTIONS
            .map((question, index) => ({ question: question, index: index }))
            .filter((item) => answers[item.index] !== item.question.answer)
            .map((item) => `
                <li>
                    <span class="quiz-review-prompt">${escapeHtml(item.question.prompt[currentLanguage])}</span>
                    <span class="quiz-review-answer">${t.correctAnswer}: ${escapeHtml(item.question.options[item.question.answer][currentLanguage])}</span>
                </li>
            `).join("");

        const review = incorrect
            ? `<div class="quiz-review"><h3>${t.review}</h3><ul>${incorrect}</ul></div>`
            : "";

        body.innerHTML = `
            <div id="result" class="result-card ${info.class}">
                <div id="riskBadge" class="risk-badge">${info.title[currentLanguage]} · ${result.percent}%</div>
                <h2 id="resultTitle">${t.score}: ${result.correct}/${result.total}</h2>
                <p id="indicatorCount">${info.summary[currentLanguage]}</p>
                ${review}
                <div id="recommendations">
                    <h3>${t.recommendations}</h3>
                    <ul>${RECOMMENDATIONS[level].map((r) => `<li>${escapeHtml(r[currentLanguage])}</li>`).join("")}</ul>
                </div>
                <button type="button" class="scan-button quiz-restart">
                    <span>${t.restart}</span>
                    <span class="button-arrow">↻</span>
                </button>
            </div>
        `;

        progress.textContent = fill(t.correctCount, { c: result.correct, t: result.total });
        progressBar.style.width = "100%";
    }

    function render() {
        if (finished) {
            renderResult();
        } else {
            renderQuestion();
        }
    }

    function selectOption(index) {
        answers[current] = index;
        locked = true;
        render();
    }

    function goNext() {
        if (current < QUESTIONS.length - 1) {
            current += 1;
            locked = false;
        } else {
            finished = true;
        }
        render();
    }

    function restart() {
        current = 0;
        locked = false;
        finished = false;
        answers = new Array(QUESTIONS.length).fill(null);
        render();
    }

    body.addEventListener("click", (event) => {
        const option = event.target.closest(".quiz-option");

        if (option && !locked && !finished) {
            selectOption(Number(option.dataset.index));
            return;
        }

        if (event.target.closest(".quiz-next")) {
            goNext();
            return;
        }

        if (event.target.closest(".quiz-restart")) {
            restart();
        }
    });

    document.addEventListener("languagechange", (event) => {
        currentLanguage = event.detail.language;
        render();
    });

    render();

})(typeof globalThis !== "undefined" ? globalThis : this);
