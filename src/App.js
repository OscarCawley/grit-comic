import './App.css';
import Header from './components/Header.js'
import Navigation from './components/Navigation.js'
import ComicViewer from './components/ComicViewer.js';
import Chapters from './pages/Chapters.js';

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
