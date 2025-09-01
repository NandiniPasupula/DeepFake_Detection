
import cv2
import numpy as np
import tempfile
from utils.image_utils import preprocess_image

def process_video(file, model, frame_sample_rate=10):
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    temp_video.write(file.read())
    temp_video.close()
    
    cap = cv2.VideoCapture(temp_video.name)
    preds = []
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_sample_rate == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            resized = cv2.resize(frame_rgb, (160, 160))
            normalized = resized / 255.0
            preds.append(model.predict(np.expand_dims(normalized, axis=0))[0][0])
        frame_count += 1

    cap.release()
    os.remove(temp_video.name)
    
    if not preds:
        return "Could not process video"
    
    avg_pred = np.mean(preds)
    return "Fake" if avg_pred > 0.5 else "Real"
