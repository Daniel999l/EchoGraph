import { useCallback } from 'react';

const HERO_STYLES = `
  .hero {
    display: grid;
    gap: 32px;
    padding: 60px 20px 40px;
    text-align: center;
    justify-items: center;
    max-width: 640px;
    margin: 0 auto;
  }

  .hero-eyebrow {
    font-family: var(--mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #666;
    border: 3px solid #000;
    padding: 6px 16px;
    background: var(--accent, #ffcd00);
  }

  .hero-title {
    font-size: 48px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.04em;
    color: #000;
    margin: 0;
  }

  .hero-subtitle {
    font-size: 18px;
    line-height: 1.6;
    color: #333;
    max-width: 480px;
  }

  .hero-cta {
    font-family: var(--font, 'Inter', system-ui, sans-serif);
    font-size: 16px;
    font-weight: 700;
    padding: 14px 32px;
    border: 4px solid #000;
    background: #000;
    color: #fff;
    cursor: pointer;
    transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .hero-cta:active {
    transform: scale(0.96);
  }

  .hero-cta:focus-visible {
    outline: 2px solid var(--accent, #ffcd00);
    outline-offset: 3px;
  }

  @media (max-width: 500px) {
    .hero { padding: 40px 16px 24px; gap: 24px; }
    .hero-title { font-size: 32px; }
    .hero-subtitle { font-size: 16px; }
  }
`;

export default function Hero() {
  const handleTry = useCallback(() => {
    document.getElementById('app-graph')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <style>{HERO_STYLES}</style>
      <section className="hero" aria-label="EchoGraph introduction">
        <span className="hero-eyebrow">Voice Accessible</span>
        <h1 className="hero-title">Hear&nbsp;Math</h1>
        <p className="hero-subtitle">
          Speak or type any math expression. Watch it graphed — and hear the
          function as sound by moving your cursor across the curve.
        </p>
        <button className="hero-cta" onClick={handleTry}>
          Try It →
        </button>
      </section>
    </>
  );
}