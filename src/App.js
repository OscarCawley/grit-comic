import './App.css';
import Header from './components/Header.js'
import Body from './components/Body.js'
import ComicViewer from './components/ComicViewer.js';

function App() {
  return (
    <div className="App">
      <Header />
      <ComicViewer />
    </div>
  );
}

export default App;
