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
  </StrictMode>
);