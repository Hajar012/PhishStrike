# PhishStrike — Development Plan v2

**Version:** 2.0  
**Date:** September 14, 2026  
**Project:** PhishStrike — Bilingual Email Security Tool  
**Purpose:** Working development reference and implementation plan

---

## 1. Purpose of Version 2

This version updates the original development plan after the team approved additional features.

The **original project concept remains unchanged**. The new features extend the system rather than replacing its core purpose.

This document is intended to be both:
- a practical project-management reference; and
- a technical reference for development and coding agents.

### Baseline principle

> Build the original system correctly first. Then extend it with the approved features. Do not introduce unrelated complexity.

---

# 2. Original Project Baseline

PhishStrike is a bilingual web-based cybersecurity tool that allows a user to:

1. Enter an email address.
2. Validate the email format.
3. Check the email against known breach information.
4. Process available breach metadata.
5. Calculate a transparent, rule-based security risk.
6. Display the result and relevant breach details.
7. Provide security recommendations.
8. Support Arabic and English with RTL/LTR behavior.
9. Protect user privacy by avoiding passwords and permanent storage of scan data.

### Technology baseline

| Component | Baseline |
|---|---|
| Frontend | HTML / CSS / JavaScript |
| UI Framework | Bootstrap 5 may be used for UI components |
| Backend | Python + Flask |
| Breach source | Have I Been Pwned (HIBP) API |
| Storage | No permanent storage of scan emails/results |
| API key | Server-side environment variable |
| Development | GitHub + Figma |

The SRS states that AI/LLM is **not required** for breach determination or risk calculation.

---

# 3. Current Project Status

The following core work has already been implemented:

- [x] Project structure and Flask application
- [x] Email input
- [x] Email format validation
- [x] HIBP API integration
- [x] Server-side API key configuration
- [x] Successful breach lookup
- [x] No-breach response handling
- [x] Breach metadata returned by the backend
- [x] Breach details displayed in the frontend
- [x] Breach count
- [x] Breach date
- [x] Affected account count
- [x] Exposed data classes
- [x] Breach description
- [x] Security recommendations
- [x] Initial Low / Medium / High classification
- [x] Major UI enhancement
- [x] Dark cybersecurity-themed interface
- [x] Responsive layout foundation
- [x] Arabic / English language foundation
- [x] RTL / LTR direction switching

### Remaining current work

- [ ] Translate API-provided breach metadata into Arabic
- [ ] Verify complete Arabic/LTR/RTL behavior
- [x] Replace the temporary/simple risk classification with the SRS-defined risk engine
- [ ] Complete security hardening and testing
- [ ] Implement the newly approved features
- [ ] Final UI polish and cross-page consistency
- [ ] Final testing and documentation
- [ ] Update the SRS after the final implementation is stable

---

# 4. Approved Project Update

After the core breach-checking system was implemented, the team approved three major feature additions.

These features extend the original project and significantly increase its functionality.

## 4.1 Phishing Email Analyzer

The system will allow a user to provide suspicious email content and analyze it for phishing indicators.

Expected output may include:

- Suspicious language or urgency
- Requests for credentials or sensitive information
- Sender-related indicators when sender information is provided
- Social-engineering indicators
- Suspicious links contained in the email
- An overall phishing-risk level
- Clear explanations of detected indicators
- Recommended actions

The analyzer should be understandable to non-technical users.

**Scope rule:** This feature is not automatic mailbox monitoring. The user explicitly provides the email content for analysis.

---

## 4.2 Suspicious URL Checker

The system will allow a user to submit a URL and analyze it for suspicious indicators.

Expected output may include:

- URL structure analysis
- HTTP vs HTTPS
- IP-address-based URLs
- Suspicious subdomain patterns
- Unusual URL length
- Excessive query parameters
- Encoded or obfuscated components
- Suspicious characters
- Domain/hostname characteristics
- Overall risk level and explanation

**Security rule:** The initial implementation should analyze the URL as a string and should not automatically open or execute arbitrary user-provided URLs.

External reputation services may be considered later if genuinely required.

---

## 4.3 Security Awareness Quiz

The system will provide a short interactive quiz focused on:

- Phishing awareness
- Suspicious links
- Password safety
- Social engineering
- Basic email-security behavior

Expected output:

- Score
- Awareness level
- Short explanation
- Practical recommendations

The quiz should be lightweight and educational rather than a formal cybersecurity certification.

---

# 5. UI / Navigation Expansion

The original single-page interface was appropriate for the initial email-checking feature.

Because the project now contains several independent security tools, the interface should be expanded into a clear multi-page experience.

### Planned navigation

- Home / Email Security Check
- Phishing Email Analyzer
- URL Checker
- Security Awareness Quiz

The navigation should remain:

- Professional
- Creative but appropriate for a graduation project
- Cybersecurity themed
- Responsive
- Available in Arabic and English

The visual identity should remain consistent across all pages.

---

# 6. Development Sequence

## Step 1 — Finish Current Core Work

### Goal

Close the remaining issues in the existing email-security workflow before building new features.

### Tasks

- Complete Arabic translation of HIBP metadata.
- Verify RTL layout for result cards and descriptions.
- Verify Arabic recommendations.
- Test no-breach and breach cases in both languages.
- Confirm external-service errors are not shown as "safe."
- Clean temporary frontend/backend code where necessary.

### Completion condition

The existing email-checking workflow works correctly in both Arabic and English.

---

# 7. Risk Assessment Implementation

The current Low / Medium / High display is a **temporary classification**.

It must eventually be replaced by the rule-based risk engine defined in the SRS.

## Risk factors

| Factor | Weight |
|---|---:|
| Recency | 30% |
| Sensitivity | 35% |
| Frequency | 20% |
| Exposure Type | 15% |

Each factor receives a score from 0–10.

### Formula

`Risk Score = (0.30 × R + 0.35 × S + 0.20 × F + 0.15 × E) × 10`

The resulting score is 0–100.

### Risk levels

| Score | Level |
|---:|---|
| 0–20 | Safe |
| 21–40 | Low |
| 41–60 | Medium |
| 61–80 | High |
| 81–100 | Critical |

These thresholds are project-defined rules and should be validated using controlled test cases.

### Important implementation rule

**No AI/LLM should decide the breach status or risk score.**

The calculation must remain deterministic and reproducible.

---

# 8. Phishing Email Analyzer Implementation

### Goal

Create a dedicated page where the user can paste suspicious email content and receive an understandable phishing-risk analysis.

### Initial implementation approach

Prefer a rule-based analyzer first.

Possible indicators:

- Urgent language
- Requests for passwords or sensitive information
- Suspicious calls to action
- Requests to verify accounts
- Threatening language
- Suspicious sender/domain patterns when sender information is provided
- Suspicious links contained in the email
- Excessive urgency or reward language

### Output

The analyzer should return:

- Risk level
- Risk score or indicator count where appropriate
- Detected indicators
- Explanation
- Recommended action

### Development rule

Do not add an AI model simply because the feature is called an analyzer.

AI/LLM can be considered later as an **optional advisory component**, but it must not replace deterministic security controls.

---

# 9. Suspicious URL Checker Implementation

### Goal

Create a dedicated page where users can paste a URL and receive a structured safety analysis.

### Initial implementation approach

Use deterministic URL parsing and validation.

Potential checks:

- Valid URL structure
- HTTP vs HTTPS
- IP address used instead of a domain
- Suspicious subdomain patterns
- Unusual URL length
- Excessive query parameters
- Encoded or obfuscated components
- Suspicious characters
- Domain/hostname characteristics

### Output

- Overall risk level
- Detected indicators
- Explanation
- Recommended action

### Security rule

Do not automatically open or execute arbitrary user-provided URLs.

The first implementation should analyze the URL as a string.

---

# 10. Security Awareness Quiz Implementation

### Goal

Provide a lightweight interactive educational feature.

### Tasks

- Create a small question bank.
- Display questions in a clean interactive layout.
- Support Arabic and English.
- Calculate the score locally.
- Show the final awareness level.
- Explain incorrect answers.
- Provide practical security recommendations.

### Privacy

The quiz does not need an account or database.

The score can remain temporary and client-side unless a future requirement changes this.

---

# 11. Security & Privacy Requirements

Security is part of the implementation, not a final cosmetic step.

## API protection

- Keep HIBP API keys server-side.
- Store secrets in environment variables.
- Never place API keys in JavaScript/frontend source.
- Never commit secrets to GitHub.

## Input security

Validate all user input server-side.

This applies to:

- Email addresses
- Email content
- URLs
- API request data

## Rate limiting

Maintain reasonable request throttling to reduce abuse and excessive external API usage.

## Safe errors

Do not expose:

- Stack traces
- API keys
- Internal configuration
- Sensitive backend information

## Privacy

The application should:

- Never request email passwords.
- Never request login credentials.
- Avoid unnecessary personal information.
- Avoid permanent storage of scan emails/results.
- Process scan information temporarily.

## Transport security

Production deployment should use HTTPS/TLS.

---

# 12. Localization

Arabic and English must provide equivalent functionality.

This includes:

- Navigation
- Page titles
- Buttons
- Validation messages
- Results
- Risk levels
- Recommendations
- Phishing indicators
- URL indicators
- Quiz questions
- Quiz results
- Error messages

### HIBP metadata translation

HIBP descriptions and metadata are returned by the external API and may contain English text.

The project should not rely on translating arbitrary API HTML directly.

Instead:

1. Keep the original API data structured.
2. Sanitize/normalize description content before display.
3. Provide project-controlled Arabic translations where practical.
4. Preserve unknown or unavailable values safely.
5. Never invent breach facts that are not present in the API response.

---

# 13. UI/UX Development Rules

The visual direction should remain:

- Dark cybersecurity theme
- Professional but creative
- Student-project character
- Strong visual hierarchy
- Clear distinction between risk levels
- Smooth but restrained animations
- Responsive
- Accessible to technical and non-technical users

### Risk visualization

Use clearly distinguishable visual states for:

- Safe
- Low
- Medium
- High
- Critical

Avoid relying only on color. Use labels, icons, text explanations, and consistent visual hierarchy.

---

# 14. Testing Plan

Testing should happen continuously rather than only at the end.

## Email Security Check

Test:

- Valid email
- Invalid email
- Empty input
- Known breach
- Multiple breaches
- No known breach
- Missing metadata
- HIBP/API failure
- API timeout
- Rate-limit behavior
- Arabic
- English
- Mobile layout

## Risk Engine

Create controlled test cases for:

- Safe
- Low
- Medium
- High
- Critical

Verify that the same input always produces the same score.

## Phishing Analyzer

Test:

- Normal email
- Obvious phishing email
- Urgent message
- Credential request
- Mixed indicators
- Empty input
- Long input
- Arabic content
- English content

## URL Checker

Test:

- Normal HTTPS URL
- HTTP URL
- IP-based URL
- Long URL
- Suspicious-looking URL
- Invalid URL
- Empty input
- Encoded URL components

## Quiz

Test:

- Correct answers
- Incorrect answers
- Score calculation
- Arabic/English switching
- Mobile layout

---

# 15. Finalization

Before the project is considered complete:

- [ ] All approved features work.
- [ ] Risk engine follows the documented rules.
- [ ] Arabic and English are complete.
- [ ] RTL/LTR behavior is correct.
- [ ] Security controls are tested.
- [ ] No API keys/secrets are committed.
- [ ] No unnecessary persistent user data is stored.
- [ ] Error handling is safe.
- [ ] Desktop and mobile layouts are tested.
- [ ] Major bugs are fixed.
- [ ] Code is cleaned and organized.
- [ ] README is updated.
- [ ] SRS is updated to match the final implementation.
- [ ] Final demonstration is prepared.

---

# 16. Completion Criteria

PhishStrike is complete when the original email-security workflow and the three approved extensions work together as one coherent system.

The final system should provide:

**Email Security Check → Risk Assessment → Breach Details → Recommendations**

**Phishing Email Analyzer → Indicators → Risk → Recommendations**

**URL Checker → Indicators → Risk → Recommendations**

**Security Awareness Quiz → Score → Awareness Level → Guidance**

All major functionality should be available in Arabic and English and follow the project's security/privacy requirements.

---

# 17. Development Rules for Future Work

### Rule 1 — Do not change the project concept

New implementation should extend PhishStrike rather than turn it into a different product.

### Rule 2 — Follow the plan

Do not jump between unrelated features.

### Rule 3 — Prefer simple solutions

If a feature can be implemented reliably without AI, a database, or another external service, prefer the simpler solution.

### Rule 4 — Security before appearance

A feature is not complete just because it looks good.

### Rule 5 — Do not invent data

External breach information must come from the configured source. Missing metadata should be handled consistently.

### Rule 6 — AI is optional

AI/LLM is not required for the current project.

If introduced later, it must be advisory and must not override deterministic security decisions.

### Rule 7 — Protect privacy

Never request or store passwords or email login credentials.

### Rule 8 — Keep components modular

Breach checking, risk calculation, localization, URL analysis, phishing analysis, and UI components should remain separated enough to be maintained independently.

### Rule 9 — Update status

When completing a task, update this plan rather than relying on memory.

### Rule 10 — Final SRS comes last

Do not continuously rewrite the SRS during implementation.

Update it after the final functionality and requirements have stabilized.

---

# 18. Practical Work Order

The recommended implementation order is:

1. **Finish Arabic HIBP metadata translation**
2. **Complete localization and RTL/LTR testing**
3. **Implement the SRS risk engine**
4. **Build the shared header/navigation**
5. **Create the Phishing Email Analyzer**
6. **Create the Suspicious URL Checker**
7. **Create the Security Awareness Quiz**
8. **Connect and standardize all result/risk components**
9. **Perform security hardening**
10. **Perform full functional/UI/security testing**
11. **Polish the final UI**
12. **Update README and SRS**
13. **Prepare final demonstration and project documentation**

---

# 19. Timeline

The original development plan estimated approximately **12–18 days** for the initial system.

Because the scope has now expanded, that original timeline should be treated as the baseline for the original scope rather than a strict deadline for the expanded version.

A practical implementation order is more important than assigning artificial dates to each feature.

The final schedule can be adjusted according to actual team progress.

---

# 20. Single Source of Truth

This document should be used as the primary development reference after Version 2.

When a coding agent is used, provide this plan together with the relevant source files and ask the agent to:

1. Read the project structure.
2. Read this development plan.
3. Identify the current status.
4. Work only on the requested task.
5. Avoid changing completed functionality unnecessarily.
6. Test the affected feature.
7. Report what changed and what remains.

The agent should not assume that an item is complete simply because it exists in the codebase. It should verify the current implementation before modifying it.

---

## Reference Documents

- `PhishStrike_SRS.pdf` — requirements baseline and acceptance criteria.
- `PhishStrike_Project_Development_Plan.md` — original development plan.
- `PhishStrike_Project_Development_Plan_v2.md` — this updated implementation plan.

---

**End of Development Plan v2**
