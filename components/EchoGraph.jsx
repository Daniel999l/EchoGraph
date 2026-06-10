import { useState, useRef, useCallback } from 'react';
import * as math from 'mathjs';
import * as Tone from 'tone';
import {
  pressScale,
  cardHover,
  reducedMotion,
  voicePulse,
  DURATION,
} from '../scripts/motion.js';

const SCOPED_STYLES = `
  .eg-root {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-5);
    gap: var(--space-5);
    transform-style: preserve-3d;
  }

  .eg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--space-4);
    border-bottom: 2px solid var(--color-text);
    transform: translateZ(12px);
  }

  .eg-brand {
    font-family: var(--font-mono);
    font-size: var(--text-md);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .eg-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    padding: var(--space-1) var(--space-3);
    border: 2px solid var(--color-secondary);
    border-radius: var(--radius-control);
    color: var(--color-secondary);
    background: transparent;
  }

  .eg-graph-area {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
    border: 3px solid var(--color-text);
    border-radius: var(--radius-card);
    background: var(--color-surface);
    position: relative;
    overflow: hidden;
    transform: translateZ(0);
    transition: transform ${DURATION.normal}ms ease;
  }

  .eg-graph-area:hover {
    transform: translateZ(var(--depth-card));
  }

  .eg-graph-placeholder {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text);
    opacity: 0.4;
    user-select: none;
  }

  .eg-graph-sweep-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-secondary);
    opacity: 0;
    pointer-events: none;
    transition: left 60ms linear;
  }

  .eg-graph-sweep-line.active {
    opacity: 1;
  }

  .eg-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transform: translateZ(6px);
  }

  .eg-record-row {
    display: flex;
    gap: var(--space-3);
    align-items: center;
  }

  .eg-textarea {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    padding: var(--space-3);
    border: 3px solid var(--color-text);
    border-radius: var(--radius-control);
    background: var(--color-surface);
    color: var(--color-text);
    resize: none;
    min-height: 56px;
    outline: none;
    transition: border-color ${DURATION.fast}ms ease, transform ${DURATION.press}ms ease;
  }

  .eg-textarea:focus-visible {
    border-color: var(--color-primary);
    outline: none;
    transform: translateZ(var(--depth-press));
  }

  .eg-btn {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 600;
    padding: var(--space-3) var(--space-5);
    border: 3px solid var(--color-text);
    border-radius: var(--radius-control);
    background: var(--color-text);
    color: var(--color-surface);
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    transform: translateZ(4px);
    transition: transform ${DURATION.press}ms ease;
    ${pressScale}
  }

  .eg-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  .eg-btn:active {
    transform: translateZ(0) scale(0.97);
  }

  .eg-btn.recording {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: #fff;
  }

  .eg-btn.recording .eg-record-dot {
    ${voicePulse}
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
  }

  .eg-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .eg-btn-outline {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: 600;
    padding: var(--space-3) var(--space-5);
    border: 3px solid var(--color-text);
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    transform: translateZ(2px);
    transition: transform ${DURATION.press}ms ease;
    ${pressScale}
  }

  .eg-btn-outline:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  .eg-btn-outline:active {
    transform: translateZ(0) scale(0.97);
  }

  .eg-response-card {
    border: 3px solid var(--color-text);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    background: var(--color-surface);
    min-height: 64px;
    transform: translateZ(0);
    transition: transform ${DURATION.fast}ms ease;
    ${cardHover}
  }

  .eg-response-card:hover {
    transform: translateZ(var(--depth-card));
  }

  .eg-response-label {
    font-size: var(--text-xs);
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text);
    opacity: 0.5;
    margin-bottom: var(--space-2);
  }

  .eg-response-text {
    font-size: var(--text-base);
    color: var(--color-text);
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .eg-action-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .eg-loading {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-surface);
    border-top-color: transparent;
    border-radius: 50%;
    animation: eg-spin 0.6s linear infinite;
  }

  @keyframes eg-spin {
    to { transform: rotate(360deg); }
  }

  .eg-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 500px) {
    .eg-root {
      padding: var(--space-4);
      gap: var(--space-4);
    }

    .eg-record-row {
      flex-direction: column;
      align-items: stretch;
    }

    .eg-btn,
    .eg-btn-outline {
      justify-content: center;
      text-align: center;
    }

    .eg-action-row {
      flex-direction: column;
    }

    .eg-header,
    .eg-controls,
    .eg-btn,
    .eg-btn-outline {
      transform: translateZ(0);
    }
  }

  ${reducedMotion}
`;

export default function EchoGraph() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [sweepActive, setSweepActive] = useState(false);
  const [sweepX, setSweepX] = useState(0);
  const graphRef = useRef(null);
  const synthRef = useRef(null);
  const pointsRef = useRef([]);

  // Precompute points from parsed data
  const computePoints = useCallback(({ expression, xMin, xMax, step }) => {
    const node = math.parse(expression);
    const compiled = node.compile();
    const points = [];
    for (let x = xMin; x <= xMax; x += step) {
      const y = compiled.evaluate({ x });
      points.push({ x, y });
    }
    return points;
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setParsed(null);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!res.ok) throw new Error('Failed to parse input');

      const data = await res.json();
      data.xMin = data.xMin ?? -10;
      data.xMax = data.xMax ?? 10;
      data.step = data.step ?? 0.1;

      const points = computePoints(data);
      pointsRef.current = points;
      setParsed(data);
      setInput('');
      setSweepX(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input, computePoints]);

  // Sonification on pointer move
  const handleGraphPointerMove = useCallback(
    (e) => {
      if (!graphRef.current || pointsRef.current.length === 0) return;
      const rect = graphRef.current.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const xClamped = Math.max(0, Math.min(1, pct));
      setSweepX(xClamped * 100);

      // Map position to nearest point index
      const idx = Math.floor(xClamped * (pointsRef.current.length - 1));
      const point = pointsRef.current[idx];
      if (!point) return;

      // Map y-value to frequency (range C4 ~ 262Hz to C7 ~ 2093Hz
      // Normalize y between -10 and 10 -> freq between 200 and 1500
      const yNorm = Math.max(-10, Math.min(10, point.y));
      const freq = 200 + ((yNorm + 10) / 20) * 1300; // 200–1500 Hz

      if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination();
      }

      // Ensure AudioContext is started (user gesture)
      if (Tone.context.state !== 'running') {
        Tone.start();
      }

      // Play a short note at the current sweep position
      synthRef.current.triggerAttackRelease(freq, '64n');
    },
    []
  );

  const handleGraphPointerEnter = useCallback(() => {
    if (pointsRef.current.length > 0) setSweepActive(true);
  }, []);

  const handleGraphPointerLeave = useCallback(() => {
    setSweepActive(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const toggleRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setError('Voice input failed — try typing.');
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }, [isRecording]);

  const handleReadAloud = useCallback(() => {
    if (!parsed) return;
    const utterance = new SpeechSynthesisUtterance(parsed.explanation);
    window.speechSynthesis.speak(utterance);
  }, [parsed]);

  return (
    <>
      <style>{SCOPED_STYLES}</style>
      <div className="eg-root">
        <header className="eg-header">
          <h1 className="eg-brand">EchoGraph</h1>
          <span className="eg-badge" aria-label="Accessibility feature: voice-first math tool">
            Voice Accessible
          </span>
        </header>

        <section
          className="eg-graph-area"
          ref={graphRef}
          onPointerMove={handleGraphPointerMove}
          onPointerEnter={handleGraphPointerEnter}
          onPointerLeave={handleGraphPointerLeave}
          role="img"
          aria-label="Interactive graph area — move your pointer to hear the sonification"
          tabIndex={0}
        >
          {!parsed && !loading && (
            <span className="eg-graph-placeholder" aria-hidden="true">
              Speak or type a math expression
            </span>
          )}
          {loading && <span className="eg-loading" aria-hidden="true" />}
          <div
            className={`eg-graph-sweep-line ${sweepActive ? 'active' : ''}`}
            style={{ left: `${sweepX}%` }}
            aria-hidden="true"
          />
        </section>

        <div className="eg-controls">
          <div className="eg-record-row">
            <label htmlFor="eg-input" className="eg-sr-only">
              Math expression
            </label>
            <textarea
              id="eg-input"
              className="eg-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "graph y equals x squared from zero to ten"'
              rows={2}
            />
            <button
              className={`eg-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? (
                <>
                  <span className="eg-record-dot" aria-hidden="true" />
                  Stop
                </>
              ) : (
                'Speak'
              )}
            </button>
          </div>

          <div className="eg-action-row">
            <button
              className="eg-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? <span className="eg-loading" aria-hidden="true" /> : 'Graph It'}
            </button>
            {parsed && (
              <button className="eg-btn-outline" onClick={handleReadAloud}>
                Read Aloud
              </button>
            )}
          </div>

          {error && (
            <div className="eg-response-card" role="alert">
              <div className="eg-response-label">Error</div>
              <div className="eg-response-text">{error}</div>
            </div>
          )}

          {parsed && !error && (
            <div className="eg-response-card" role="status" aria-live="polite">
              <div className="eg-response-label">Explanation</div>
              <div className="eg-response-text">{parsed.explanation}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}