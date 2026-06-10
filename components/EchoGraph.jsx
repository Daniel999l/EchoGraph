import { useState, useRef, useCallback } from 'react';
import * as math from 'mathjs';
import * as Tone from 'tone';

const STYLES = `
  :root {
    --border: 4px solid #000;
    --bg: #f5f5f0;
    --card-bg: #fff;
    --accent: #ffcd00;
    --danger: #ff3333;
    --text: #111;
    --font: 'Inter', system-ui, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); font-family: var(--font); color: var(--text); }

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
    border: var(--border);
    background: #000;
    color: #fff;
  }

  .graph {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    border: var(--border);
    background: var(--card-bg);
    position: relative;
    overflow: hidden;
    cursor: crosshair;
    user-select: none;
  }

  .placeholder {
    font-family: var(--mono);
    font-size: 14px;
    color: #666;
  }

  .sweep {
    position: absolute;
    top: 0; bottom: 0;
    width: 3px;
    background: var(--accent);
    pointer-events: none;
    transition: left 40ms linear;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .row {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }

  .textarea {
    flex: 1;
    font-family: var(--mono);
    font-size: 16px;
    padding: 14px;
    border: var(--border);
    background: var(--card-bg);
    resize: none;
    min-height: 60px;
    outline: none;
  }

  .textarea:focus {
    border-color: var(--accent);
  }

  .btn {
    font-family: var(--font);
    font-size: 14px;
    font-weight: 700;
    padding: 14px 24px;
    border: var(--border);
    background: #000;
    color: #fff;
    cursor: pointer;
    text-align: center;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn:active {
    transform: translate(2px, 2px);
  }

  .btn.recording {
    background: var(--danger);
    border-color: var(--danger);
  }

  .btn-outline {
    background: transparent;
    color: #000;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .action-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .card {
    border: var(--border);
    background: var(--card-bg);
    padding: 20px;
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

  @keyframes spin { to { transform: rotate(360deg); } }

  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

  @media (max-width: 500px) {
    .root { padding: 0 12px; gap: 20px; }
    .row { flex-direction: column; }
    .action-row { flex-direction: column; }
  }
`;

export default function EchoGraph() {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [sweepActive, setSweepActive] = useState(false);
  const [sweepX, setSweepX] = useState(0);
  const graphRef = useRef(null);
  const synthRef = useRef(null);
  const pointsRef = useRef([]);

  const computePoints = useCallback(({ expression, xMin, xMax, step }) => {
    const node = math.parse(expression);
    const compiled = node.compile();
    const pts = [];
    for (let x = xMin; x <= xMax; x += step) {
      pts.push({ x, y: compiled.evaluate({ x }) });
    }
    return pts;
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
      data.xMin ??= -10;
      data.xMax ??= 10;
      data.step ??= 0.1;
      pointsRef.current = computePoints(data);
      setParsed(data);
      setInput('');
      setSweepX(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input, computePoints]);

  const onPointerMove = useCallback((e) => {
    if (!graphRef.current || pointsRef.current.length === 0) return;
    const rect = graphRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSweepX(pct * 100);
    const idx = Math.floor(pct * (pointsRef.current.length - 1));
    const pt = pointsRef.current[idx];
    if (!pt) return;
    const freq = 200 + ((Math.max(-10, Math.min(10, pt.y)) + 10) / 20) * 1300;
    if (!synthRef.current) synthRef.current = new Tone.Synth().toDestination();
    if (Tone.context.state !== 'running') Tone.start();
    synthRef.current.triggerAttackRelease(freq, '64n');
  }, []);

  const onPointerEnter = useCallback(() => {
    if (pointsRef.current.length > 0) setSweepActive(true);
  }, []);
  const onPointerLeave = useCallback(() => setSweepActive(false), []);

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
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          tabIndex={0}
          aria-label="Interactive graph area"
        >
          {!parsed && !loading && <span className="placeholder">SAY OR TYPE A MATH EXPRESSION</span>}
          {loading && <span className="spinner" />}
          <div className={`sweep${sweepActive ? '' : ''}`} style={{ left: `${sweepX}%`, opacity: sweepActive ? 1 : 0 }} />
        </section>

        <div className="controls">
          <div className="row">
            <textarea
              className="textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder='e.g. "graph y = x squared from 0 to 10"'
              rows={2}
              aria-label="Math expression"
            />
            <button className={`btn${recording ? ' recording' : ''}`} onClick={toggleRecording}>
              {recording ? '■ STOP' : '🎤 SPEAK'}
            </button>
          </div>

          <div className="action-row">
            <button className="btn" onClick={handleSend} disabled={!input.trim() || loading}>
              {loading ? <span className="spinner" /> : 'GRAPH IT'}
            </button>
            {parsed && <button className="btn btn-outline" onClick={readAloud}>🔊 READ ALOUD</button>}
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