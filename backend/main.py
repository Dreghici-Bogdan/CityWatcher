from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from detect import detect_issues
from suggest import get_suggestions
from report import generate_pdf
from geopy.geocoders import Nominatim
import os
import traceback
from models.marker import Marker
from typing import List
from datetime import datetime
import json
from pathlib import Path

MARKERS_FILE = Path("markers.json")
markers: List[Marker] = []

def save_markers():
    with MARKERS_FILE.open("w") as f:
        json.dump([m.dict() for m in markers], f)

def load_markers():
    global markers
    if MARKERS_FILE.exists():
        with MARKERS_FILE.open() as f:
            markers_data = json.load(f)
            markers = [Marker(**m) for m in markers_data]

load_markers()

app = FastAPI()

@app.post("/analyze/")
async def analyze(image: UploadFile = File(...), lat: float = Form(...), lon: float = Form(...)):
    try:
        img_bytes = await image.read()

        detection_results = detect_issues(img_bytes)
        suggestions = get_suggestions(detection_results)

        geolocator = Nominatim(user_agent="urban-ai")
        location = geolocator.reverse((lat, lon), language='en')
        address = location.address if location else "Unknown location"

        # ✅ Extract city from reverse geocoding
        city = location.raw.get("address", {}).get("city") or \
               location.raw.get("address", {}).get("town") or \
               location.raw.get("address", {}).get("village") or \
               "Unknown"

        report_filename = generate_pdf(detection_results, suggestions, address)

        timestamp = datetime.utcnow().isoformat()
        for detection in detection_results:
            marker = Marker(
                lat=lat,
                lon=lon,
                label=detection["label"],
                timestamp=timestamp,
                city=city  # ✅ Include city in each marker
            )
            markers.append(marker)

        save_markers()

        return {
            "detections": detection_results,
            "suggestions": suggestions,
            "report_url": f"http://192.168.30.95:8000/reports/{report_filename}",
            "address": address,
            "city": city  # Optional: return to frontend if needed
        }

    except Exception as e:
        print("❌ BACKEND ERROR:", str(e))
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/markers.json")
def download_markers_file():
    return FileResponse("markers.json", media_type="application/json", filename="markers.json")

@app.post("/generate_report/")
async def generate_report(markers: List[Marker]):
    try:
        # Example simple report for now
        report_content = "\\n".join(
            f"{m.timestamp} - {m.label.upper()} in {m.city}" for m in markers
        )
        filename = "filtered_report.pdf"

        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        for line in report_content.split("\\n"):
            pdf.cell(200, 10, txt=line, ln=True)
        pdf.output(filename)

        return FileResponse(filename, media_type='application/pdf')
    except Exception as e:
        print("Report generation failed:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
