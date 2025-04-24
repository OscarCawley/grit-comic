import './Header.css';
import logo from '../../assets/logo.png';
import banner from '../../assets/banner.png';


const Header = () => {
    return (
        <div className='header'>
            <img src={logo} alt="Logo" />
            <img src={banner} alt="Banner Image" />
        </div>
    );
};

export default Header;