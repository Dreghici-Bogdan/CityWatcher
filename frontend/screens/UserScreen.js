import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNav';

export default function UserScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>User profile or stats</Text>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA',
  },
  text: { 
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});