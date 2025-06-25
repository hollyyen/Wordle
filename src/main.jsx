import React from 'react';
import ReactDOM from 'react-dom/client';
import WordleClone from './WordleClone.jsx';
import './WordleClone.css';
import './firebase.js'; // Import to initialize Firebase

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WordleClone />
  </React.StrictMode>
);