import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../styles/ImagePredictor.css';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#4caf50', '#f44336']; // Green (Real), Red (Fake)

function ImagePredictor() {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const dropRef = useRef(null);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setResult('');
    setConfidence(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add('drag-over');
  };

  const handleDragLeave = () => {
    dropRef.current.classList.remove('drag-over');
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true);
    setResult('');
    setConfidence(null);

    try {
      const response = await axios.post("http://localhost:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const prediction = response.data.prediction;
      const prob = response.data.probability || null;

      setResult(prediction);
      setConfidence(prob);
      setHistory([...history, { image: preview, prediction, prob }]);
    } catch (error) {
      console.error('Prediction error:', error);
      setResult('Error during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult('');
    setConfidence(null);
  };

  const predictionChartData = confidence !== null ? [
    { name: 'Real', value: result === 'Fake' ? 1 - confidence : confidence },
    { name: 'Fake', value: result === 'Fake' ? confidence : 1 - confidence },
  ] : [];

  const historyBarData = [
    { name: 'Real', value: history.filter(h => h.prediction === 'Real').length },
    { name: 'Fake', value: history.filter(h => h.prediction === 'Fake').length },
  ];

  return (
    <div className="image-predictor">
      <h1> Deepfake Image Checker</h1>

      <div
        className="drop-zone"
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>📥 Drag & Drop an image here, or click to upload</p>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {preview && (
        <>
          <img src={preview} alt="Preview" className="preview-img" />
          <div className="buttons">
            <button onClick={handlePredict} disabled={loading}>
              {loading ? '🔍 Predicting...' : 'Upload & Predict'}
            </button>
            <button onClick={reset} className="reset-btn">Clear</button>
          </div>
        </>
      )}

      {loading && (
        <p style={{ color: '#00e6ff', marginTop: '15px', fontSize: '18px' }}>
           Analyzing with AI...
        </p>
      )}

     {result && (
  <div className="result-section">
    <div className="result-info">
      <div className={`result-text ${result === 'Real' ? 'real' : 'fake'}`}>
        <p><strong>Result:</strong> {result}</p>
        {confidence !== null && (
          <p><strong>Confidence:</strong> {(confidence * 100).toFixed(2)}%</p>
        )}
      </div>

      {predictionChartData.length > 0 && (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={predictionChartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${(value * 100).toFixed(1)}%`}
              >
                {predictionChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
)}

      {history.length > 0 && (
        <>
          <div className="history-section">
            <h2>🕓 Prediction History</h2>
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-card">
                  <img src={item.image} alt={`Prediction ${index}`} />
                  <p>{item.prediction}</p>
                  {item.prob && <small>Conf: {(item.prob * 100).toFixed(2)}%</small>}
                </div>
              ))}
            </div>
          </div>

          <div className="chart-section">
            <h2>📊 History Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historyBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default ImagePredictor;
