import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root') ?? document.body.appendChild(document.createElement('div'));
rootElement.id = 'root';
const root = createRoot(rootElement);
root.render(<App />);
