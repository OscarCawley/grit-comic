import './App.css';
import Header from './components/Header/Header.js'
import Navigation from './components/Navigation/Navigation.js';
import ComicViewer from './components/ComicViewer/ComicViewer.js';
import Chapters from './pages/Chapters/Chapters.js';
import Support from './pages/Support/Support.js';
import Wiki from './pages/Wiki/Wiki.js';
import Updates from './pages/Updates/Updates.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
		<div className="App">
			<Header />
			<Navigation />
			<Routes>
				<Route path="/" element={<Chapters />} />
				<Route path="/chapters" element={<Chapters />} />
				<Route path="/wiki" element={<Wiki />} />
				<Route path="/updates" element={<Updates />} />
				<Route path="/support" element={<Support />} />
			</Routes>
      	</div>
    </Router>  
  );
}

export default App;
