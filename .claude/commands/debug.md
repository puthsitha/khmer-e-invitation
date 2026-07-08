---
description: Investigate a bug and propose a fix without applying it
---

Given a bug description or stack trace from the user, investigate this Khmer E-Invitation codebase and get to the root cause before proposing anything.

1. Read the bug description/stack trace carefully. Identify the affected route, component, Firestore/Storage interaction, or animation sequence.
2. Search the relevant files (viewer sections, dashboard/admin routes, `src/lib/firebase/*`, `src/i18n/*`, Firestore/Storage security rules) to understand current behavior.
3. Reproduce or explain the root cause with reference to specific `file:line` locations. Consider edge cases relevant to this project: Firebase Spark quota limits, autoplay/audio policies, locale routing (`km`/`en`), and animation/scroll interactions.
4. Propose a concrete fix (describe the change, don't apply it yet).
5. Stop and wait for the user to confirm before editing any files.

Do not apply the fix until the user explicitly approves it.
