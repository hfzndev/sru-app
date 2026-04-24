@./skills/caveman/SKILL.md
@./skills/caveman-commit/SKILL.md
@./skills/caveman-review/SKILL.md
@./skills/caveman-compress/SKILL.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SRU APP - AGENT WORKFLOW RULES
## 1. ADVISORY FIRST (CRITICAL)
- **DO NOT autonomously edit files or run execute commands** unless the user explicitly tells you to "Execute" or "Update the code".
- Provide step-by-step, copy-pasteable instructions instead. Wait for the user's manual modifications.
## 2. API POLLING SAFETY
- **Never place network fetching** (`fetch()`) inside a `setInterval`, `useEffect` loop, or cron logic on the frontend without extreme scrutiny. Prefer fetching ONCE on mount, then utilizing local mathematical UI recalculations to avoid server hammering.
## 3. TIMEZONE SAFEGUARDS (UTC+7 WIB)
- All shift generation, predictions, and date queries must precisely account for Indonesian Local Time. Never rely on the default JS `Date` object without manually verifying it hasn't rolled over to yesterday due to UTC offset. Focus on YYYY-MM-DD passing.
## 4. UI/UX INTEGRITY
- Stick firmly to the Dark Theme aesthetic.
- Prioritize updating `page.module.css` instead of dropping haphazard inline `style={{ ... }}` into React components.
- Rely perfectly on CSS properties from `globals.css` (e.g. `var(--black2)`, `var(--yellow)`, `var(--font-jakarta)`). Never use standard blue/red/green or generic fonts.

