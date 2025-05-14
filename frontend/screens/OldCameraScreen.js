import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const [permission, setPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation();
  const cameraRef = useRef(null);

  const [type, setType] = useState(CameraType.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const locStatus = await Location.requestForegroundPermissionsAsync();
      setPermission(status === 'granted' && locStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      const location = await Location.getCurrentPositionAsync({});
      const formData = new FormData();

      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('lat', location.coords.latitude);
      formData.append('lon', location.coords.longitude);

      const response = await fetch('http://192.168.30.95:8000/analyze/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Detection Complete', `Detected: ${data.detections.map(d => d.label).join(', ')}`);
      } else {
        Alert.alert('Error', 'Failed to analyze image.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not capture or send photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCameraFacing = () => {
    setType(prev => (prev === CameraType.back ? CameraType.front : CameraType.back));
  };

  if (permission === null) return <View style={styles.container} />;

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Camera permission required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        type={type}
        ratio="16:9"
      />
      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePicture}
        disabled={isProcessing}
      >
        <Ionicons name={isProcessing ? 'hourglass-outline' : 'camera-outline'} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.flipButton}
        onPress={toggleCameraFacing}
      >
        <Ionicons name="camera-reverse-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 15,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  flipButton: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
});
