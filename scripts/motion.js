/**
 * EchoGraph — Motion Design System
 * Educational STEM tool: Primary Jakub (polish), Secondary Jhey (delight), Selective Emil (high-freq)
 */

// ── Easing Curves ────────────────────────────────────────────
// Strong ease-out: starts fast, feels responsive
export const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)';

// Strong ease-in-out: natural acceleration and deceleration
export const easeInOut = 'cubic-bezier(0.77, 0, 0.175, 1)';

// Gentle ease for hover transitions
export const easeGentle = 'cubic-bezier(0.4, 0, 0.2, 1)';

// iOS-style drawer curve
export const easeDrawer = 'cubic-bezier(0.32, 0.72, 0, 1)';

// ── Durations (ms) ────────────────────────────────────────────
// Educational context: slightly more patient than productivity tools
export const DURATION = {
  instant: 0,
  press:  120,
  fast:   160,
  normal: 220,
  slow:   340,
  enter:  400,
  exit:   280,
};

// ── Enter Animation ───────────────────────────────────────────
// Jakub's recipe: opacity + translateY + blur — materializing effect
// Stagger delay between children: 50ms increments
export const enterAnimation = (delay = 0) => `
  opacity: 0;
  transform: translateY(8px);
  filter: blur(4px);
  animation: echographEnter ${DURATION.enter}ms ${easeOut} ${delay}ms forwards;

  @keyframes echographEnter {
    to {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  }
`;

// ── Exit Animation ────────────────────────────────────────────
// Subtler than enter: less movement, same blur fade
export const exitAnimation = `
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
  transition: opacity ${DURATION.exit}ms ${easeOut},
              transform ${DURATION.exit}ms ${easeOut},
              filter ${DURATION.exit}ms ${easeOut};

  &.exiting {
    opacity: 0;
    transform: translateY(-6px);
    filter: blur(4px);
  }
`;

// ── Stagger Generator ─────────────────────────────────────────
// Returns CSS string for nth-child stagger delays
// items: number of children, gapMs: delay between each (default 50ms)
export const staggerCSS = (items, gapMs = 50) =>
  Array.from({ length: items }, (_, i) =>
    `.stagger-item:nth-child(${i + 1}) { animation-delay: ${i * gapMs}ms; }`
  ).join('\n');

// ── Interactive Feedback ──────────────────────────────────────
// Button press: immediate tactile response
export const pressScale = `
  transition: transform ${DURATION.press}ms ${easeOut};

  &:active {
    transform: scale(0.97);
  }
`;

// ── Card Hover ────────────────────────────────────────────────
// Selective lift — not on every element, only cards
export const cardHover = `
  transition: transform ${DURATION.fast}ms ${easeGentle},
              box-shadow ${DURATION.fast}ms ${easeGentle};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0px 0px 0px 1px rgba(0, 0, 0, 0.06),
        0px 4px 12px -2px rgba(0, 0, 0, 0.08);
    }
  }
`;

// ── Accessibility ─────────────────────────────────────────────
export const reducedMotion = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ── Voice Pulse Indicator ─────────────────────────────────────
// Recording/listening state — subtle opacity pulse, no scale bounce
export const voicePulse = `
  @keyframes echographVoicePulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  animation: echographVoicePulse 1.4s ${easeInOut} infinite;
`;