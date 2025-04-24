import React from 'react';
import { Link } from 'react-router-dom'
import './Navigation.css';

const Navigation = () => {
    return (
        <div className='navigation'>
            <div className='main-buttons'>
                <Link to="/chapters"><button>CHAPTERS</button></Link>
                <Link to="/wiki"><button>WIKI</button></Link>
                <Link to="/updates"><button>UPDATES</button></Link>
                <Link to="/support"><button>SUPPORT</button></Link>
            </div>
            <div className='socials'>
                <a href="https://www.youtube.com/@Gh0st_Zer-0" target="_blank" rel="noopener noreferrer">YouTube</a>
                <a href="https://www.instagram.com/gh0st_zer0_/" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://bsky.app/profile/jdlowden.bsky.social" target="_blank" rel="noopener noreferrer">Bluesky</a>
            </div>
        </div>
    );
};

export default Navigation;