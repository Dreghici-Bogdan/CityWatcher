import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const getIconColor = (routeName) => {
    return route.name === routeName ? '#007AFF' : '#666';
  };

  const getTextColor = (routeName) => {
    return route.name === routeName ? '#007AFF' : '#999';
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home" size={24} color={getIconColor('Home')} />
        <Text style={[styles.navText, { color: getTextColor('Home') }]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navItem, styles.addButton]}
        onPress={() => navigation.navigate('Camera')}
      >
        <View style={styles.addButtonCircle}>
          <Ionicons name="add" size={32} color="white" />
        </View>
        <Text style={[styles.navText, { color: getTextColor('Camera') }]}>Add</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Documents')}
      >
        <Ionicons name="document-text-outline" size={24} color={getIconColor('Documents')} />
        <Text style={[styles.navText, { color: getTextColor('Documents') }]}>Reports</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 43,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 3,
    flex: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    marginTop: -20,
  },
  addButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default BottomNav; 