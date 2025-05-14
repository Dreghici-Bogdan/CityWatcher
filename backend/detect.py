from ultralytics import YOLO
from PIL import Image
import io
import numpy as np

model = YOLO("D:/Personale/BITSTONE CONTEST/backend/best_nano.pt")

def detect_issues(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((640, 640))  # or even smaller
    image_np = np.array(image)

    results = model(image_np)  # pass directly as array

    detections = []
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        label = model.names[cls_id]
        detections.append({
            "label": label,
            "confidence": round(conf, 2)
        })

    return detections
