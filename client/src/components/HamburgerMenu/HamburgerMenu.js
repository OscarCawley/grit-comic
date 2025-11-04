import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from "../../context/UserContext";
import './HamburgerMenu.css';
import youtube from '../../assets/icons/youtube.png';
import instagram from '../../assets/icons/instagram.png';
import twitter from '../../assets/icons/twitter.png';
import bluesky from '../../assets/icons/bluesky.png';

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
              <Link className="hamburger-link" to="/account" onClick={() => setMenuOpen(false)}>
                {user.username}
              </Link>
            </li>
          )}
          <li><Link className="hamburger-link" to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link className="hamburger-link" to="/chapters" onClick={() => setMenuOpen(false)}>Chapters</Link></li>
          <li><Link className="hamburger-link" to="/wiki" onClick={() => setMenuOpen(false)}>Wiki</Link></li>
          <li><Link className="hamburger-link" to="/updates" onClick={() => setMenuOpen(false)}>Updates</Link></li>
          <li><Link className="hamburger-link" to="/support" onClick={() => setMenuOpen(false)}>Support</Link></li>
        </ul>
        <div className="hamburger-socials">
          <a href="https://www.youtube.com/@Gh0st_Zer-0" target="_blank" rel="noopener noreferrer"><img src={youtube} alt="Youtube" /></a>
          <a href="https://www.instagram.com/gh0st_zer0_/" target="_blank" rel="noopener noreferrer"><img src={instagram} alt="Instagram" /></a>
          <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><img src={twitter} alt="Twitter" /></a>
          <a href="https://bsky.app/profile/jdlowden.bsky.social" target="_blank" rel="noopener noreferrer"><img src={bluesky} alt="Bluesky" /></a>
        </div>
      </nav>
    </>
  );
};

export default HamburgerMenu;