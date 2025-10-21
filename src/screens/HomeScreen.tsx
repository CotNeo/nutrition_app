import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import StreakCard from '../components/StreakCard';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { NutritionService } from '../services/nutritionService';
import { CalorieCalculator } from '../services/calorieCalculator';
import { StreakService } from '../services/streakService';
import { useAuth } from '../contexts/AuthContext';
import { Logger } from '../utils/logger';
import { CalorieGoals } from '../types';
import Colors from '../styles/colors';

/**
 * Home Screen component
 * Displays nutrition summary and navigation options
 */
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [calorieGoals, setCalorieGoals] = useState<CalorieGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [hasTodayMeal, setHasTodayMeal] = useState(false);
  const [trackedDates, setTrackedDates] = useState<Date[]>([]); // Dates with meals
  const [fadeAnim] = useState(new Animated.Value(0));

  /**
   * Load daily nutrition data and goals on component mount
   */
  useEffect(() => {
    loadDailyNutrition();
    loadUserGoals();
    loadTrackedDates();
    loadStreakData();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [user, selectedDate]);

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyNutrition();
    loadUserGoals();
    await loadTrackedDates();
    await loadStreakData();
    setRefreshing(false);
  };

  /**
   * Fetches and sets daily nutrition data for selected date
   */
  const loadDailyNutrition = async () => {
    try {
      Logger.log('HomeScreen', 'Loading daily nutrition', { date: selectedDate });
      setLoading(true);

      // Get nutrition for selected date
      const nutrition = await NutritionService.calculateDailyNutrition(selectedDate);

      setDailyNutrition(nutrition);
      Logger.log('HomeScreen', 'Daily nutrition loaded', nutrition);
    } catch (error) {
      Logger.error('HomeScreen', 'Failed to load daily nutrition', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads dates that have tracked meals
   */
  const loadTrackedDates = async () => {
    try {
      const meals = await NutritionService.getMeals();
      const uniqueDates = meals.reduce((acc: Date[], meal) => {
        const mealDate = new Date(meal.date);
        const exists = acc.some(
          (d) =>
            d.getDate() === mealDate.getDate() &&
            d.getMonth() === mealDate.getMonth() &&
            d.getFullYear() === mealDate.getFullYear()
        );
        if (!exists) {
          acc.push(mealDate);
        }
        return acc;
      }, []);
      setTrackedDates(uniqueDates);
      Logger.log('HomeScreen', 'Tracked dates loaded', { count: uniqueDates.length });
    } catch (error) {
      Logger.error('HomeScreen', 'Failed to load tracked dates', error);
    }
  };

  /**
   * Loads streak data
   */
  const loadStreakData = async () => {
    try {
      Logger.log('HomeScreen', 'Loading streak data');
      
      // Calculate current streak
      const currentStreak = await StreakService.calculateStreak();
      setStreak(currentStreak);
      
      // Get longest streak
      const longest = await StreakService.getLongestStreak();
      setLongestStreak(longest);
      
      // Check if today has meal
      const todayHasMeal = await StreakService.hasTodayMeal();
      setHasTodayMeal(todayHasMeal);
      
      Logger.log('HomeScreen', 'Streak data loaded', {
        streak: currentStreak,
        longest,
        hasTodayMeal: todayHasMeal,
      });
    } catch (error) {
      Logger.error('HomeScreen', 'Failed to load streak data', error);
    }
  };

  /**
   * Handles date selection from calendar
   */
  const handleDateSelect = (date: Date) => {
    Logger.log('HomeScreen', 'Date changed', { date });
    setSelectedDate(date);
  };

  /**
   * Loads user's calorie goals
   */
  const loadUserGoals = () => {
    if (!user) return;

    Logger.log('HomeScreen', 'Loading user goals');
    const goals = CalorieCalculator.calculateUserGoals(user);
    setCalorieGoals(goals);
    
    if (!goals) {
      Logger.log('HomeScreen', 'User has incomplete profile data');
    } else {
      Logger.log('HomeScreen', 'User goals loaded', goals);
    }
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    Logger.log('HomeScreen', 'Logout initiated');
    await signOut();
  };

  /**
   * Gets goal emoji
   */
  const getGoalEmoji = () => {
    if (!user?.goal) return '🎯';
    const goalEmojis = {
      lose_weight: '🔻',
      maintain: '⚖️',
      gain_weight: '🔺',
      gain_muscle: '💪',
    };
    return goalEmojis[user.goal];
  };

  /**
   * Gets goal label
   */
  const getGoalLabel = () => {
    if (!user?.goal) return 'Hedef Belirle';
    const goalLabels = {
      lose_weight: 'Kilo Verme',
      maintain: 'Koruma',
      gain_weight: 'Kilo Alma',
      gain_muscle: 'Kas Kazanma',
    };
    return goalLabels[user.goal];
  };

  /**
   * Gets remaining calories
   */
  const getRemainingCalories = () => {
    if (!calorieGoals) return 0;
    return Math.max(0, calorieGoals.targetCalories - dailyNutrition.calories);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.welcomeTitle}>Merhaba, {user?.name}! 👋</Text>
                <Text style={styles.welcomeSubtitle}>
                  {new Date().toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Çıkış</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Streak Card */}
          <StreakCard 
            streak={streak} 
            longestStreak={longestStreak}
            hasTodayMeal={hasTodayMeal}
          />

          {/* Weekly Calendar */}
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            trackedDates={trackedDates}
          />

          {/* Quick Stats */}
          {calorieGoals && (
            <View style={styles.quickStatsSection}>
              <Text style={styles.sectionTitle}>Bugünün Hedefleri</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="🎯"
                  title="Kalan Kalori"
                  value={getRemainingCalories()}
                  subtitle={`${calorieGoals.targetCalories} hedef`}
                  color="#10B981"
                />
                <StatCard
                  icon="⚡"
                  title="Günlük Hedef"
                  value={`${calorieGoals.targetCalories}`}
                  subtitle={getGoalLabel()}
                  color="#3B82F6"
                />
              </View>
            </View>
          )}

        {/* Progress Section */}
        {calorieGoals && !loading && (
          <View style={styles.progressSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>İlerleme</Text>
              <Text style={styles.dateIndicator}>
                {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <View style={styles.progressCard}>
              <ProgressBar
                current={dailyNutrition.calories}
                target={calorieGoals.targetCalories}
                label="Kalori"
                color="#10B981"
              />
              <ProgressBar
                current={dailyNutrition.protein}
                target={calorieGoals.protein}
                label="Protein"
                color="#3B82F6"
                unit="g"
              />
              <ProgressBar
                current={dailyNutrition.carbs}
                target={calorieGoals.carbs}
                label="Karbonhidrat"
                color="#F59E0B"
                unit="g"
              />
              <ProgressBar
                current={dailyNutrition.fat}
                target={calorieGoals.fat}
                label="Yağ"
                color="#8B5CF6"
                unit="g"
              />
            </View>
          </View>
        )}

        {/* No Goal Set Warning */}
        {!calorieGoals && !loading && (
          <View style={styles.warningCard}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningTitle}>Henüz Hedef Belirlemediniz</Text>
            <Text style={styles.warningText}>
              Kişiselleştirilmiş beslenme planı için hedeflerinizi belirleyin
            </Text>
            <Button
              title="🎯 Hedef Belirle"
              onPress={() => navigation.navigate('GoalSetup')}
              style={styles.warningButton}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionRow}>
            <Button
              title="🍽️ Öğün Ekle"
              onPress={() => navigation.navigate('MealAdd')}
              style={[styles.actionButton, styles.halfButton]}
            />
            <Button
              title="📊 Geçmiş"
              onPress={() => navigation.navigate('MealHistory')}
              variant="secondary"
              style={[styles.actionButton, styles.halfButton]}
            />
          </View>
          
          {calorieGoals && (
            <Button
              title="⚙️ Hedefleri Güncelle"
              onPress={() => navigation.navigate('GoalSetup')}
              variant="outline"
              style={styles.actionButton}
            />
          )}
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateIndicator: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.main,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickStatsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    gap: 12,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  warningEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 16,
  },
  warningButton: {
    marginTop: 8,
    minWidth: 200,
  },
  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  goalSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '500',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  nutritionValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nutritionGoal: {
    fontSize: 11,
    color: '#adb5bd',
    fontWeight: '600',
    marginTop: 2,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  halfButton: {
    flex: 1,
  },
});

export default HomeScreen;

