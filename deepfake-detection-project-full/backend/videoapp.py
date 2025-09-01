from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
import os
import uuid
from werkzeug.utils import secure_filename
from flask_cors import CORS
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

# Initialize app
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
FRAME_FOLDER = 'frames'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAME_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

classes = ['Fake', 'Real']

# ✅ Rebuild the CNN model (same architecture used for training)
def build_model():
    model = Sequential([
        Conv2D(16, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        MaxPooling2D((2, 2)),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(64, activation='relu'),
        Dense(2, activation='softmax')
    ])
    return model

# ✅ Load the model weights only
try:
    model = build_model()
    model.load_weights('models_Saved/lightweight_cnn_model_final.h5')
    print("✅ Model loaded successfully for video app.")
except Exception as e:
    print("❌ Error loading model for video app:", e)
    model = None

# ✅ Frame preprocessing
def preprocess_frame(frame, target_size=(128, 128)):
    frame = cv2.resize(frame, target_size)
    frame = frame.astype(np.float32) / 255.0
    return np.expand_dims(frame, axis=0)

# ✅ Prediction function for video
def predict_video(video_path, max_frames=60, frame_step=5):
    cap = cv2.VideoCapture(video_path)
    fake_count = real_count = processed = frame_idx = 0
    frame_results = []

    while cap.isOpened() and processed < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % frame_step == 0:
            input_tensor = preprocess_frame(frame)
            pred = model.predict(input_tensor)[0]
            label_idx = int(np.argmax(pred))
            label = classes[label_idx]

            # Save frame for frontend display
            filename = f"{uuid.uuid4().hex}_{label}.jpg"
            path = os.path.join(FRAME_FOLDER, filename)
            cv2.imwrite(path, frame)

            if label == 'Fake':
                fake_count += 1
            else:
                real_count += 1

            frame_results.append({
                "filename": filename,
                "label": label,
                "confidence": float(pred[label_idx])
            })

            processed += 1
        frame_idx += 1

    cap.release()
    final_prediction = 'Fake' if fake_count > real_count else 'Real'
    confidence = round((max(fake_count, real_count) / (fake_count + real_count)) * 100, 2)

    return {
        "final_prediction": final_prediction,
        "confidence": confidence,
        "fake_frames": fake_count,
        "real_frames": real_count,
        "frames": frame_results
    }

# ✅ POST route to accept video and predict
@app.route('/predict-video', methods=['POST'])
def predict_video_route():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if 'video' not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files['video']
    filename = secure_filename(video.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    video.save(filepath)

    try:
        result = predict_video(filepath)
        result["video_url"] = f"http://127.0.0.1:5001/uploads/{filename}"
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Serve uploaded video file
@app.route('/uploads/<filename>')
def get_uploaded_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ✅ Serve frame thumbnails
@app.route('/frames/<filename>')
def get_frame_image(filename):
    return send_from_directory(FRAME_FOLDER, filename)

# ✅ Run server
if __name__ == '__main__':
    
    app.run(debug=True, port=5001)