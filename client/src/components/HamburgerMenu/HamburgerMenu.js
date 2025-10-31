import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from "../../context/UserContext";
import './HamburgerMenu.css';

const HamburgerMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <>
      <div className="hamburger-wrapper">
        <button
          className="hamburger-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-icon" />
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`hamburger-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      {/* Slide-in menu: add 'open' class when menuOpen */}
      <nav className={`hamburger-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <ul>
          {user && (
            <li>
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                {user.username}
              </Link>
            </li>
          )}
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/chapters" onClick={() => setMenuOpen(false)}>Chapters</Link></li>
          <li><Link to="/wiki" onClick={() => setMenuOpen(false)}>Wiki</Link></li>
          <li><Link to="/updates" onClick={() => setMenuOpen(false)}>Updates</Link></li>
          <li><Link to="/support" onClick={() => setMenuOpen(false)}>Support</Link></li>
        </ul>
      </nav>
    </>
  );
};

export default HamburgerMenu;