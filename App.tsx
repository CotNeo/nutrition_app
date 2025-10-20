import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import GoalSetupScreen from './src/screens/GoalSetupScreen';
import { Logger } from './src/utils/logger';

const Stack = createNativeStackNavigator();

/**
 * Navigation component that handles authenticated and unauthenticated routes
 */
const Navigation: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  Logger.log('Navigation', 'Rendering', { isLoggedIn: !!user });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // Authenticated routes
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Nutrition App' }}
            />
            <Stack.Screen
              name="GoalSetup"
              component={GoalSetupScreen}
              options={{ title: 'Hedeflerini Belirle' }}
            />
          </>
        ) : (
          // Unauthenticated routes
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

/**
 * Main App component that sets up providers and navigation
 * @returns Root component of the application
 */
export default function App() {
  Logger.log('App', 'Application started');

  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

