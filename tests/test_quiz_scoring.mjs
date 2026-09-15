// Lightweight self-check for the Security Awareness Quiz logic.
//
// Run with:  node tests/test_quiz_scoring.mjs
// Loads the pure logic from static/js/quiz.js (the DOM init is skipped in Node).

await import(new URL("../static/js/quiz.js", import.meta.url));

const quiz = globalThis.PhishStrikeQuiz;
const { QUESTIONS, calculateScore, awarenessLevel } = quiz;

let passed = 0;

function check(name, condition) {
    if (!condition) {
        throw new Error(`FAIL  ${name}`);
    }
    passed += 1;
    console.log(`PASS  ${name}`);
}

check("question bank is present", Array.isArray(QUESTIONS) && QUESTIONS.length >= 5);

for (const [index, question] of QUESTIONS.entries()) {
    check(`q${index + 1} has a valid answer index`,
        Number.isInteger(question.answer) &&
        question.answer >= 0 &&
        question.answer < question.options.length);
    check(`q${index + 1} has bilingual prompt/explanation`,
        question.prompt.en && question.prompt.ar &&
        question.explanation.en && question.explanation.ar);
    check(`q${index + 1} has at least two bilingual options`,
        question.options.length >= 2 &&
        question.options.every((o) => o.en && o.ar));
}

const total = QUESTIONS.length;

const allCorrect = QUESTIONS.map((q) => q.answer);
const allWrong = QUESTIONS.map((q) => (q.answer + 1) % q.options.length);
const halfCorrect = QUESTIONS.map((q, i) => (i < Math.floor(total / 2) ? q.answer : allWrong[i]));

check("all correct scores 100%", calculateScore(allCorrect).percent === 100);
check("all wrong scores 0%", calculateScore(allWrong).percent === 0);
check("unanswered counts as wrong",
    calculateScore(new Array(total).fill(null)).correct === 0);
check("partial score counts correct answers",
    calculateScore(halfCorrect).correct === Math.floor(total / 2));

check("100% is excellent", awarenessLevel(100) === "excellent");
check("85% is excellent", awarenessLevel(85) === "excellent");
check("84% is good", awarenessLevel(84) === "good");
check("65% is good", awarenessLevel(65) === "good");
check("64% is fair", awarenessLevel(64) === "fair");
check("45% is fair", awarenessLevel(45) === "fair");
check("44% needs improvement", awarenessLevel(44) === "needs");
check("0% needs improvement", awarenessLevel(0) === "needs");

console.log(`\n${passed} checks passed.`);
