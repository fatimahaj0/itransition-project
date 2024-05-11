import React from 'react';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function Navbar({ theme, setTheme }) {

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="navbar">
      <ul>
        <li>Home</li>
      
        
        <li>Sign In</li>
      </ul>
      <div className="search">
        <input type="text" placeholder="Search" />
      </div>
      <div className="toggle-container" onClick={switchTheme}>
        <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} className={theme === 'dark' ? 'moon-icon' : ''} />
      </div>
    </div>
  );
}

export default Navbar;
