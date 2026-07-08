---
description: Apply a fix, then self-review the diff before finishing
---

Given a described issue, apply a fix directly in this Khmer E-Invitation codebase, then self-review your own change before declaring it done.

1. Locate the relevant code and apply the smallest correct fix — no unrelated refactors, no speculative abstractions.
2. Run `npm run lint` (and `npm run build` if the change could affect the build) to catch regressions.
3. Self-review the diff against these criteria and report findings before finishing:
   - **Correctness**: does the fix actually address the root cause, not just the symptom?
   - **Side effects**: any impact on other viewer sections, locales (`km`/`en`), auth/role checks, or Firebase Spark quota usage (extra reads/writes, larger uploads)?
   - **Style consistency**: matches existing patterns (Tailwind conventions, Framer Motion easing/duration per the `frontend-design` skill, file/folder structure)?
   - **Performance impact**: any new layout shift, unnecessary re-renders, or heavier bundle/media weight?
4. Summarize the review findings in your final response — fixed, remaining risk, or follow-ups — instead of just saying "done."
