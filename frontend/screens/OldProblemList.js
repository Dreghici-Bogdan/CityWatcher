import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import BottomNav from '../components/BottomNav';

const MARKERS_FILE = FileSystem.documentDirectory + 'markers.json';

export default function ProblemList() {
  const [allProblems, setAllProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const local = await FileSystem.readAsStringAsync(MARKERS_FILE);
        const data = JSON.parse(local);
        setAllProblems(data);
        setFilteredProblems(data);
      } catch (err) {
        console.log('Failed to load markers:', err);
      }
    })();
  }, []);

  const applyFilters = () => {
    const now = new Date();
    const filtered = allProblems.filter((item) => {
      const timestamp = new Date(item.timestamp);
      const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24);
      const matchesCity = city ? item.city.toLowerCase().includes(city.toLowerCase()) : true;
      const matchesType = type ? item.label.toLowerCase().includes(type.toLowerCase()) : true;
      return matchesCity && matchesType;
    });
    setFilteredProblems(filtered);
  };

  const filterByAge = (days, newer = true) => {
    const now = new Date();
    const filtered = allProblems.filter((item) => {
      const timestamp = new Date(item.timestamp);
      const ageInDays = (now - timestamp) / (1000 * 60 * 60 * 24);
      return newer ? ageInDays <= days : ageInDays > days;
    });
    setFilteredProblems(filtered);
  };

  const generatePDF = async () => {
    try {
      const res = await fetch('http://192.168.1.94:8000/generate_report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredProblems),
      });
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const uri = FileSystem.documentDirectory + 'report.pdf';
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('Success', 'PDF generated and saved to: ' + uri);
    } catch (err) {
      console.log('PDF generation failed:', err);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📋 Reported Urban Issues</Text>

      <ScrollView contentContainerStyle={styles.filterContainer}>
        <TextInput
          placeholder="Filter by city"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <TextInput
          placeholder="Filter by type (e.g., pothole)"
          value={type}
          onChangeText={setType}
          style={styles.input}
        />

        <View style={styles.buttonWrap}>
          <TouchableOpacity style={styles.smallButton} onPress={applyFilters}>
            <Text style={styles.buttonText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={() => filterByAge(90, false)}>
            <Text style={styles.buttonText}>Older than 90d</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={() => filterByAge(2, true)}>
            <Text style={styles.buttonText}>Newer than 2d</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallPdfButton} onPress={generatePDF}>
            <Text style={styles.pdfButtonText}>📄 Generate PDF</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FlatList
        data={filteredProblems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>{item.label.toUpperCase()}</Text>
            <Text style={styles.city}>📍 {item.city}</Text>
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
    color: '#333'
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16
  },
  buttonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12
  },
  smallButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexBasis: '48%',
    alignItems: 'center'
  },
  smallPdfButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexBasis: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  city: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4
  },
  timestamp: {
    fontSize: 13,
    color: '#999'
  }
});
