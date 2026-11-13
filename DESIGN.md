# WillowWallet v2 - Design Direction System

## Identity & Voice
- **Product**: WillowWallet v2
- **Purpose**: Modern, privacy-conscious personal finance tracker with single-entry cash flow, strict periodicity, category budgets, and savings goals.
- **Audience**: Everyday savers, conscious budgeters, and freelancers who need clarity, speed, and privacy without corporate accounting bloat.
- **Visual Character**: Tactile, refined, calming, focused on data clarity. Uses an authentic, lightweight Liquid Glass aesthetic with crisp typography and intentional spatial rhythm.
- **Dial**: ENERGY 2 / RHYTHM 2 / MOTION 1

---

## The Three Dials
- **ENERGY: 2 (Balanced)**
  Confident, clean, clear visual hierarchy. One primary focal point per view (e.g. Current Month Balance or Net Cashflow), balanced elevation, no screaming neons or full-page fluorescent glows.
- **RHYTHM: 2 (Consistent with Intentional Breaks)**
  Structured layouts with purposeful density variations. Compact list items for transactions to preserve scroll momentum; airy hero cards for financial summary metrics; focused forms for data entry.
- **MOTION: 1 (Calm & Purposeful)**
  Smooth transitions (spring physics for bottom sheets, subtle opacity fades for tabs). Respects `prefers-reduced-motion`. No distracting perpetual floating or bounce loops that drain battery or divert user focus from financial numbers.

---

## Palette & Semantics
- **Base Brand Neutral (Light)**: `#F0F4F8` (Soft slate tinted background)
- **Base Brand Neutral (Dark)**: `#060B14` (Deep OLED slate)
- **Surfaces**:
  - Light: `rgba(255, 255, 255, 0.88)` with subtle specular border `rgba(255, 255, 255, 0.8)`
  - Dark: `rgba(17, 26, 46, 0.82)` with border `rgba(255, 255, 255, 0.08)`
- **Primary / Health**: `#1B8A5A` (Deep Forest Emerald), `#10B981` (Vibrant Emerald for Dark Mode)
- **Cash Outflow / Danger**: `#EF4444` (Vibrant Coral/Rose)
- **Alert / Warning**: `#F59E0B` (Warm Amber)
- **Accent Focus**: `#3B82F6` (Electric Blue, reserved exclusively for data export/backups)

---

## Craftsmanship & Accessibility Commitments
1. **No Fake Content**: All saving targets, categories, and metrics are derived from real user records or explicit initial setups. No static "Liburan ke Bali" or dummy data.
2. **Accessible Semantics**:
   - Every clickable action is a native `<button>` or `<a href>`.
   - Modals and sheets include `role="dialog"`, `aria-modal="true"`, and close with `Escape`.
   - Clear `:focus-visible` ring across all interactive controls.
   - Viewport allows user pinch-to-zoom (WCAG AA).
3. **Hardware Efficiency**:
   - Eliminates universal CSS transitions (`* { transition: ... }`).
   - Keeps backdrop refractions lightweight and scoped to floating chrome (bottom dock and active modal sheets).
