import React from 'react';
import { Link } from 'react-router-dom'

const Navigation = () => {
    return (
        <div>
            <Link to="/chapters"><button>CHAPTERS</button></Link>
            <Link to="/wiki"><button>WIKI</button></Link>
            <Link to="/updates"><button>UPDATES</button></Link>
            <Link to="/support"><button>SUPPORT</button></Link>
        </div>
    );
};

export default Navigation;