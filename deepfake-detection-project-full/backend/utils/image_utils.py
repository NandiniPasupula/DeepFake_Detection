
import cv2
import numpy as np
from PIL import Image

def preprocess_image(file, target_size=(160, 160)):
    img = Image.open(file).convert('RGB')
    img = img.resize(target_size)
    img = np.array(img) / 255.0
    return img
