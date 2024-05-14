import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter , Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import SignIn from "./pages/signin/Signin";
import SignUp from "./pages/signup/SignUp";
import Items from "./pages/items/Items";

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
		<Route path="/" element={<Home />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
		<Route path="/signup" element={<SignUp/>}></Route> 
		<Route path="/collection/:collectionId/items" element ={<Items />}> </Route>

      </Routes>
	
      
    </div>
  );
}

export default App;
