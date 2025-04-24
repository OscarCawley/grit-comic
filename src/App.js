import './App.css';
import Header from './components/Header/Header.js'
import Navigation from './components/Navigation/Navigation.js';
import ComicViewer from './components/ComicViewer/ComicViewer.js';
import Chapters from './pages/Chapters/Chapters.js';

function App() {
  return (
    <div className="App">
      <Header />
      <Navigation />
      <Chapters />
    </div>
  );
}

export default App;
