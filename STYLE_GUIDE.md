# STYLE_GUIDE.md — Brand & Design System

This file defines the visual language, tone, and component conventions for this project.
Claude Code should follow these guidelines when generating any UI, copy, or component code.

---

## Design Goals

The UI should feel:

- **Warm** — approachable, never cold or clinical
- **Optimistic** — positive framing, forward-looking
- **Human** — personal, not corporate
- **Playful** — light touches of personality without being silly
- **Clear and practical** — easy to use, no unnecessary complexity

---

## Color Tokens

Define these as CSS custom properties in your global stylesheet or Tailwind config:

```css
--color-primary:           #E1446F;
--color-secondary:         #8FD3E8;
--color-accent:            #F2D34F;
--color-success:           #96C85B;
--color-surface-soft-yellow: #F9E78B;
--color-surface-soft-blue:   #BEE6F2;
--color-text-primary:      #111111;
--color-background:        #FFFDF8;
```

- Use `--color-background` (`#FFFDF8`) as the default page background — warm off-white, never pure white or dark.
- Use `--color-text-primary` (`#111111`) for body text — soft near-black, not harsh pure black.
- `--color-primary` is the main action colour (buttons, links, key highlights).
- `--color-accent` and surface colours are for cards, tags, and background sections — not dominant surfaces.

---

## Typography

| Role | Style |
|---|---|
| Display / Hero headings | Tall condensed sans-serif, **uppercase only** for hero contexts |
| Body | Clean modern sans-serif (e.g. Inter, DM Sans) |
| Accent labels | Hand-drawn style font — use sparingly for campaign labels only |

### Rules
- Never use tiny typography — minimum 14px body, 16px preferred.
- Headlines should be short and positive — avoid long, dense heading copy.
- Accent font is occasional, not structural — do not use it for navigation, forms, or body text.

---

## UI Rules

- **Rounded corners** throughout — no sharp-edged UI elements.
- **Generous whitespace** — components should breathe; avoid cramped layouts.
- **Short, positive headlines** — lead with action or benefit, not description.
- **Simple CTA buttons** — one clear action per context; avoid button clusters.
- **No dark themes** — the UI is light and warm by default.
- **No glossy or corporate styling** — flat, friendly, and approachable.
- **Illustrations or friendly iconography** preferred over stock photography.

---

## Component Style

### Buttons
- Bold, high-contrast, rounded
- Primary action: `--color-primary` background, white text
- Avoid multiple competing CTAs in the same view

### Cards
- Pastel backgrounds using surface tokens (`--color-surface-soft-yellow`, `--color-surface-soft-blue`)
- Light borders or no borders — never heavy drop shadows
- Rounded corners, comfortable internal padding

### Navigation
- Clean and minimal
- Avoid heavy nav bars or complex mega-menus

### Forms
- Simple, clear labels — one field concept at a time where possible
- Lots of spacing between fields
- Avoid dense multi-column form layouts

### Empty States
- Use a supportive, encouraging tone — never blank or cold
- Include a friendly illustration or icon where possible
- Always offer a clear next action

---

## Tone of Voice

All UI copy (labels, headings, empty states, error messages, CTAs) should be:

- **Encouraging** — positive framing, never blame the user
- **Practical** — say what needs to be said clearly
- **Brief** — short sentences, no padding
- **Inclusive** — accessible language, no jargon
- **Action-oriented** — tell people what to do, not just what something is

---

## What to Avoid

| Avoid | Instead |
|---|---|
| Harsh black dominant surfaces | Use `--color-background` and pastel surfaces |
| Overly dense dashboards | Prioritise, use whitespace, progressive disclosure |
| Tiny typography | Minimum 14px, prefer 16px+ |
| Sharp, aggressive UI edges | Rounded corners throughout |
| Formal corporate language | Warm, human, direct copy |
| Heavy stock photography | Illustrations, icons, or simple imagery |
| Multiple competing CTAs | One clear primary action per context |
