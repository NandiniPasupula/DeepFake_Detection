from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from werkzeug.utils import secure_filename
import os
from PIL import Image
from flask_cors import CORS  # enable CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Build the CNN model
def build_model():
    model = Sequential([
        Conv2D(16, (3, 3), activation='relu', input_shape=(128, 128, 3)),
        MaxPooling2D((2, 2)),
        Conv2D(32, (3, 3), activation='relu'),
        MaxPooling2D((2, 2)),
        Flatten(),
        Dense(64, activation='relu'),
        Dense(2, activation='softmax')  # 2 output classes: Real, Fake
    ])
    return model

# Load model weights
try:
    model = build_model()
    model.load_weights('models_saved/lightweight_cnn_model_final.h5')
    print(" Model loaded successfully.")
except Exception as e:
    print(" Error loading model:", e)
    model = None

# File validation
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Preprocessing function
def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((128, 128))
    img = np.array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# Prediction endpoint
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            image = preprocess_image(file_path)
            prediction = model.predict(image)[0]
            predicted_class = np.argmax(prediction)
            labels = ['Real', 'Fake']
            result = labels[predicted_class]
            confidence = float(prediction[predicted_class])

            return jsonify({
                "prediction": result,
                "probability": confidence
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid file format"}), 400

# Run the server
if __name__ == '__main__':
    app.run(debug=True)
