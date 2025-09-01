import React, { useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function VideoPredictor() {
  const [video, setVideo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!video) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('video', video);

    try {
      const res = await axios.post('http://127.0.0.1:5001/predict-video', formData);

      setResult(res.data);
    } catch (err) {
      alert('Error uploading video');
    }
    setLoading(false);
  };

  const pieData = result && {
    labels: ['Fake Frames', 'Real Frames'],
    datasets: [
      {
        data: [result.fake_frames, result.real_frames],
        backgroundColor: ['#f44336', '#4caf50'],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <span style={{ color: 'white' }}></span>Deepfake Video Detection
      </h1>

      <div style={styles.uploadContainer}>
        <input type="file" accept="video/*" onChange={handleVideoChange} style={styles.fileInput} />
        <button onClick={handleSubmit} disabled={loading} style={loading ? styles.submitButtonDisabled : styles.submitButton}>
          {loading ? 'Analyzing...' : 'Upload & Predict'}
        </button>
      </div>

      {loading && (
        <div style={styles.loaderContainer}>
          <div className="spinner" />
          <p style={{ fontSize: '16px', color: '#555' }}>Processing with AI...</p>
        </div>
      )}

      {result && (
        <div style={styles.resultSection}>
          <div style={styles.grid}>
            <div style={styles.videoBox}>
              
            <video width="50%" controls src={result.video_url} style={styles.video} />
              <h3
                style={{
                  ...styles.prediction,
                  color: result.final_prediction === 'Fake' ? '#e53935' : '#43a047',
                }}
              >
                Final Prediction: {result.final_prediction}
              </h3>
              <p style={styles.confidence}>Confidence: {result.confidence}%</p>
            </div>
           

            <div style={styles.chartContainer}>
              <h4>Prediction Summary</h4>
              <Pie data={pieData} />
            </div>
          </div>

          <h3 style={styles.framesTitle}>Analyzed Frames</h3>
          <div style={styles.framesContainer}>
            {result.frames.map((frame, index) => (
              <div key={index} style={styles.frame}>
                <img
                  src={`http://127.0.0.1:5001/frames/${frame.filename}`}

                  alt="frame"
                  style={{
                    ...styles.frameImage,
                    border: frame.label === 'Fake' ? '2px solid #f44336' : '2px solid #4caf50',
                  }}
                />
                <p style={styles.frameLabel}>{frame.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 20px',
    background: 'linear-gradient(135deg,rgb(8, 33, 61),rgb(40, 91, 100))',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: '2.4rem',
    textAlign: 'center',
    marginBottom: '25px',
    color: 'white',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  fileInput: {
    marginBottom: '10px',
    fontSize: '16px',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    color: 'black'
  },
  submitButton: {
    padding: '10px 22px',
    fontSize: '16px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  submitButtonDisabled: {
    padding: '10px 22px',
    fontSize: '16px',
    backgroundColor: '#9e9e9e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
    gap: '10px',
  },
  resultSection: {
    marginTop: '30px',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    marginBottom: '30px',
  },
  videoBox: {
    textAlign: 'center',
  },
  video: {
    maxWidth: '100%',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  prediction: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  confidence: {
    fontSize: '1.3rem',
    color: 'white',
    marginTop: '5px',

  },
  chartContainer: {
    width: '100%',
    maxWidth: '400px',
    margin: 'auto',
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  framesTitle: {
    fontSize: '1.9rem',
    color:'white',
    margin: '20px 0 10px',
    textAlign: 'center',
    color:'white'
  },
  framesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '15px',
  },
  frame: {
    textAlign: 'center',
  },
  frameImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  frameLabel: {
    marginTop: '5px',
    fontSize: '17px',
    fontWeight: 'bold',
    color:'white'
  },
};

export default VideoPredictor;