// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import initErrorMonitoring from './utils/errorMonitoring';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize error monitoring
initErrorMonitoring();

// Create root with createRoot API (React 18)
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline functionality
serviceWorkerRegistration.register();