import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EchoGraph from '../components/EchoGraph.js';
import '../styles/main.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EchoGraph />
  </StrictMode>
);