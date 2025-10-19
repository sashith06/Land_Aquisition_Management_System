import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ Import Router
import './index.css';
import './App.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  // Temporarily disable StrictMode to prevent double rendering of alerts in development
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>
);
