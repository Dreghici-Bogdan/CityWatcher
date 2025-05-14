import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ProblemList from './screens/ProblemList';
import UserScreen from './screens/UserScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          animation: 'none',
          presentation: 'card'
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Documents" component={ProblemList} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Notifications" component={ProblemList} />
        <Stack.Screen name="Profile" component={UserScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};