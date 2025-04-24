import React from 'react';
import { Link } from 'react-router-dom'
import './Navigation.css';

const Navigation = () => {
    return (
        <div className='navigation'>
            <Link to="/chapters"><button>CHAPTERS</button></Link>
            <Link to="/wiki"><button>WIKI</button></Link>
            <Link to="/updates"><button>UPDATES</button></Link>
            <Link to="/support"><button>SUPPORT</button></Link>
        </div>
    );
};

export default Navigation;