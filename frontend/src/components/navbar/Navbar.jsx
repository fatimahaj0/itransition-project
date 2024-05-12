import React from 'react';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

function Navbar({ theme, setTheme }) {

  const switchTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="container">
		<div className="navbar">
			  <ul>
				<li>Home</li>
				<li>
					<Link to="/signin">Sign In</Link>
				</li>
			  </ul>
			  <div className="search">
				<input type="text" placeholder="Search" />
			  </div>
			  <div className="toggle-container" onClick={switchTheme}>
				<FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} className={theme === 'dark' ? 'moon-icon' : ''} />
			  </div>
		</div>
    </div>
  );
}

export default Navbar;
