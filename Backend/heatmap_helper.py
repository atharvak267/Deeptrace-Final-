import cv2
import numpy as np

def generate_heatmap(frame_path, output_path):
    img = cv2.imread(frame_path)
    if img is None:
        return False
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    heatmap = np.zeros_like(gray, dtype=np.float32)
    
    if len(faces) > 0:
        for (x, y, w, h) in faces:
            center_x, center_y = x + w//2, y + h//2
            for i in range(heatmap.shape[0]):
                for j in range(heatmap.shape[1]):
                    dist = np.sqrt((i - center_y)**2 + (j - center_x)**2)
                    heatmap[i, j] += np.exp(- (dist**2) / (2 * (w/2)**2))
    else:
        heatmap[heatmap.shape[0]//2, heatmap.shape[1]//2] = 1.0

    heatmap = np.clip(heatmap, 0, 1)
    heatmap_uint8 = np.uint8(255 * heatmap)
    
    color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    superimposed_img = cv2.addWeighted(img, 0.6, color_heatmap, 0.4, 0)
    
    cv2.imwrite(output_path, superimposed_img)
    return True
