import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/themes.css'; // Add our new themes CSS file
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

// If you want to start measuring performance in your app, uncomment
// the following line.
// reportWebVitals();