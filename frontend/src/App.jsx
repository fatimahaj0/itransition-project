import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { Routes, Route } from "react-router-dom";
import SignIn from "./pages/signin/Signin";

function App() {
  const [theme, setTheme] = useState('light');
 
 useEffect(() => {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}, [theme]);


  return (
    <div className="app">
	<Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/signin" element={<SignIn />}></Route>
      </Routes>
      
    </div>
  );
}

export default App;
