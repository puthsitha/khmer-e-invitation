---
name: frontend-design
description: Khmer E-Invitation's visual system — Khmer-ness motifs, typography pairing, Framer Motion animation conventions, and responsive/mobile-first breakpoints. Consult before building or restyling any UI component so visual decisions stay consistent across sections and templates.
---

# Frontend Design — Khmer E-Invitation

Consult this skill before writing or restyling any component (viewer sections, dashboard/admin UI, template variants). It encodes the project's visual system so decisions stay consistent across the whole app rather than being reinvented per component.

## Khmer-ness motifs

- **Temple silhouettes**: Angkor-style spires/roofline motifs as decorative dividers, section-top/bottom borders, or background watermarks — never as the dominant visual weight, they accent.
- **Ornamental borders**: use repeating Khmer-inspired border patterns (lotus, naga, roundel motifs) around invitation text blocks and cards, not on every element — reserve for formal/ceremonial sections (Family & Invitation Text, Gratitude & Apology, Closing).
- **Default palette — Royal Gold**: gold (`--color-gold` `#c9a24b`), maroon (`--color-maroon` `#7a1f2b`), cream (`--color-cream` `#fdf8f0`). These are the CSS variables already wired in `src/app/[locale]/globals.css` / Tailwind theme — use `bg-gold`, `text-maroon`, `bg-cream`, etc.
- **Template picker variants** (build as alternates on top of the default, not replacements): "Royal Gold" (default, above), "Blush Temple" (dusty rose + gold + ivory), "Modern Minimal Khmer" (charcoal/ivory with a single gold accent, motifs reduced to line-art). Each variant is a palette + motif-density swap, not a different layout.

## Typography pairing

- **Khmer heading**: `Moul` (`--font-heading-km` / `var(--font-moul)`) — a bold, temple-inscription-style display face. Use only for large headings (couple names, occasion title, closing sign-off). Never for body text — it's illegible at small sizes/long strings.
- **Khmer body**: `Kantumruy Pro` (`--font-body-km` / `var(--font-kantumruy)`) — clean, readable Khmer body face. Use for paragraphs, labels, buttons in the `km` locale.
- **Latin heading**: `Playfair Display` (`--font-heading-en` / `var(--font-playfair)`) — elegant serif, pairs with the formality of `Moul`.
- **Latin body**: `Inter` (`--font-body-en` / `var(--font-inter)`) — clean, neutral, high legibility.
- Always pair a display/heading face with a plain body face in the *same* locale family; don't mix a Khmer heading with a Latin body font or vice versa within one language's text block.

## Framer Motion conventions

- **Feel**: slow and smooth, never snappy or bouncy — this is a formal/sentimental product, not a SaaS dashboard.
- **Durations**: 0.6–1.2s for section/scroll reveals, 0.3–0.5s only for small interactive feedback (button hover/tap). The envelope-opening sequence and hero entrance may run longer (1.2–2s) as a deliberate "moment."
- **Easing**: prefer `easeOut` for entrances (fast start, gentle settle), `easeInOut` for looping/ambient motion (countdown ticks, floating decorative elements). Avoid spring physics with high bounce — light springs only, if any.
- **Scroll-reveal pattern**: fade + rise (`opacity: 0 → 1`, `y: 24 → 0`), triggered on viewport entry (`whileInView`, `viewport={{ once: true }}`) so replays don't happen on scroll-back for ceremonial sections.
- **Respect reduced motion**: honor `prefers-reduced-motion` — fall back to a simple opacity fade with no translation/scale when set.

## Responsive / mobile-first

- Design and build mobile-first: most guests open invitations from a shared link on a phone. Start unprefixed (mobile) Tailwind classes, layer `sm:`/`md:`/`lg:` for larger viewports.
- Full-viewport sections (hero, envelope) use `min-h-screen` and must avoid layout shift — reserve space for video/image before it loads (aspect-ratio boxes, poster images).
- Keep tap targets ≥44px, and keep ornamental motifs from overlapping tap targets or truncating text at narrow widths (test at ~360px width minimum).
