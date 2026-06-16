import { useState, useRef, useCallback, useEffect } from 'react';
import * as math from 'mathjs';
import * as Tone from 'tone';

const STYLES = `
  :root {
    --border: 2px solid #000;
    --bg: #f5f5f0;
    --card-bg: #fff;
    --accent: #ffcd00;
    --danger: #ff3333;
    --text: #111;
    --font: 'Inter', system-ui, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: var(--bg);
    font-family: var(--font);
    color: var(--text);
  }

  .root {
    max-width: 760px;
    margin: 40px auto;
    padding: 0 20px;
    display: grid;
    gap: 28px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: var(--border);
    padding-bottom: 16px;
  }

  .brand {
    font-family: var(--mono);
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .badge {
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border: 1px solid #000;
    border-radius: 4px;
    background: #000;
    color: #fff;
    transform: translate(-0.15rem, -0.15rem);
    box-shadow: 0.15rem 0.15rem #000;
  }

  .graph {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    border: 1px solid #000;
    border-radius: 4px;
    background: var(--card-bg);
    position: relative;
    overflow: hidden;
    cursor: crosshair;
    user-select: none;
    touch-action: none;
    transform: translate(-0.25rem, -0.25rem);
    box-shadow: 0.25rem 0.25rem #000;
  }

  .graph-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .placeholder {
    font-family: var(--mono);
    font-size: 14px;
    color: #666;
  }

  .sweep {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent);
    pointer-events: none;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .textarea {
    width: 100%;
    font-family: var(--mono);
    font-size: 16px;
    padding: 14px;
    border: 1px solid #000;
    border-radius: 4px;
    background: var(--card-bg);
    resize: none;
    min-height: 60px;
    outline: none;
    transform: translate(-0.25rem, -0.25rem);
    box-shadow: 0.25rem 0.25rem #000;
  }

  .textarea:focus {
    border-color: var(--accent);
  }

  .button-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn {
    font-family: var(--font);
    font-size: 14px;
    font-weight: 700;
    padding: 14px 24px;
    border: 1px solid #000;
    border-radius: 4px;
    background: var(--accent);
    color: #000;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: center;
    transition: 0.2s;
    transform: translate(-0.25rem, -0.25rem);
    box-shadow: 0.25rem 0.25rem #000;
  }

  .btn:active {
    transform: translate(0);
    box-shadow: none;
    background: #000;
    color: #fff;
  }

  .btn.recording {
    background: var(--danger);
    border-color: var(--danger);
    color: #fff;
  }

  .btn-outline {
    font-family: var(--font);
    font-size: 14px;
    font-weight: 700;
    padding: 14px 24px;
    border: 1px solid #000;
    border-radius: 4px;
    background: #fff;
    color: #000;
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0;
    justify-content: center;
    transition: 0.2s;
    transform: translate(-0.25rem, -0.25rem);
    box-shadow: 0.25rem 0.25rem #000;
  }

  .btn-outline:active {
    transform: translate(0);
    box-shadow: none;
    background: #000;
    color: #fff;
  }

  .btn:disabled,
  .btn-outline:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn.autoplay-active {
    background: var(--danger);
    border-color: var(--danger);
    color: #fff;
  }

  .btn-example {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    padding: 8px 14px;
    border: 1px solid #000;
    border-radius: 4px;
    background: var(--card-bg);
    color: #000;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-example:active {
    transform: translate(0) !important;
    box-shadow: none !important;
  }

  .examples-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .examples-label {
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .card {
    border: 1px solid #000;
    border-radius: 4px;
    background: var(--card-bg);
    padding: 20px;
    transform: translate(-0.25rem, -0.25rem);
    box-shadow: 0.25rem 0.25rem #000;
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.5;
    margin-bottom: 8px;
  }

  .text {
    font-size: 16px;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 3px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.5s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
  }

  @media (max-width: 500px) {
    .root { padding: 0 12px; gap: 20px; }
    .button-row { flex-direction: column; }
    .btn { flex: none; }
  }
`;

const EXAMPLES = [
  "graph y = 2x + 3 from -5 to 5",
  "graph y = x squared between -10 and 10 step 0.5",
  "graph sin(x) from 0 to 2\u03c0 step 0.05",
  "graph y = 1/x from 1 to 20",
  "graph y = x cubed + 2x",
];

export default function EchoGraph() {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [sweepActive, setSweepActive] = useState(false);
  const [sweepX, setSweepX] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const graphRef = useRef(null);
  const synthRef = useRef(null);
  const pointsRef = useRef([]);
  const autoPlayRef = useRef(null);
  const sweepNoteRef = useRef(false); // track if sound is currently playing

  const computePoints = useCallback(({ expression, xMin, xMax, step }) => {
    try {
      const node = math.parse(expression);
      const compiled = node.compile();
      const pts = [];
      for (let x = xMin; x <= xMax; x += step) {
        pts.push({ x, y: compiled.evaluate({ x }) });
      }
      return pts;
    } catch (err) {
      throw new Error(
        'Unable to graph this expression. Check your input and try again.'
      );
    }
  }, []);

  const getSynth = useCallback(async () => {
    if (!synthRef.current) {
      await Tone.start();
      synthRef.current = new Tone.Synth().toDestination();
    }
    return synthRef.current;
  }, []);

  const playNoteAtPercent = useCallback(async (pct, start = false) => {
    const synth = await getSynth();
    if (pointsRef.current.length === 0) return;
    setSweepX(pct * 100);
    const idx = Math.floor(pct * (pointsRef.current.length - 1));
    const pt = pointsRef.current[idx];
    if (!pt) return;
    const freq = 200 + ((Math.max(-10, Math.min(10, pt.y)) + 10) / 20) * 1300;

    if (start) {
      // begin continuous note
      if (Tone.context.state !== 'running') await Tone.start();
      synth.triggerAttack(freq);
      sweepNoteRef.current = true;
    } else {
      // ramp to new frequency
      synth.frequency.rampTo(freq, 0.05);
    }
  }, [getSynth]);

  const stopNote = useCallback(async () => {
    const synth = await getSynth();
    if (sweepNoteRef.current) {
      synth.triggerRelease();
      sweepNoteRef.current = false;
    }
  }, [getSynth]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setParsed(null);
    if (autoPlay) setAutoPlay(false);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (!res.ok) {
        const msg = await res.json().then((d) => d.error).catch(() => null);
        throw new Error(msg || 'Failed to parse input');
      }
      const data = await res.json();
      data.xMin ??= -10;
      data.xMax ??= 10;
      data.step ??= 0.1;
      const pts = computePoints(data);
      pointsRef.current = pts;
      setParsed(data);
      setInput('');
      setSweepX(0);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, computePoints, autoPlay]);

  const onPointerDown = useCallback(async (e) => {
    e.target.setPointerCapture(e.pointerId);
    setSweepActive(true);
    const rect = graphRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    await playNoteAtPercent(pct, true);
  }, [playNoteAtPercent]);

  const onPointerMove = useCallback(async (e) => {
    if (!graphRef.current || pointsRef.current.length === 0) return;
    if (!sweepNoteRef.current) return; // only update if note is active (pointer down)
    const rect = graphRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    await playNoteAtPercent(pct, false);
  }, [playNoteAtPercent]);

  const onPointerUp = useCallback(async () => {
    setSweepActive(false);
    await stopNote();
  }, [stopNote]);

  const onPointerCancel = useCallback(async () => {
    setSweepActive(false);
    await stopNote();
  }, [stopNote]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const toggleRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported'); return; }
    if (recording) { setRecording(false); return; }
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';
    recog.onstart = () => setRecording(true);
    recog.onresult = (e) => setInput(e.results[0][0].transcript);
    recog.onerror = () => { setRecording(false); setError('Voice input failed'); };
    recog.onend = () => setRecording(false);
    recog.start();
  }, [recording]);

  const readAloud = useCallback(() => {
    if (parsed) window.speechSynthesis.speak(new SpeechSynthesisUtterance(parsed.explanation));
  }, [parsed]);

  const toggleAutoPlay = useCallback(() => {
    if (!parsed || pointsRef.current.length === 0) return;
    setAutoPlay((prev) => !prev);
  }, [parsed]);

  const handleExampleClick = useCallback((example) => {
    setInput(example);
    setError(null);
  }, []);

  useEffect(() => {
    if (!autoPlay || pointsRef.current.length === 0) {
      return;
    }

    let cancelled = false;

    (async () => {
      const synth = await getSynth();
      if (cancelled) return;
      if (Tone.context.state !== 'running') await Tone.start();
      await playNoteAtPercent(0, true);
      setSweepActive(true);

      const duration = 4000;
      const stepMs = 40;
      let elapsed = 0;

      const interval = setInterval(async () => {
        if (cancelled) return;
        elapsed += stepMs;
        const pct = Math.min(1, elapsed / duration);
        await playNoteAtPercent(pct, false);
        if (pct >= 1) {
          clearInterval(interval);
          await stopNote();
          setSweepActive(false);
          setAutoPlay(false);
        }
      }, stepMs);
    })();

    return () => {
      cancelled = true;
      stopNote();
      setSweepActive(false);
    };
  }, [autoPlay, playNoteAtPercent, stopNote, getSynth]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <header className="header">
          <h1 className="brand">ECHOGRAPH</h1>
          <span className="badge">VOICE ACCESSIBLE</span>
        </header>

        <section
          className="graph"
          ref={graphRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerMove={onPointerMove}
          tabIndex={0}
          aria-label="Interactive graph area"
        >
          {!parsed && !loading && <span className="placeholder">SAY OR TYPE A MATH EXPRESSION</span>}
          {loading && <span className="spinner" />}
          {parsed && pointsRef.current.length > 0 && (
            <svg
              className="graph-svg"
              viewBox={`0 0 ${parsed.xMax - parsed.xMin} ${parsed.xMax - parsed.xMin}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={pointsRef.current
                  .map((p) => {
                    const xRange = parsed.xMax - parsed.xMin;
                    const xShift = p.x - parsed.xMin;
                    const yShift = -p.y + xRange / 2;
                    return `${xShift},${yShift}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="var(--text)"
                strokeWidth="0.2"
              />
            </svg>
          )}
          <div
            className="sweep"
            style={{ left: `${sweepX}%`, opacity: sweepActive ? 1 : 0 }}
          />
        </section>

        <div className="examples-section">
          <span className="examples-label">Try one:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              className="btn-example"
              onClick={() => handleExampleClick(ex)}
            >
              {ex}
            </button>
          ))}
        </div>

        <div className="controls">
          <textarea
            className="textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='e.g. "graph y = x squared from 0 to 10"'
            rows={2}
            aria-label="Math expression"
          />

          <div className="button-row">
            <button
              className={`btn${recording ? ' recording' : ''}`}
              onClick={toggleRecording}
            >
              {recording ? 'STOP' : 'SPEAK'}
            </button>
            <button
              className="btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? <span className="spinner" /> : 'GRAPH IT'}
            </button>
            {parsed && (
              <button className="btn-outline" onClick={readAloud}>
                READ ALOUD
              </button>
            )}
            {parsed && (
              <button
                className={`btn-outline${autoPlay ? ' autoplay-active' : ''}`}
                onClick={toggleAutoPlay}
              >
                {autoPlay ? 'STOP PLAY' : 'AUTO PLAY'}
              </button>
            )}
          </div>

          {error && (
            <div className="card" role="alert">
              <div className="label">ERROR</div>
              <div className="text">{error}</div>
            </div>
          )}

          {parsed && !error && (
            <div className="card" role="status" aria-live="polite">
              <div className="label">EXPLANATION</div>
              <div className="text">{parsed.explanation}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}