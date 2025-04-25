import './Header.css';
import LogIn from '../LogIn/LogIn.js';
import SignUp from '../SignUp/SignUp.js';


const Header = () => {
    return (
        <div className='header'>
            <h1>GRIT COMIC</h1>
            <div className='header-buttons'>
                <LogIn />
                <SignUp />
            </div>
        </div>
    );
};

export default Header;