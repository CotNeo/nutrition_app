import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import GoalSetupScreen from './src/screens/GoalSetupScreen';
import MealAddScreen from './src/screens/MealAddScreen';
import MealHistoryScreen from './src/screens/MealHistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
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

  /**
   * Check if user has completed their profile
   * Required: age, weight, height, gender, goal
   */
  const isProfileComplete = user && 
    user.age && 
    user.weight && 
    user.height && 
    user.gender && 
    user.goal;

  Logger.log('Navigation', 'Rendering', { 
    isLoggedIn: !!user,
    isProfileComplete: !!isProfileComplete 
  });

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
        {!user ? (
          // 1. Not logged in -> Auth Screen
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : !isProfileComplete ? (
          // 2. Logged in but profile incomplete -> Goal Setup (forced)
          <Stack.Screen
            name="GoalSetup"
            component={GoalSetupScreen}
            options={{ 
              title: 'Hedeflerini Belirle',
              headerLeft: () => null, // Disable back button
              gestureEnabled: false, // Disable swipe back
            }}
          />
        ) : (
          // 3. Logged in and profile complete -> Main App
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Nutrition App' }}
            />
            <Stack.Screen
              name="GoalSetup"
              component={GoalSetupScreen}
              options={{ title: 'Hedeflerini Güncelle' }}
            />
            <Stack.Screen
              name="MealAdd"
              component={MealAddScreen}
              options={{ title: 'Öğün Ekle' }}
            />
            <Stack.Screen
              name="MealHistory"
              component={MealHistoryScreen}
              options={{ title: 'Öğün Geçmişi' }}
            />
            <Stack.Screen
              name="Stats"
              component={StatsScreen}
              options={{ title: 'İstatistikler & Raporlar' }}
            />
          </>
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

