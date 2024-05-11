import React, { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div className={`app ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <Navbar theme={theme} setTheme={setTheme} />
      
    </div>
  );
}

export default App;
