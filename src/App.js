import './App.css';
import Header from './components/Header/Header.js'
import Navigation from './components/Navigation/Navigation.js';
import Footer from './components/Footer/Footer.js';
import ComicViewer from './components/ComicViewer/ComicViewer.js';
import Chapters from './pages/Chapters/Chapters.js';
import Support from './pages/Support/Support.js';
import Wiki from './pages/Wiki/Wiki.js';
import Updates from './pages/Updates/Updates.js';
import LogInPage from './pages/LogInPage/LogInPage.js';
import SignUpPage from './pages/SignUpPage/SignUpPage.js'
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
		<div className="App">
			<Header />
			<Navigation />
			<Routes>
				<Route path="/" element={<ComicViewer />} />
				<Route path="/chapters" element={<Chapters />} />
				<Route path="/wiki" element={<Wiki />} />
				<Route path="/updates" element={<Updates />} />
				<Route path="/support" element={<Support />} />
				<Route path='/login' element={<LogInPage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/resetpassword' element={<ResetPasswordPage />} />
			</Routes>
			<Footer />
      	</div>
    </Router>  
  );
}

export default App;
