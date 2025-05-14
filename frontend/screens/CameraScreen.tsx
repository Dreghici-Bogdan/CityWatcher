import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState, useEffect } from "react";
import {
  Alert,
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

const MARKERS_FILE = FileSystem.documentDirectory + "markers.json";

const saveLocalMarkers = async (markerList: any[]) => {
  await FileSystem.writeAsStringAsync(MARKERS_FILE, JSON.stringify(markerList));
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);
  const [detectionLabel, setDetectionLabel] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const data = await FileSystem.readAsStringAsync(MARKERS_FILE);
        setMarkers(JSON.parse(data));
      } catch {
        setMarkers([]);
      }
    })();
  }, []);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (!photo?.uri) return;

    setUri(photo.uri);
    setLoading(true);

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    const formData = new FormData();
    formData.append("image", {
      uri: photo.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);
    formData.append("lat", loc.coords.latitude.toString());
    formData.append("lon", loc.coords.longitude.toString());

    try {
      const response = await fetch("http://192.168.1.94:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.detections?.length > 0) {
        setDetectionLabel(data.detections[0].label);
      } else {
        Alert.alert("No detection", "Nothing detected in this photo.");
        setUri(null);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Failed to analyze the photo.");
      setUri(null);
    }
  };

  const uploadFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const selected = result.assets[0];
      setUri(selected.uri);
      setLoading(true);

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const formData = new FormData();
      formData.append("image", {
        uri: selected.uri,
        type: "image/jpeg",
        name: "uploaded.jpg",
      } as any);
      formData.append("lat", loc.coords.latitude.toString());
      formData.append("lon", loc.coords.longitude.toString());

      try {
        const response = await fetch("http://192.168.1.94:8000/analyze/", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok && data.detections?.length > 0) {
          setDetectionLabel(data.detections[0].label);
        } else {
          Alert.alert("No detection", "Nothing detected in this image.");
          setUri(null);
        }
      } catch (err) {
        setLoading(false);
        Alert.alert("Error", "Upload failed.");
        setUri(null);
      }
    }
  };

  const publishMarker = async () => {
    const newMarker = {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      label: detectionLabel,
      timestamp: new Date().toISOString(),
    };
    const updated = [...markers, newMarker];
    setMarkers(updated);
    await saveLocalMarkers(updated);
    setUri(null);
    setDetectionLabel("");
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderPicture = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: uri as string }} contentFit="cover" style={styles.previewImage} />
      <View style={styles.previewOverlay}>
        {loading ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.processingText}>AI magic happening...</Text>
          </View>
        ) : (
          <View style={styles.labelEditor}>
            <TextInput
              value={detectionLabel}
              onChangeText={setDetectionLabel}
              placeholder="Detected problem"
              placeholderTextColor="#ccc"
              style={styles.input}
            />
            <Button title="Publish Problem" onPress={publishMarker} />
          </View>
        )}
      </View>
    </View>
  );

  const renderCamera = () => (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={ref}
        mode="picture"
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      />
      <View style={styles.shutterContainer}>
        <Pressable onPress={uploadFromGallery}>
          <Feather name="upload" size={32} color="white" />
        </Pressable>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
              <View style={[styles.shutterBtnInner, { backgroundColor: "white" }]} />
            </View>
          )}
        </Pressable>
        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
      </View>

      <Pressable 
        style={styles.exitButton} 
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="close" size={24} color="white" />
      </Pressable>
    </View>
  );

  return <View style={styles.container}>{uri ? renderPicture() : renderCamera()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  previewContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  processingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  processingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
  },
  labelEditor: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#222",
    borderRadius: 8,
    color: "white",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  exitButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
