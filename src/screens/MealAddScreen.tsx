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
import BarcodeScannerComponent from '../components/BarcodeScanner';
import { NutritionService } from '../services/nutritionService';
import { BarcodeService } from '../services/barcodeService';
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
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState<string>('gram');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [addedFoods, setAddedFoods] = useState<Array<Food & { servingSize: number; servingUnit: string; calculatedNutrition: any }>>([]);
  const [totalNutrition, setTotalNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [showSelectedFoods, setShowSelectedFoods] = useState(false);
  
  /**
   * Calculates total nutrition values for all added foods
   */
  const calculateTotalNutrition = (foods: Array<Food & { servingSize: number; servingUnit: string; calculatedNutrition: any }>) => {
    const total = foods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calculatedNutrition.calories,
        protein: acc.protein + food.calculatedNutrition.protein,
        carbs: acc.carbs + food.calculatedNutrition.carbs,
        fat: acc.fat + food.calculatedNutrition.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setTotalNutrition(total);
  };

  /**
   * Calculates nutrition values based on serving size
   * Uses base nutrition values (per 100g/100ml) if available
   */
  const calculateNutrition = (food: Food, newServingSize: number): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } => {
    console.log('📊 Calculating nutrition:', {
      food: food.name,
      newServingSize,
      hasBaseValues: !!food.baseCalories,
    });

    // If we have base values (per 100g/100ml), use them
    if (food.baseCalories !== undefined) {
      const multiplier = newServingSize / 100;
      const calculated = {
        calories: Math.round(food.baseCalories * multiplier),
        protein: Math.round((food.baseProtein || 0) * multiplier),
        carbs: Math.round((food.baseCarbs || 0) * multiplier),
        fat: Math.round((food.baseFat || 0) * multiplier),
      };
      
      console.log('✅ Using base values (per 100g/ml):', {
        base: {
          calories: food.baseCalories,
          protein: food.baseProtein,
          carbs: food.baseCarbs,
          fat: food.baseFat,
        },
        multiplier,
        calculated,
      });
      
      return calculated;
    }

    // Fallback: Calculate from original serving size
    const originalServingSize = food.servingSize;
    const ratio = newServingSize / originalServingSize;
    const calculated = {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio),
      carbs: Math.round(food.carbs * ratio),
      fat: Math.round(food.fat * ratio),
    };

    console.log('⚠️ Using ratio calculation:', {
      originalServingSize,
      ratio,
      calculated,
    });

    return calculated;
  };

  // Available serving units
  const servingUnits = [
    { id: 'gram', label: 'Gram (g)', emoji: '⚖️', type: 'weight' },
    { id: 'ml', label: 'Mililitre (ml)', emoji: '💧', type: 'liquid' },
    { id: 'adet', label: 'Adet', emoji: '🔢', type: 'count' },
    { id: 'porsiyon', label: 'Porsiyon', emoji: '🍽️', type: 'count' },
    { id: 'bardak', label: 'Bardak', emoji: '🥤', type: 'volume' },
    { id: 'kaşık', label: 'Kaşık', emoji: '🥄', type: 'volume' },
  ];

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
    if (addedFoods.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir besin ekleyin');
      return;
    }

    setLoading(true);

    try {
      // 2. Create meal object with total nutrition values
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: `${selectedMealType === 'breakfast' ? 'Kahvaltı' : 
               selectedMealType === 'lunch' ? 'Öğle Yemeği' : 
               selectedMealType === 'dinner' ? 'Akşam Yemeği' : 'Ara Öğün'} - ${new Date().toLocaleDateString('tr-TR')}`,
        calories: totalNutrition.calories,
        protein: totalNutrition.protein,
        carbs: totalNutrition.carbs,
        fat: totalNutrition.fat,
        date: selectedDate,
        mealType: selectedMealType,
        foods: addedFoods.map(food => ({
          id: food.id,
          name: food.name,
          calories: food.calculatedNutrition.calories,
          protein: food.calculatedNutrition.protein,
          carbs: food.calculatedNutrition.carbs,
          fat: food.calculatedNutrition.fat,
          servingSize: food.servingSize,
          servingUnit: food.servingUnit,
        })),
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
   * Handles barcode scan
   * @param barcode Scanned barcode
   */
  const handleBarcodeScanned = async (barcode: string) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📲 MEAL ADD SCREEN - BARCODE HANDLER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('MealAddScreen', 'Step 1: Barcode received', { barcode });
      console.log('📊 Barcode:', barcode);
      
      // Close scanner first
      setShowBarcodeScanner(false);
      console.log('✓ Scanner closed');

      // Validate barcode
      console.log('⏳ Validating barcode...');
      if (!BarcodeService.isValidBarcode(barcode)) {
        console.log('❌ Barcode validation failed');
        setTimeout(() => {
          Alert.alert('Geçersiz Barkod', 'Lütfen geçerli bir ürün barkodu okutun');
        }, 300);
        return;
      }
      console.log('✅ Barcode is valid');

      // Search product (no loading alert, will show result directly)
      Logger.log('MealAddScreen', 'Step 2: Searching product in OpenFoodFacts');
      console.log('⏳ Calling BarcodeService.searchProductByBarcode...');
      
      const product = await BarcodeService.searchProductByBarcode(barcode);
      console.log('📦 Product search result:', product);

      // Wait a bit before showing alert to avoid conflicts
      await new Promise(resolve => setTimeout(resolve, 300));

      if (product) {
        // Product found - use it like selecting from database
        Logger.log('MealAddScreen', 'Step 3: Product found, filling form', { product });
        console.log('✅ Product found! Filling form...');
        
        handleFoodSelect(product, 1);
        
        Alert.alert(
          '✅ Ürün Bulundu!',
          `${product.name}\n${product.calories} kcal\n\nForm otomatik dolduruldu.`
        );
        console.log('✅ Form filled successfully');
      } else {
        // Product not found
        Logger.log('MealAddScreen', 'Step 3: Product not found');
        console.log('❌ Product not found in OpenFoodFacts');
        
        Alert.alert(
          'Ürün Bulunamadı 😞',
          `Barkod: ${barcode}\n\nBu ürün OpenFoodFacts veritabanında bulunamadı.\n\nNot: Türk ürünleri henüz tam kayıtlı değil. Besin veritabanımızdan seçebilir veya manuel ekleyebilirsiniz.`,
          [
            { 
              text: 'Tamam', 
              style: 'cancel',
              onPress: () => {
                console.log('👍 User dismissed alert');
              }
            },
          ]
        );
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ MEAL ADD SCREEN ERROR:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.error('MealAddScreen', 'Error handling barcode', error);
      Alert.alert('Hata', 'Ürün bilgileri yüklenirken bir hata oluştu');
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
    setServingSize('100');
    setServingUnit('gram');
    setSelectedMealType('lunch');
    setSelectedFood(null);
  };

  /**
   * Handles food selection from database
   * @param food Selected food from database
   * @param servingMultiplier Portion multiplier (e.g., 1.5 for 1.5 portions)
   */
  const handleFoodSelect = (food: Food, servingMultiplier: number) => {
    try {
      Logger.log('MealAddScreen', 'Food selected from database', {
        food: food.name,
        multiplier: servingMultiplier,
      });

      // 1. Calculate nutrition values based on serving multiplier
      const calculatedCalories = Math.round(food.calories * servingMultiplier);
      const calculatedProtein = Math.round(food.protein * servingMultiplier);
      const calculatedCarbs = Math.round(food.carbs * servingMultiplier);
      const calculatedFat = Math.round(food.fat * servingMultiplier);

      Logger.log('MealAddScreen', 'Calculated nutrition values', {
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fat: calculatedFat,
      });

      // 2. Fill form with calculated values
      const mealNameValue = servingMultiplier === 1
        ? food.name
        : `${food.name} (${servingMultiplier}x)`;
      
      Logger.log('MealAddScreen', 'Setting form values', {
        mealName: mealNameValue,
        calories: calculatedCalories.toString(),
      });

      setMealName(mealNameValue);
      setCalories(calculatedCalories.toString());
      setProtein(calculatedProtein.toString());
      setCarbs(calculatedCarbs.toString());
      setFat(calculatedFat.toString());
      setSelectedFood(food);

      // Set serving size and unit from selected food
      const finalServingSize = food.servingSize * servingMultiplier;
      setServingSize(finalServingSize.toString());
      setServingUnit(food.servingUnit);

      Logger.log('MealAddScreen', 'Serving info set', {
        servingSize: finalServingSize,
        servingUnit: food.servingUnit,
      });

      // 3. Close modal
      setShowFoodSearch(false);

      // 4. Add to selected foods list
      setSelectedFoods(prev => [...prev, food]);
      setShowSelectedFoods(true);

      Logger.log('MealAddScreen', 'Form filled successfully with food data');
    } catch (error) {
      Logger.error('MealAddScreen', 'Error handling food selection', error);
      Alert.alert(
        'Hata',
        'Besin bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      setShowFoodSearch(false);
    }
  };

  /**
   * Adds selected food to the meal
   */
  const addFoodToMeal = () => {
    if (!selectedFood) {
      Alert.alert('Hata', 'Lütfen bir besin seçin');
      return;
    }

    const servingSizeNum = parseFloat(servingSize);
    if (!servingSizeNum || servingSizeNum <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir porsiyon miktarı girin');
      return;
    }

    const calculatedNutrition = calculateNutrition(selectedFood, servingSizeNum);
    const foodWithNutrition = {
      ...selectedFood,
      servingSize: servingSizeNum,
      servingUnit,
      calculatedNutrition,
    };

    const newAddedFoods = [...addedFoods, foodWithNutrition];
    setAddedFoods(newAddedFoods);
    calculateTotalNutrition(newAddedFoods);

    // Reset form
    setSelectedFood(null);
    setMealName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setServingSize('100');
    setServingUnit('gram');

    Logger.log('MealAddScreen', 'Food added to meal', { food: selectedFood.name, servingSize: servingSizeNum });
  };

  /**
   * Removes food from meal
   */
  const removeFoodFromMeal = (index: number) => {
    const newAddedFoods = addedFoods.filter((_, i) => i !== index);
    setAddedFoods(newAddedFoods);
    calculateTotalNutrition(newAddedFoods);
    Logger.log('MealAddScreen', 'Food removed from meal', { index });
  };

  /**
   * Adds all selected foods to meal at once
   */
  const addAllSelectedFoods = () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir besin seçin');
      return;
    }

    const foodsToAdd = selectedFoods.map(food => {
      const servingSizeNum = parseFloat(servingSize) || 100;
      const calculatedNutrition = calculateNutrition(food, servingSizeNum);
      return {
        ...food,
        servingSize: servingSizeNum,
        servingUnit,
        calculatedNutrition,
      };
    });

    const newAddedFoods = [...addedFoods, ...foodsToAdd];
    setAddedFoods(newAddedFoods);
    calculateTotalNutrition(newAddedFoods);

    // Reset selected foods
    setSelectedFoods([]);
    setShowSelectedFoods(false);

    Logger.log('MealAddScreen', 'All selected foods added to meal', { count: selectedFoods.length });
  };

  /**
   * Removes food from selected foods list
   */
  const removeSelectedFood = (index: number) => {
    const newSelectedFoods = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(newSelectedFoods);
    if (newSelectedFoods.length === 0) {
      setShowSelectedFoods(false);
    }
    Logger.log('MealAddScreen', 'Food removed from selected list', { index });
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

          {/* Quick Add Section */}
          <View style={styles.quickAddSection}>
            <Text style={styles.quickAddTitle}>Hızlı Ekleme</Text>
            
            <View style={styles.quickAddRow}>
              {/* Barcode Scanner Button */}
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => setShowBarcodeScanner(true)}
                activeOpacity={0.7}
              >
                <View style={styles.quickAddContent}>
                  <Text style={styles.quickAddEmoji}>📷</Text>
                  <Text style={styles.quickAddLabel}>Barkod Okut</Text>
                  <Text style={styles.quickAddSubtitle}>Kamera ile</Text>
                </View>
              </TouchableOpacity>

              {/* Food Database Search Button */}
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => setShowFoodSearch(true)}
                activeOpacity={0.7}
              >
                <View style={styles.quickAddContent}>
                  <Text style={styles.quickAddEmoji}>🔍</Text>
                  <Text style={styles.quickAddLabel}>Veritabanı</Text>
                  <Text style={styles.quickAddSubtitle}>60+ besin</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

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

          {/* Serving Size & Unit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Porsiyon Bilgisi</Text>
            <Text style={styles.sectionSubtitle}>
              Tükettiğiniz miktarı belirtin
            </Text>

            {/* Serving Size Input */}
            <View style={styles.servingSizeRow}>
              <View style={styles.servingSizeInput}>
                <Text style={styles.label}>Miktar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor="#9CA3AF"
                  value={servingSize}
                  onChangeText={(value) => {
                    setServingSize(value);
                    
                    // If we have a selected food, recalculate nutrition
                    if (selectedFood && value) {
                      const newSize = parseFloat(value);
                      if (!isNaN(newSize) && newSize > 0) {
                        const nutrition = calculateNutrition(selectedFood, newSize);
                        setCalories(nutrition.calories.toString());
                        setProtein(nutrition.protein.toString());
                        setCarbs(nutrition.carbs.toString());
                        setFat(nutrition.fat.toString());
                        
                        Logger.log('MealAddScreen', 'Nutrition recalculated', {
                          newServingSize: newSize,
                          nutrition,
                        });
                      }
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View style={styles.servingUnitSelect}>
                <Text style={styles.label}>Birim</Text>
                <View style={styles.unitGrid}>
                  {servingUnits.map((unit) => (
                    <TouchableOpacity
                      key={unit.id}
                      style={[
                        styles.unitButton,
                        servingUnit === unit.id && styles.unitButtonActive,
                      ]}
                      onPress={() => {
                        // Check if unit is appropriate for the food type
                        if (selectedFood && selectedFood.isLiquid !== undefined) {
                          const isLiquidUnit = unit.type === 'liquid';
                          const foodIsLiquid = selectedFood.isLiquid;

                          if (foodIsLiquid && unit.id === 'gram') {
                            Alert.alert(
                              '⚠️ Uyarı',
                              `${selectedFood.name} sıvı bir üründür. Gram yerine ml kullanmanız önerilir.`,
                              [
                                { text: 'İptal', style: 'cancel' },
                                { 
                                  text: 'Yine de Kullan', 
                                  onPress: () => setServingUnit(unit.id)
                                },
                              ]
                            );
                            return;
                          }

                          if (!foodIsLiquid && unit.id === 'ml') {
                            Alert.alert(
                              '⚠️ Uyarı',
                              `${selectedFood.name} katı bir üründür. ml yerine gram kullanmanız önerilir.`,
                              [
                                { text: 'İptal', style: 'cancel' },
                                { 
                                  text: 'Yine de Kullan', 
                                  onPress: () => setServingUnit(unit.id)
                                },
                              ]
                            );
                            return;
                          }
                        }

                        setServingUnit(unit.id);
                        Logger.log('MealAddScreen', 'Unit changed', { unit: unit.id });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.unitEmoji}>{unit.emoji}</Text>
                      <Text
                        style={[
                          styles.unitLabel,
                          servingUnit === unit.id && styles.unitLabelActive,
                        ]}
                      >
                        {unit.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Current Serving Display */}
            <View style={styles.currentServingDisplay}>
              <Text style={styles.currentServingText}>
                {servingSize} {servingUnit}
              </Text>
              <Text style={styles.currentServingHintText}>
                {(() => {
                  const unit = servingUnits.find(u => u.id === servingUnit);
                  return unit ? `${unit.emoji} ${unit.label}` : servingUnit;
                })()}
              </Text>
            </View>
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

          {/* Besin Ekle Butonu */}
          {selectedFood && (
            <Button
              title="➕ Bu Besini Ekle"
              onPress={addFoodToMeal}
              style={styles.addFoodButton}
            />
          )}

          {/* Seçilen Besinler Listesi */}
          {showSelectedFoods && selectedFoods.length > 0 && (
            <View style={styles.selectedFoodsContainer}>
              <Text style={styles.sectionTitle}>Seçilen Besinler ({selectedFoods.length})</Text>
              {selectedFoods.map((food, index) => (
                <View key={index} style={styles.selectedFoodItem}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodServing}>
                      {food.calories} kcal - P: {food.protein}g, K: {food.carbs}g, Y: {food.fat}g
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSelectedFood(index)}
                  >
                    <Text style={styles.removeButtonText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <Button
                title={`➕ Tümünü Ekle (${selectedFoods.length} besin)`}
                onPress={addAllSelectedFoods}
                style={styles.addAllButton}
              />
            </View>
          )}

          {/* Eklenen Besinler Listesi */}
          {addedFoods.length > 0 && (
            <View style={styles.addedFoodsContainer}>
              <Text style={styles.sectionTitle}>Eklenen Besinler</Text>
              {addedFoods.map((food, index) => (
                <View key={index} style={styles.addedFoodItem}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodServing}>
                      {food.servingSize} {food.servingUnit}
                    </Text>
                  </View>
                  <View style={styles.foodNutrition}>
                    <Text style={styles.nutritionText}>
                      {food.calculatedNutrition.calories} kcal
                    </Text>
                    <Text style={styles.nutritionText}>
                      P: {food.calculatedNutrition.protein}g
                    </Text>
                    <Text style={styles.nutritionText}>
                      K: {food.calculatedNutrition.carbs}g
                    </Text>
                    <Text style={styles.nutritionText}>
                      Y: {food.calculatedNutrition.fat}g
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFoodFromMeal(index)}
                  >
                    <Text style={styles.removeButtonText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Toplam Besin Değerleri */}
          {addedFoods.length > 0 && (
            <View style={styles.totalNutritionContainer}>
              <Text style={styles.sectionTitle}>Toplam Besin Değerleri</Text>
              <View style={styles.totalNutritionGrid}>
                <View style={styles.totalNutritionItem}>
                  <Text style={styles.totalNutritionLabel}>Kalori</Text>
                  <Text style={styles.totalNutritionValue}>
                    {totalNutrition.calories} kcal
                  </Text>
                </View>
                <View style={styles.totalNutritionItem}>
                  <Text style={styles.totalNutritionLabel}>Protein</Text>
                  <Text style={styles.totalNutritionValue}>
                    {totalNutrition.protein}g
                  </Text>
                </View>
                <View style={styles.totalNutritionItem}>
                  <Text style={styles.totalNutritionLabel}>Karbonhidrat</Text>
                  <Text style={styles.totalNutritionValue}>
                    {totalNutrition.carbs}g
                  </Text>
                </View>
                <View style={styles.totalNutritionItem}>
                  <Text style={styles.totalNutritionLabel}>Yağ</Text>
                  <Text style={styles.totalNutritionValue}>
                    {totalNutrition.fat}g
                  </Text>
                </View>
              </View>
            </View>
          )}

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

      {/* Barcode Scanner Modal */}
      <BarcodeScannerComponent
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onBarcodeScanned={handleBarcodeScanned}
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
  quickAddSection: {
    marginBottom: 24,
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAddContent: {
    alignItems: 'center',
  },
  quickAddEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  quickAddLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  quickAddSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
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
  addFoodButton: {
    backgroundColor: Colors.primary.main,
    marginVertical: 16,
  },
  addedFoodsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  addedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  foodServing: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  foodNutrition: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  totalNutritionContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  totalNutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  totalNutritionItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalNutritionLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  totalNutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  selectedFoodsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  selectedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  addAllButton: {
    backgroundColor: Colors.secondary.main,
    marginTop: 16,
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
  servingSizeRow: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  servingSizeInput: {
    flex: 1,
  },
  servingUnitSelect: {
    flex: 1,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: '#F0FDF4',
  },
  unitEmoji: {
    fontSize: 16,
  },
  unitLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  unitLabelActive: {
    color: Colors.primary.main,
  },
  currentServingDisplay: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  currentServingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  currentServingHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60A5FA',
  },
});

export default MealAddScreen;

