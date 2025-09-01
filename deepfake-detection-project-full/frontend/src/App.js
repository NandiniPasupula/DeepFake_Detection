// App.js
import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ImagePredictor from './components/ImagePredictor';
import VideoPredictor from './components/VideoPredictor';
import { FaRobot, FaImage, FaVideo, FaHome } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo"><FaRobot className="nav-icon" /> FauxBuster</div>
      <ul className="navbar-links">
        <li><Link to="/"><FaHome /> Home</Link></li>
        <li><Link to="/image"><FaImage /> Image Prediction</Link></li>
        <li><Link to="/video"><FaVideo /> Video Prediction</Link></li>
      </ul>
    </nav>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <h1>Welcome to <span className="faux-text">FauxBuster</span></h1>
      <p className="subtitle">AI-Powered Deepfake Detector for Unmasking Deepfakes with Precision</p>
      
      <div className="options-container">
        <div className="option-card" onClick={() => navigate('/image')}>
          <FaImage className="option-icon" />
          <h2>Image Prediction</h2>
          <p>Check if an image is real or AI-generated.</p>
        </div>
        <div className="option-card" onClick={() => navigate('/video')}>
          <FaVideo className="option-icon" />
          <h2>Video Prediction</h2>
          <p>Analyze videos for deepfake content.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image" element={<ImagePredictor />} />
        <Route path="/video" element={<VideoPredictor />} />
      </Routes>
    </Router>
  );
}

export default App;
