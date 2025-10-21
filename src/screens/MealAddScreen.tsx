import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../components/Button';
import FoodSearchModal from '../components/FoodSearchModal';
import { NutritionService } from '../services/nutritionService';
import { Meal, Food } from '../types';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

/**
 * Meal Add Screen component
 * Allows users to add a new meal with nutritional information
 */
const MealAddScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Form state
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Meal type options
  const mealTypes = [
    { id: 'breakfast', label: 'Kahvaltı', emoji: '🌅' },
    { id: 'lunch', label: 'Öğle Yemeği', emoji: '☀️' },
    { id: 'dinner', label: 'Akşam Yemeği', emoji: '🌙' },
    { id: 'snack', label: 'Atıştırmalık', emoji: '🍎' },
  ];

  /**
   * Validates form inputs
   * @returns boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    Logger.log('MealAddScreen', 'Validating form');

    // 1. Check if meal name is provided
    if (!mealName.trim()) {
      Alert.alert('Hata', 'Lütfen öğün adını girin');
      return false;
    }

    // 2. Check if calories is provided and valid
    if (!calories || isNaN(Number(calories)) || Number(calories) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir kalori değeri girin');
      return false;
    }

    // 3. Check if macros are valid (optional but should be numbers if provided)
    if (protein && (isNaN(Number(protein)) || Number(protein) < 0)) {
      Alert.alert('Hata', 'Lütfen geçerli bir protein değeri girin');
      return false;
    }

    if (carbs && (isNaN(Number(carbs)) || Number(carbs) < 0)) {
      Alert.alert('Hata', 'Lütfen geçerli bir karbonhidrat değeri girin');
      return false;
    }

    if (fat && (isNaN(Number(fat)) || Number(fat) < 0)) {
      Alert.alert('Hata', 'Lütfen geçerli bir yağ değeri girin');
      return false;
    }

    Logger.log('MealAddScreen', 'Form validation passed');
    return true;
  };

  /**
   * Handles meal save
   */
  const handleSaveMeal = async () => {
    Logger.log('MealAddScreen', 'Save meal initiated');

    // 1. Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 2. Create meal object
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: mealName.trim(),
        calories: Number(calories),
        protein: protein ? Number(protein) : 0,
        carbs: carbs ? Number(carbs) : 0,
        fat: fat ? Number(fat) : 0,
        date: selectedDate,
        mealType: selectedMealType,
      };

      Logger.log('MealAddScreen', 'Saving meal', newMeal);

      // 3. Save meal to storage
      const success = await NutritionService.saveMeal(newMeal);

      if (success) {
        Logger.log('MealAddScreen', 'Meal saved successfully');
        Alert.alert(
          'Başarılı! 🎉',
          'Öğün başarıyla kaydedildi',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Failed to save meal');
      }
    } catch (error) {
      Logger.error('MealAddScreen', 'Error saving meal', error);
      Alert.alert('Hata', 'Öğün kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form reset
   */
  const handleReset = () => {
    Logger.log('MealAddScreen', 'Resetting form');
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSelectedMealType('lunch');
    setSelectedFood(null);
  };

  /**
   * Handles food selection from database
   * @param food Selected food from database
   * @param servingMultiplier Portion multiplier (e.g., 1.5 for 1.5 portions)
   */
  const handleFoodSelect = (food: Food, servingMultiplier: number) => {
    Logger.log('MealAddScreen', 'Food selected from database', {
      food: food.name,
      multiplier: servingMultiplier,
    });

    // 1. Calculate nutrition values based on serving multiplier
    const calculatedCalories = Math.round(food.calories * servingMultiplier);
    const calculatedProtein = Math.round(food.protein * servingMultiplier);
    const calculatedCarbs = Math.round(food.carbs * servingMultiplier);
    const calculatedFat = Math.round(food.fat * servingMultiplier);

    // 2. Fill form with calculated values
    setMealName(
      servingMultiplier === 1
        ? food.name
        : `${food.name} (${servingMultiplier}x)`
    );
    setCalories(calculatedCalories.toString());
    setProtein(calculatedProtein.toString());
    setCarbs(calculatedCarbs.toString());
    setFat(calculatedFat.toString());
    setSelectedFood(food);

    // 3. Close modal
    setShowFoodSearch(false);

    Logger.log('MealAddScreen', 'Form filled with food data', {
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Yeni Öğün Ekle</Text>
            <Text style={styles.headerSubtitle}>
              {selectedDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Food Database Search Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowFoodSearch(true)}
            activeOpacity={0.7}
          >
            <View style={styles.searchButtonContent}>
              <Text style={styles.searchButtonEmoji}>🔍</Text>
              <View style={styles.searchButtonText}>
                <Text style={styles.searchButtonTitle}>Besin Veritabanından Seç</Text>
                <Text style={styles.searchButtonSubtitle}>
                  Hazır besin bilgilerini kullan
                </Text>
              </View>
            </View>
            <Text style={styles.searchButtonArrow}>›</Text>
          </TouchableOpacity>

          {/* Selected Food Info */}
          {selectedFood && (
            <View style={styles.selectedFoodCard}>
              <Text style={styles.selectedFoodEmoji}>{selectedFood.emoji || '🍴'}</Text>
              <View style={styles.selectedFoodInfo}>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                <Text style={styles.selectedFoodDetails}>
                  {selectedFood.servingSize} {selectedFood.servingUnit} • {selectedFood.calories} kcal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSelectedFood(null);
                  handleReset();
                }}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* OR Divider */}
          {!selectedFood && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya Manuel Gir</Text>
              <View style={styles.dividerLine} />
            </View>
          )}

          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öğün Tipi</Text>
            <View style={styles.mealTypeGrid}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.mealTypeCard,
                    selectedMealType === type.id && styles.mealTypeCardActive,
                  ]}
                  onPress={() => setSelectedMealType(type.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mealTypeEmoji}>{type.emoji}</Text>
                  <Text
                    style={[
                      styles.mealTypeLabel,
                      selectedMealType === type.id && styles.mealTypeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meal Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Öğün Adı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Tavuklu Salata"
              placeholderTextColor="#9CA3AF"
              value={mealName}
              onChangeText={setMealName}
              maxLength={50}
            />
          </View>

          {/* Calories */}
          <View style={styles.section}>
            <Text style={styles.label}>Kalori (kcal) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: 450"
              placeholderTextColor="#9CA3AF"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* Macronutrients Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Makro Besinler (Opsiyonel)</Text>
            <Text style={styles.sectionSubtitle}>
              Daha detaylı takip için makro besinleri ekleyin
            </Text>

            <View style={styles.macroGrid}>
              {/* Protein */}
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>🥩 Protein (g)</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              {/* Carbs */}
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>🍞 Karbonhidrat (g)</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              {/* Fat */}
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>🥑 Yağ (g)</Text>
                <TextInput
                  style={styles.macroInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Quick Fill Tip */}
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>İpucu</Text>
              <Text style={styles.tipText}>
                Ürün paketlerinin üzerindeki besin değerlerini kullanabilirsiniz
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Button
              title={loading ? 'Kaydediliyor...' : '✅ Kaydet'}
              onPress={handleSaveMeal}
              disabled={loading}
              style={styles.saveButton}
            />
            <View style={styles.buttonRow}>
              <Button
                title="🔄 Sıfırla"
                onPress={handleReset}
                variant="outline"
                style={styles.halfButton}
              />
              <Button
                title="❌ İptal"
                onPress={() => navigation.goBack()}
                variant="secondary"
                style={styles.halfButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Food Search Modal */}
      <FoodSearchModal
        visible={showFoodSearch}
        onClose={() => setShowFoodSearch(false)}
        onSelectFood={handleFoodSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontWeight: '600',
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  mealTypeCardActive: {
    borderColor: Colors.primary.main,
    backgroundColor: '#F0FDF4',
  },
  mealTypeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  mealTypeLabelActive: {
    color: Colors.primary.main,
  },
  macroGrid: {
    gap: 12,
  },
  macroItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  macroInput: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  actionSection: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchButtonEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  searchButtonText: {
    flex: 1,
  },
  searchButtonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  searchButtonSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchButtonArrow: {
    fontSize: 32,
    color: Colors.primary.main,
    fontWeight: '300',
  },
  selectedFoodCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  selectedFoodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  selectedFoodInfo: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  selectedFoodDetails: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default MealAddScreen;

