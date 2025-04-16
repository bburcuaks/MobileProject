import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AdminScreen from './screens/AdminScreen';
import UserScreen from './screens/UserScreen';
import AddGuideScreen from './screens/AddGuideScreen';
import AddPatientTestScreen from './screens/AddPatientTestScreen';
import TestQueryScreen from './screens/TestQueryScreen';
import TestResultsScreen from './screens/TestResultsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="User" 
            component={UserScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddGuide" 
            component={AddGuideScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AddPatientTest" 
            component={AddPatientTestScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TestQuery" 
            component={TestQueryScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TestResults" 
            component={TestResultsScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
