import React from 'react';
import './Footer.css';
import youtube from '../../assets/icons/youtube.png';
import instagram from '../../assets/icons/instagram.png';
import twitter from '../../assets/icons/twitter.png';
import bluesky from '../../assets/icons/bluesky.png';

const Footer = () => {
    return (
        <div>
            <footer className="footer">
                <div className='socials'>
                    <a href="https://www.youtube.com/@Gh0st_Zer-0" target="_blank" rel="noopener noreferrer"><img src={youtube} alt="Youtube" /></a>
                    <a href="https://www.instagram.com/gh0st_zer0_/" target="_blank" rel="noopener noreferrer"><img src={instagram} alt="Instagram" /></a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><img src={twitter} alt="Twitter" /></a>
                    <a href="https://bsky.app/profile/jdlowden.bsky.social" target="_blank" rel="noopener noreferrer"><img src={bluesky} alt="Bluesky" /></a>
                </div>
                <p>Designed & Developed by Oscar Cawley</p>
            </footer>
        </div>
    );
};

export default Footer;