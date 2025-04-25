import {Link} from 'react-router-dom';
import './Header.css';


const Header = () => {
    return (
        <div className='header'>
            <Link to='/' className='header-title-link'><h1>GRIT COMIC</h1></Link>
            <div className='account-container'>
                <Link to="/login"><button>LOGIN</button></Link>
            </div>
            
        </div>
    );
};

export default Header;