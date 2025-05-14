import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';

const MARKERS_FILE = FileSystem.documentDirectory + 'markers.json';
const REGION_KEY = 'last_map_region';

const customMapStyle = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const HomeScreen = () => {
  const [region, setRegion] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const saveRegion = async (region) => {
    try {
      await AsyncStorage.setItem(REGION_KEY, JSON.stringify(region));
    } catch (e) {
      console.log('Failed to save region:', e);
    }
  };

  const loadSavedRegion = async () => {
    try {
      const saved = await AsyncStorage.getItem(REGION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRegion(parsed);
        return true;
      }
    } catch (e) {
      console.log('Failed to load region:', e);
    }
    return false;
  };

  const fetchUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
      setRegion(newRegion);
      await saveRegion(newRegion);
    } catch (e) {
      console.log('Failed to fetch user location:', e);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const found = await loadSavedRegion();
      if (!found) {
        await fetchUserLocation();
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
const fetchMarkers = async () => {
  setLoading(true);
  try {
    const local = await FileSystem.readAsStringAsync(MARKERS_FILE);
    const parsed = JSON.parse(local);
    if (Array.isArray(parsed)) {
      setMarkers(parsed);
      console.log('✅ Loaded markers from local file.');
    }
  } catch (err) {
    console.log('❌ Failed to load markers from file:', err.message);
    setMarkers([]);
  }
  setLoading(false);
};


      fetchMarkers();
    }, [])
  );

  const handleMyLocation = async () => {
    await fetchUserLocation();
  };

  const getColorForLabel = (label) => {
    switch (label) {
      case 'graffiti':
        return '#FF6B6B';
      case 'pothole':
        return '#4ECDC4';
      default:
        return '#999';
    }
  };

  const filteredMarkers = markers.filter((m) =>
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by type (e.g., graffiti)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {!region ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loaderText}>Fetching your location...</Text>
        </View>
      ) : (
        <MapViewClustering
          minZoom={5}      // ⬅️ prevents excessive zooming out
          maxZoom={20}     // optional: limits zoom-in too
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion);
            saveRegion(newRegion);
          }}
          customMapStyle={customMapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          rotateEnabled={true}
          clusterColor="#007AFF"
          clusterTextColor="white"
          mapRef={() => {}}
        >
          {filteredMarkers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.lat,
                longitude: marker.lon,
              }}
              title={marker.label}
              description={new Date(marker.timestamp).toLocaleString()}
            >
              <View style={styles.markerDot(getColorForLabel(marker.label))} />
            </Marker>
          ))}
        </MapViewClustering>
      )}

      {/* My Location Button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
        <Ionicons name="locate" size={24} color="#007AFF" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  map: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#444',
    fontSize: 16,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerDot: (color) => ({
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: color,
    borderColor: 'white',
    borderWidth: 2,
  }),
});

export default HomeScreen;