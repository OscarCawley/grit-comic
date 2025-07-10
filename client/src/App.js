import './App.css';
import Header from './components/Header/Header.js'
import Navigation from './components/Navigation/Navigation.js';
import Footer from './components/Footer/Footer.js';
import Home from './pages/Home/Home.js';
import Chapters from './pages/Chapters/Chapters.js';
import Support from './pages/Support/Support.js';
import Wiki from './pages/Wiki/Wiki.js';
import WikiDetail from './pages/WikiDetail/WikiDetail.js';
import Updates from './pages/Updates/Updates.js';
import LogInPage from './pages/LogInPage/LogInPage.js';
import SignUpPage from './pages/SignUpPage/SignUpPage.js'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage.js';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage.js';
import Admin from './pages/Admin/Admin.js';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.js';
import { BrowserRouter as Router, Route, Routes, } from 'react-router-dom';

function App() {
  return (
    <Router>
		<ScrollToTop />
		<Routes>
			<Route path="/admin" element={<Admin />} />
			<Route path="*" element={
				<div className="App">
					<Header />
					<Navigation />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/chapters" element={<Chapters />} />
						<Route path="/wiki" element={<Wiki />} />
						<Route path="/wiki/:slug" element={<WikiDetail />} />
						<Route path="/updates" element={<Updates />} />
						<Route path="/support" element={<Support />} />
						<Route path="/login" element={<LogInPage />} />
						<Route path="/signup" element={<SignUpPage />} />
						<Route path="/forgot-password" element={<ForgotPasswordPage />} />
						<Route path="/reset-password" element={<ResetPasswordPage />} />
					</Routes>
					<Footer />
				</div>}/>
		</Routes>
    </Router>  
  );
}

export default App;
