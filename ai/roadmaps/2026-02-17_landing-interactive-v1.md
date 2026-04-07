# Landing Page — Interactive + Full (Reference-Inspired)

## Goal
Make the landing page feel premium, interactive, and “full” like the reference mobile UI.
The page should feel alive: depth, motion, playful accents, and strong hierarchy.

## Scope
- Landing page only ("/")
- Shared layout/navbar if needed
- No backend changes

## Visual Style Targets
- Background: soft gradient (very light indigo/blue + subtle noise optional)
- Page width: mobile-first centered container (max-w-md) with breathing room
- Surfaces: rounded-2xl / rounded-3xl cards with soft shadows
- Accent: indigo primary, used intentionally
- Overall vibe: clean, modern, playful, high trust

## Layout Requirements (Landing Page)
### Top Nav
- Floating rounded “pill” navbar (bg-white/80 + backdrop-blur)
- Left: 🍕 Scavenger
- Right: Feed + Upload buttons (Upload is primary)

### Hero Section (Centered)
- Small badge/pill: "BYU Pilot • Real-time"
- Headline:
  "Find free food"
  "nearby"
  With "nearby" in indigo gradient text
- Supporting text: 1–2 lines max
- Primary CTA: "Upload a flyer"
- Secondary CTA: "Browse feed"

### “Interactive Fullness” Elements
Add a hero visual block (below CTAs) that creates depth:
- A large rounded card that looks like an app preview frame
- Inside it: skeleton feed cards (fake content placeholders are fine)
- Add floating “food pins” (small circular emoji/icon chips) positioned around the preview
- Add subtle animated float effect (slow up/down) on 3–6 chips
- Add a soft shadow under the preview card
- Add 8–12 small pastel dots in the background positioned absolutely (no animation needed).

### Microinteractions
- Buttons: hover, press scale, active states
- Cards: hover lift (desktop) + press feedback (mobile)
- Chips: gentle float animation (prefers-reduced-motion respected)

### Accessibility / Quality
- Respect prefers-reduced-motion
- Good contrast
- No layout shift
- Mobile first; desktop should still look good

## Components to Create
- components/NavPill.tsx
- components/HeroPreview.tsx
- components/FloatingChip.tsx
- components/ui/Button.tsx (or update PrimaryButton)
- components/ui/Card.tsx (optional)

## Tailwind + CSS Notes
- Use Tailwind for layout and most styling
- Add small custom CSS for keyframes (float animation) if needed
- Avoid new UI libraries unless already in project

## Acceptance Criteria
- Landing page feels modern and “alive”
- Obvious primary CTA
- Looks good on 375px wide mobile
- Has depth: gradient bg, cards, floating elements, subtle motion
- No backend changes
