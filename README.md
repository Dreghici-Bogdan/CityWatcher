# 🏙️ CityWatcher — Smart Detection of City Infrastructure Problems

Urban AI is a mobile-first app built to detect and geotag common urban issues such as **graffiti** and **potholes** using computer vision and AI. It empowers citizens and city authorities to collaboratively improve urban infrastructure through an intuitive reporting platform.

Developed as part of the **BitStone AI Hackathon 2025**, this project showcases how modern AI models like YOLOv8, geolocation, and map visualizations can come together to solve real-world problems.

---

## 🚀 Features

- 📸 **AI-Powered Detection**: Automatically detects potholes and graffiti in images using a trained YOLOv8 model.
- 🗺️ **Map View**: Clusters and displays all reported problems on a stylized map.
- 📍 **Geo-tagged Reports**: Each issue is tagged with real GPS coordinates and city name.
- 📤 **Camera & Gallery Upload**: Users can take a photo or choose one from their gallery to report issues.
- 📊 **Problem List with Filters**: View, filter, and generate reports based on type, city, or time.
---

## 🛠️ Tech Stack

| Layer       | Technology                                 |
|------------|---------------------------------------------|
| Frontend   | React Native (Expo SDK 53)                  |
| Backend    | FastAPI (Python 3.10+)                      |
| AI Model   | YOLOv8n (Ultralytics, trained via Colab)    |
| Maps       | react-native-maps with clustering           |
| Storage    | AsyncStorage & Expo FileSystem              |
| Location   | expo-location & Nominatim reverse geocoder  |
---

## 📦 Setup Instructions

### 🖥 Backend (FastAPI + YOLOv8)

1. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2. **YOLOv8 Setup**:
    - Make sure `ultralytics` is installed (`pip install ultralytics`)
    - Place your model (`best_nano.pt`) in the `backend/` folder
    - Optionally replace `detect.py` with a mock version for demo/testing

3. **Run the server**:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

4. The backend will be available at:
    ```
    http://192.168.1.94:8000
    ```

---

### 📱 Frontend (React Native with Expo)

1. **Install dependencies**:
    ```bash
    npm install
    ```

2. **Start the Expo app**:
    ```bash
    npx expo start
    ```

3. **Run on device**:
    - Use the Expo Go app or your emulator
    - Make sure your device is on the same Wi-Fi network as the backend

4. **Important**: If testing offline or for demo purposes:
    - Use the fallback setup that returns “graffiti” by default after 10 seconds
    - See the modified `App.tsx` and backend `main.py` for simulated AI logic

---

## 📂 Project Structure

