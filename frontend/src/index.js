// index.js

// React is the main library for building user interfaces
import React from 'react';
// ReactDOM is responsible for rendering your app to the browser
import ReactDOM from 'react-dom/client';

// Import the main app styles
import './index.css';
// Import the main App component
import App from './App';
// Import the performance measurement tool
import reportWebVitals from './reportWebVitals';

// Create the root element and render the React app inside the #root div
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* App component holds the entire application UI */}
    <App />
  </React.StrictMode>
);

// This is optional: if you want to measure how fast your app loads or runs,
// you can pass a logging function to reportWebVitals (like console.log)
// This helps track performance or send it to an analytics tool
reportWebVitals();
