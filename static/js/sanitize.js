(function (global) {
    "use strict";

    function escapeHtml(value) {
        return String(value === undefined || value === null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    var ALLOWED_TAGS = {
        a: true, p: true, br: true, ul: true, ol: true, li: true,
        strong: true, em: true, b: true, i: true
    };

    var DROP_CONTENT = /<\s*(script|style|iframe|object|embed|noscript|template|svg|math|form)[\s\S]*?<\s*\/\s*\1\s*>/gi;

    function sanitizeHref(value) {
        var href = String(value === undefined || value === null ? "" : value).trim();
        return /^https?:\/\//i.test(href) ? href : "";
    }

    function extractHref(token) {
        var match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(token);
        return match ? (match[1] || match[2] || match[3] || "") : "";
    }

    function renderTag(token) {
        var closing = /^<\s*\//.test(token);
        var nameMatch = /^<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/.exec(token);
        var tag = nameMatch ? nameMatch[1].toLowerCase() : "";

        if (!tag || !ALLOWED_TAGS[tag]) {
            return "";
        }
        if (closing) {
            return tag === "br" ? "" : "</" + tag + ">";
        }
        if (tag === "br") {
            return "<br>";
        }
        if (tag === "a") {
            var href = sanitizeHref(extractHref(token));
            if (!href) {
                return "";
            }
            return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">';
        }
        return "<" + tag + ">";
    }

    function sanitizeDescription(value) {
        var raw = String(value === undefined || value === null ? "" : value);
        raw = raw.replace(DROP_CONTENT, " ");

        var output = "";
        var tagPattern = /<[^>]*>/g;
        var lastIndex = 0;
        var match;

        while ((match = tagPattern.exec(raw)) !== null) {
            output += escapeHtml(raw.slice(lastIndex, match.index));
            output += renderTag(match[0]);
            lastIndex = tagPattern.lastIndex;
        }
        output += escapeHtml(raw.slice(lastIndex));

        return output;
    }

    global.PhishStrikeSanitize = {
        escapeHtml: escapeHtml,
        sanitizeHref: sanitizeHref,
        sanitizeDescription: sanitizeDescription
    };
})(typeof globalThis !== "undefined" ? globalThis : this);
