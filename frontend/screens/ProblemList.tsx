import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import BottomNav from '../components/BottomNav';

const MARKERS_FILE = FileSystem.documentDirectory + "markers.json";

interface Problem {
  label: string;
  lat: number;
  lon: number;
  timestamp: string;
  city?: string;
}

const ProblemCard = ({ problem }: { problem: Problem }) => {
  const date = new Date(problem.timestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.labelContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.label}>{problem.label}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.coordinates}>
            {problem.city || 'Loading city...'}
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="navigate" size={18} color="#007AFF" />
            <Text style={styles.actionText}>Navigate</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={18} color="#007AFF" />
            <Text style={styles.actionText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const getCityName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      if (response && response[0]) {
        return response[0].city || response[0].subregion || 'Unknown location';
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Error getting city name:', error);
      return 'Unknown location';
    }
  };

  const loadProblems = async () => {
    try {
      const data = await FileSystem.readAsStringAsync(MARKERS_FILE);
      let loadedProblems = JSON.parse(data) as Problem[];
      
      // Get city names for all problems
      const problemsWithCities = await Promise.all(
        loadedProblems.map(async (problem) => ({
          ...problem,
          city: await getCityName(problem.lat, problem.lon),
        }))
      );

      setProblems(problemsWithCities);
      
      // Extract unique cities
      const uniqueCities = Array.from(
        new Set(problemsWithCities.map(p => p.city))
      ).filter(Boolean);
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error loading problems:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProblems();
    setRefreshing(false);
  };

  const filteredProblems = selectedCity
    ? problems.filter(p => p.city === selectedCity)
    : problems;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Problems</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredProblems.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {filteredProblems.filter(p => p.timestamp > new Date(Date.now() - 86400000).toISOString()).length}
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCity && styles.filterChipSelected
            ]}
            onPress={() => setSelectedCity(null)}
          >
            <Text style={[
              styles.filterChipText,
              !selectedCity && styles.filterChipTextSelected
            ]}>All Cities</Text>
          </TouchableOpacity>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[
                styles.filterChip,
                selectedCity === city && styles.filterChipSelected
              ]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCity === city && styles.filterChipTextSelected
              ]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProblems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ProblemCard problem={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No problems reported yet</Text>
          </View>
        }
        contentInset={{ bottom: 100 }}
        contentInsetAdjustmentBehavior="automatic"
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 30,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
    marginRight: 30,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
}); 