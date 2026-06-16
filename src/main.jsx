import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Hero from '../components/Hero.jsx';
import EchoGraph from '../components/EchoGraph.jsx';
import '../styles/main.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Hero />
    <div id="app-graph" style={{ scrollMarginTop: '24px' }}>
      <EchoGraph />
    </div>
    <footer style={{ display: 'flex', justifyContent: 'center', padding: '32px 20px' }}>
      <a href="https://orynth.dev/projects/echograph" target="_blank" rel="noopener">
        <img src="https://orynth.dev/api/badge/echograph?theme=light&style=minimal" alt="Featured on Orynth" width="152" height="48" />
      </a>
    </footer>
  </StrictMode>
);