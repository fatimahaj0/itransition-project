import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter , Routes, Route } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import AdminPanel from './pages/adminpanel/Adminpanel';
import Home from "./pages/home/Home";
import SignIn from "./pages/signin/Signin";
import SignUp from "./pages/signup/SignUp";
import Items from "./pages/items/Items";
import Collection from "./pages/collection/Collection";

const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = jwtDecode(token);
    return decodedToken.isAdmin;
  }
  return false;
};

const AdminRoute = ({ children }) => {
  return isAdmin() ? children : <Navigate to="/" />;
};

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

   <AuthProvider>
		<div className="app">
			<Navbar theme={theme} setTheme={setTheme} />
			  <Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/signin" element={<SignIn />}></Route>
				<Route path="/signup" element={<SignUp/>}></Route>
				<Route path="/admin-panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
				<Route path="/signup" element={<SignUp/>}></Route> 
				<Route path="/collection/:collectionId/items" element ={<Items />}> </Route>
				<Route path="/create"  element ={<Collection />} > </Route>
			  </Routes>
		</div>
	</AuthProvider>
  );
}

export default App;