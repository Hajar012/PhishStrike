// Lightweight self-check for the shared output sanitizer.
//
// Run with:  node tests/test_sanitize.mjs
// Loads the pure helpers from static/js/sanitize.js.

await import(new URL("../static/js/sanitize.js", import.meta.url));

const { escapeHtml, sanitizeHref, sanitizeDescription } = globalThis.PhishStrikeSanitize;

let passed = 0;

function check(name, condition) {
    if (!condition) {
        throw new Error(`FAIL  ${name}`);
    }
    passed += 1;
    console.log(`PASS  ${name}`);
}

// --- escapeHtml ---

check("escapeHtml neutralizes < > & \" '",
    escapeHtml(`<b>&"'</b>`) === "&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;");
check("escapeHtml handles null/undefined",
    escapeHtml(null) === "" && escapeHtml(undefined) === "");
check("escapeHtml keeps plain text readable",
    escapeHtml("Account support") === "Account support");

// --- sanitizeHref ---

check("sanitizeHref accepts https", sanitizeHref("https://example.com/a") === "https://example.com/a");
check("sanitizeHref accepts http", sanitizeHref("http://example.com") === "http://example.com");
check("sanitizeHref rejects javascript:", sanitizeHref("javascript:alert(1)") === "");
check("sanitizeHref rejects data:", sanitizeHref("data:text/html,x") === "");
check("sanitizeHref rejects relative", sanitizeHref("/login") === "");

// --- sanitizeDescription: XSS payloads ---

const script = sanitizeDescription("<script>alert('xss')</script>");
check("description drops script content", !script.includes("<script") && !script.includes("alert"));

const img = sanitizeDescription('<img src=x onerror="alert(1)">');
check("description drops event-handler tags", !img.includes("<img") && !img.includes("onerror"));

const jsLink = sanitizeDescription('<a href="javascript:alert(1)">click</a>');
check("description rejects javascript: links", !jsLink.includes("javascript:") && jsLink.includes("click"));

const onAttr = sanitizeDescription('<a href="https://example.com" onclick="steal()">ok</a>');
check("description strips attributes except safe href",
    onAttr.includes('href="https://example.com"') && !onAttr.includes("onclick"));

const unfiltered = sanitizeDescription("<div><b>bold</b> text</div>");
check("description unwraps disallowed tags but keeps text",
    unfiltered.includes("<b>bold</b>") && unfiltered.includes("text") && !unfiltered.includes("<div"));

const svg = sanitizeDescription("<svg onload=alert(1)></svg>payload");
check("description removes svg payload", !svg.includes("<svg") && svg.includes("payload"));

const attrBreakout = sanitizeDescription('<a href="https://ok.com" title="x> <script>alert(1)</script>">y</a>');
check("description survives attribute breakout attempt",
    !attrBreakout.includes("<script") && attrBreakout.includes('href="https://ok.com"'));

const entity = sanitizeDescription("AT&T <p>text</p>");
check("description escapes stray ampersands", entity.includes("AT&amp;T"));

const hibpLike = sanitizeDescription(
    '<p>This breach affected accounts. <a href="https://example.org/report">Read the report</a>.</p>'
);
check("description preserves safe HIBP-style markup",
    hibpLike.includes("<p>") && hibpLike.includes('href="https://example.org/report"') &&
    hibpLike.includes("Read the report"));

console.log(`\n${passed} checks passed.`);
