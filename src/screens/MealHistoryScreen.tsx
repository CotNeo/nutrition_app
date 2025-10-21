import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { NutritionService } from '../services/nutritionService';
import { Meal } from '../types';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

/**
 * Meal History Screen component
 * Displays all logged meals with delete functionality
 */
const MealHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load meals on component mount
   */
  useEffect(() => {
    loadMeals();
  }, []);

  /**
   * Loads all meals from storage
   */
  const loadMeals = async () => {
    try {
      Logger.log('MealHistoryScreen', 'Loading meals');
      setLoading(true);

      const allMeals = await NutritionService.getMeals();

      // Sort by date (newest first)
      const sortedMeals = allMeals.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setMeals(sortedMeals);
      Logger.log('MealHistoryScreen', 'Meals loaded', { count: sortedMeals.length });
    } catch (error) {
      Logger.error('MealHistoryScreen', 'Error loading meals', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  /**
   * Handles meal deletion
   */
  const handleDeleteMeal = (meal: Meal) => {
    Alert.alert(
      'Öğünü Sil',
      `"${meal.name}" öğününü silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            Logger.log('MealHistoryScreen', 'Deleting meal', { mealId: meal.id });

            const success = await NutritionService.deleteMeal(meal.id);

            if (success) {
              // Reload meals
              await loadMeals();
              Logger.log('MealHistoryScreen', 'Meal deleted successfully');
            } else {
              Alert.alert('Hata', 'Öğün silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  /**
   * Gets meal type emoji
   */
  const getMealTypeEmoji = (mealType: Meal['mealType']): string => {
    const emojiMap = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    };
    return emojiMap[mealType];
  };

  /**
   * Gets meal type label
   */
  const getMealTypeLabel = (mealType: Meal['mealType']): string => {
    const labelMap = {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği',
      snack: 'Atıştırmalık',
    };
    return labelMap[mealType];
  };

  /**
   * Groups meals by date
   */
  const groupMealsByDate = () => {
    const grouped: { [key: string]: Meal[] } = {};

    meals.forEach((meal) => {
      const dateKey = new Date(meal.date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meal);
    });

    return Object.entries(grouped).map(([date, meals]) => ({
      date,
      meals,
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: meals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: meals.reduce((sum, meal) => sum + meal.fat, 0),
    }));
  };

  /**
   * Renders meal item
   */
  const renderMealItem = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      style={styles.mealCard}
      activeOpacity={0.7}
      onLongPress={() => handleDeleteMeal(meal)}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealHeaderLeft}>
          <Text style={styles.mealTypeEmoji}>{getMealTypeEmoji(meal.mealType)}</Text>
          <View>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealType}>{getMealTypeLabel(meal.mealType)}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteMeal(meal)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.calories}</Text>
          <Text style={styles.nutritionLabel}>kcal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.protein}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
          <Text style={styles.nutritionLabel}>Karb</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.fat}g</Text>
          <Text style={styles.nutritionLabel}>Yağ</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Renders date section
   */
  const renderDateSection = ({ item }: any) => (
    <View style={styles.dateSection}>
      <View style={styles.dateSectionHeader}>
        <Text style={styles.dateText}>{item.date}</Text>
        <View style={styles.dateTotals}>
          <Text style={styles.dateTotalText}>{item.totalCalories} kcal</Text>
        </View>
      </View>
      {item.meals.map((meal: Meal) => renderMealItem(meal))}
    </View>
  );

  /**
   * Renders empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>Henüz Öğün Eklenmemiş</Text>
      <Text style={styles.emptyText}>
        Öğünlerinizi kaydetmeye başlayın ve burada görün
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('MealAdd')}
      >
        <Text style={styles.addButtonText}>+ Öğün Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  const groupedMeals = groupMealsByDate();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Öğün Geçmişi</Text>
        <Text style={styles.headerSubtitle}>
          Toplam {meals.length} öğün kaydedildi
        </Text>
      </View>

      {/* Meals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedMeals}
          renderItem={renderDateSection}
          keyExtractor={(item, index) => `date-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary.main]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  dateTotals: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  dateTotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default MealHistoryScreen;

