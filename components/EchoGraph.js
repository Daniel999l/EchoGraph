import { useState, useRef, useCallback } from 'react';
import {
  enterAnimation,
  exitAnimation,
  staggerCSS,
  pressScale,
  cardHover,
  reducedMotion,
  voicePulse,
  DURATION,
} from '../scripts/motion.js';

// Scoped class prefix: eg- (EchoGraph)
const SCOPED_STYLES = `
  .eg-root {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-5);
    gap: var(--space-5);
  }

  .eg-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--space-4);
    border-bottom: 2px solid var(--color-text);
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
    transition: border-color ${DURATION.fast}ms ease;
  }

  .eg-textarea:focus-visible {
    border-color: var(--color-primary);
    outline: none;
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
    ${pressScale}
  }

  .eg-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
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
    ${pressScale}
  }

  .eg-btn-outline:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  .eg-response-card {
    border: 3px solid var(--color-text);
    border-radius: var(--radius-card);
    padding: var(--space-4);
    background: var(--color-surface);
    min-height: 64px;
    ${cardHover}
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
  }

  ${reducedMotion}
`;

export default function EchoGraph() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [sweepActive, setSweepActive] = useState(false);
  const [sweepX, setSweepX] = useState(0);
  const graphRef = useRef(null);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    // Placeholder: will connect to Groq API route
    setResponse({ text: `Parsing: "${input.trim()}" — sonification engine ready.` });
    setInput('');
  }, [input]);

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
      setResponse({ text: 'Speech recognition is not supported in this browser.' });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsListening(false);
    };

    recognition.start();
  }, [isRecording]);

  const handleGraphPointerMove = useCallback(
    (e) => {
      if (!graphRef.current || !response) return;
      const rect = graphRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setSweepX(Math.max(0, Math.min(100, x)));
    },
    [response]
  );

  const handleGraphPointerEnter = useCallback(() => {
    if (response) setSweepActive(true);
  }, [response]);

  const handleGraphPointerLeave = useCallback(() => {
    setSweepActive(false);
  }, []);

  return (
    <>
      <style>{SCOPED_STYLES}</style>
      <div className="eg-root">
        {/* Header */}
        <header className="eg-header">
          <h1 className="eg-brand">EchoGraph</h1>
          <span className="eg-badge" aria-label="Accessibility feature: voice-first math tool">
            Voice Accessible
          </span>
        </header>

        {/* Graph Display */}
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
          {!response && (
            <span className="eg-graph-placeholder" aria-hidden="true">
              Speak or type a math expression
            </span>
          )}
          <div
            className={`eg-graph-sweep-line ${sweepActive ? 'active' : ''}`}
            style={{ left: `${sweepX}%` }}
            aria-hidden="true"
          />
        </section>

        {/* Controls */}
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
            <button className="eg-btn" onClick={handleSend} disabled={!input.trim()}>
              Graph It
            </button>
            {response && (
              <button
                className="eg-btn-outline"
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(response.text);
                  window.speechSynthesis.speak(utterance);
                }}
              >
                Read Aloud
              </button>
            )}
          </div>

          {/* Response */}
          {response && (
            <div
              className="eg-response-card"
              role="status"
              aria-live="polite"
            >
              <div className="eg-response-label">Explanation</div>
              <div className="eg-response-text">{response.text}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}