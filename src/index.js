import React from 'react';
import ReactDOM from 'react-dom/client';

// Import styles in the correct order for proper cascading
import './index.css';                    // Base Tailwind styles
import './styles/themes.css';            // Theme variables and overrides 
import './styles/mobileResponsive.css';  // Responsive utilities

import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register the service worker for offline support
serviceWorkerRegistration.register();