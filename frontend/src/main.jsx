import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Override console.error to filter out blocked resource errors
console.error = (...args) => {
  const errorString = args.join(' ').toLowerCase();
  // Filter out ERR_BLOCKED_BY_CLIENT errors completely
  if (errorString.includes('err_blocked_by_client') || 
      errorString.includes('blocked by client') ||
      errorString.includes('net::err_blocked_by_client')) {
    return; // Silently ignore
  }
  originalConsoleError.apply(console, args);
};

// Override console.warn to filter out blocked resource warnings
console.warn = (...args) => {
  const warnString = args.join(' ').toLowerCase();
  // Filter out ERR_BLOCKED_BY_CLIENT warnings completely
  if (warnString.includes('err_blocked_by_client') || 
      warnString.includes('blocked by client') ||
      warnString.includes('net::err_blocked_by_client')) {
    return; // Silently ignore
  }
  originalConsoleWarn.apply(console, args);
};

// Global error handler for blocked resources - suppresses ALL related errors
window.addEventListener('error', (event) => {
  const errorMessage = (event.message || '').toLowerCase();
  const errorSource = (event.target?.src || event.target?.href || '').toLowerCase();
  
  // Check if this is a blocked resource error
  if (errorMessage.includes('err_blocked_by_client') || 
      errorMessage.includes('blocked by client') ||
      errorMessage.includes('net::err_blocked_by_client') ||
      errorSource.includes('blocked')) {
    // Completely suppress the error
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase to catch early

// Handle promise rejections from blocked requests
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason || {};
  const errorMessage = (reason.message || reason.code || '').toString().toLowerCase();
  const errorString = JSON.stringify(reason).toLowerCase();
  
  // Check if this is a blocked request error
  if (errorMessage.includes('err_blocked_by_client') || 
      errorMessage.includes('blocked by client') ||
      errorMessage.includes('net::err_blocked_by_client') ||
      errorString.includes('err_blocked_by_client') ||
      reason.code === 'ERR_BLOCKED_BY_CLIENT' ||
      reason.response?.status === 0) {
    // Completely suppress the rejection
    event.preventDefault();
    event.stopPropagation();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

