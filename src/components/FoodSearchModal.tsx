import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Food } from '../types';
import { FoodDatabase } from '../services/foodDatabase';
import { FoodHistoryService } from '../services/foodHistoryService';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: Food, servingMultiplier: number) => void;
}

/**
 * Food Search Modal Component
 * Allows users to search and select foods from the database
 */
const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  visible,
  onClose,
  onSelectFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Food['category'] | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  // Category options
  const categories = [
    { id: 'all', label: 'Tümü', emoji: '🍴' },
    { id: 'meal', label: 'Yemek', emoji: '🍽️' },
    { id: 'protein', label: 'Protein', emoji: '🥩' },
    { id: 'carb', label: 'Karb', emoji: '🍚' },
    { id: 'fruit', label: 'Meyve', emoji: '🍎' },
    { id: 'vegetable', label: 'Sebze', emoji: '🥗' },
    { id: 'snack', label: 'Atıştırma', emoji: '🍿' },
    { id: 'beverage', label: 'İçecek', emoji: '🥤' },
    { id: 'dairy', label: 'Süt Ürün', emoji: '🥛' },
    { id: 'dessert', label: 'Tatlı', emoji: '🍰' },
  ];

  /**
   * Load foods on component mount or when search/filter changes
   */
  useEffect(() => {
    if (visible) {
      loadFoods();
      loadRecentFoods();
      loadFavoriteFoods();
    }
  }, [visible, searchQuery, selectedCategory]);

  /**
   * Load and filter foods based on search query and category
   */
  const loadFoods = () => {
    Logger.log('FoodSearchModal', 'Loading foods', { searchQuery, selectedCategory });
    setLoading(true);

    try {
      let results: Food[] = [];

      // 1. Apply search filter
      if (searchQuery.trim()) {
        results = FoodDatabase.searchFoods(searchQuery);
      } else {
        results = FoodDatabase.getAllFoods();
      }

      // 2. Apply category filter
      if (selectedCategory !== 'all') {
        results = results.filter((food) => food.category === selectedCategory);
      }

      // 3. Sort by name
      results.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      setSearchResults(results);
      Logger.log('FoodSearchModal', 'Foods loaded', { count: results.length });
    } catch (error) {
      Logger.error('FoodSearchModal', 'Error loading foods', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle food selection (opens serving selector)
   */
  const handleSelectFood = (food: Food) => {
    Logger.log('FoodSearchModal', 'Food selected', { food: food.name });
    setSelectedFood(food);
    setServingMultiplier(1); // Reset to 1 portion
  };

  /**
   * Load recent foods
   */
  const loadRecentFoods = async () => {
    try {
      const recent = await FoodHistoryService.getRecentFoods();
      setRecentFoods(recent);
      Logger.log('FoodSearchModal', 'Recent foods loaded', { count: recent.length });
    } catch (error) {
      Logger.error('FoodSearchModal', 'Error loading recent foods', error);
    }
  };

  /**
   * Load favorite foods
   */
  const loadFavoriteFoods = async () => {
    try {
      const favorites = await FoodHistoryService.getFavoriteFoods();
      setFavoriteFoods(favorites);
      Logger.log('FoodSearchModal', 'Favorite foods loaded', { count: favorites.length });
    } catch (error) {
      Logger.error('FoodSearchModal', 'Error loading favorite foods', error);
    }
  };

  /**
   * Confirm food selection with serving size
   */
  const handleConfirmSelection = async () => {
    if (!selectedFood || isConfirming) return;

    setIsConfirming(true);
    
    try {
      Logger.log('FoodSearchModal', 'Confirming food selection', {
        food: selectedFood.name,
        multiplier: servingMultiplier,
      });

      // Add to recent foods
      await FoodHistoryService.addToRecentFoods(selectedFood);

      // Call parent callback
      onSelectFood(selectedFood, servingMultiplier);
      
      // Close modal
      handleClose();
      
      Logger.log('FoodSearchModal', 'Food selection confirmed successfully');
    } catch (error) {
      Logger.error('FoodSearchModal', 'Error confirming selection', error);
      
      // Even if recent foods fails, still add the food
      onSelectFood(selectedFood, servingMultiplier);
      handleClose();
    } finally {
      setIsConfirming(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFood(null);
    setServingMultiplier(1);
    setIsConfirming(false);
    onClose();
  };

  /**
   * Calculate nutrition values based on serving multiplier
   */
  const calculateNutrition = (value: number) => {
    return Math.round(value * servingMultiplier);
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (food: Food, event: any) => {
    // Prevent food selection
    event.stopPropagation();

    Logger.log('FoodSearchModal', 'Toggling favorite', { food: food.name });

    const isFav = favoriteFoods.some((f) => f.id === food.id);

    if (isFav) {
      // Remove from favorites
      await FoodHistoryService.removeFromFavorites(food.id);
    } else {
      // Add to favorites
      await FoodHistoryService.addToFavorites(food);
    }

    // Reload favorites
    await loadFavoriteFoods();
  };

  /**
   * Check if food is favorite
   */
  const isFavoriteFood = (foodId: string): boolean => {
    return favoriteFoods.some((f) => f.id === foodId);
  };

  /**
   * Render food item
   */
  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodItem}
      onPress={() => handleSelectFood(item)}
      activeOpacity={0.7}
    >
      <View style={styles.foodItemLeft}>
        <Text style={styles.foodEmoji}>{item.emoji || '🍴'}</Text>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodServing}>
            {item.servingSize} {item.servingUnit}
          </Text>
        </View>
      </View>
      <View style={styles.foodItemRight}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => toggleFavorite(item, e)}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>
            {isFavoriteFood(item.id) ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.foodCalories}>{item.calories}</Text>
        <Text style={styles.foodCaloriesLabel}>kcal</Text>
        <View style={styles.macroRow}>
          <Text style={styles.macroText}>P: {item.protein}g</Text>
          <Text style={styles.macroText}>K: {item.carbs}g</Text>
          <Text style={styles.macroText}>Y: {item.fat}g</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render category chip
   */
  const renderCategoryChip = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryChip,
        selectedCategory === category.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <Text
        style={[
          styles.categoryLabel,
          selectedCategory === category.id && styles.categoryLabelActive,
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyTitle}>Besin Bulunamadı</Text>
      <Text style={styles.emptyText}>
        Farklı bir arama terimi veya kategori deneyin
      </Text>
    </View>
  );

  // If a food is selected, show serving selector
  if (selectedFood) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.servingHeader}>
            <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ Geri</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.servingScrollView}
            contentContainerStyle={styles.servingScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Food Info */}
            <View style={styles.selectedFoodHeader}>
              <Text style={styles.selectedFoodEmoji}>{selectedFood.emoji || '🍴'}</Text>
              <Text style={styles.selectedFoodTitle}>{selectedFood.name}</Text>
              <Text style={styles.selectedFoodBase}>
                Baz: {selectedFood.servingSize} {selectedFood.servingUnit}
              </Text>
            </View>

            {/* Serving Amount Selector */}
            <View style={styles.servingAmountSection}>
              <Text style={styles.servingAmountTitle}>Porsiyon Miktarı</Text>
              
              {/* Manual Input with +/- Buttons */}
              <View style={styles.manualInputContainer}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const newValue = Math.max(0.1, Math.round((servingMultiplier - 0.1) * 10) / 10);
                    setServingMultiplier(newValue);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.adjustButtonText}>−</Text>
                </TouchableOpacity>
                
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.servingInput}
                    value={servingMultiplier % 1 === 0 ? servingMultiplier.toFixed(0) : servingMultiplier.toFixed(1)}
                    onChangeText={(text) => {
                      // Türkçe virgül desteği
                      const cleanText = text.replace(',', '.');
                      const value = parseFloat(cleanText);
                      if (!isNaN(value) && value >= 0.1 && value <= 10) {
                        setServingMultiplier(Math.round(value * 10) / 10);
                      } else if (cleanText === '' || cleanText === '0') {
                        setServingMultiplier(0.1);
                      }
                    }}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.multiplierLabel}>x porsiyon</Text>
                </View>

                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => {
                    const newValue = Math.min(10, Math.round((servingMultiplier + 0.1) * 10) / 10);
                    setServingMultiplier(newValue);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.adjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Select Buttons */}
              <Text style={styles.quickSelectTitle}>Hızlı Seçim</Text>
              <View style={styles.quickSelectRow}>
                {[0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5].map((multiplier) => (
                  <TouchableOpacity
                    key={multiplier}
                    style={[
                      styles.quickSelectButton,
                      Math.abs(servingMultiplier - multiplier) < 0.01 && styles.quickSelectButtonActive,
                    ]}
                    onPress={() => setServingMultiplier(multiplier)}
                  >
                    <Text
                      style={[
                        styles.quickSelectText,
                        Math.abs(servingMultiplier - multiplier) < 0.01 && styles.quickSelectTextActive,
                      ]}
                    >
                      {multiplier % 1 === 0 ? multiplier.toFixed(0) : multiplier}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Current Serving */}
              <View style={styles.currentServingCard}>
                <Text style={styles.currentServingLabel}>Seçilen Miktar</Text>
                <Text style={styles.currentServingValue}>
                  {(() => {
                    const value = selectedFood.servingSize * servingMultiplier;
                    const displayValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
                    return `${displayValue} ${selectedFood.servingUnit}`;
                  })()}
                </Text>
                <Text style={styles.currentServingHint}>
                  {(() => {
                    const unit = selectedFood.servingUnit.toLowerCase();
                    if (unit.includes('ml') || unit.includes('litre') || unit === 'cl') {
                      return '💧 Sıvı ölçüsü';
                    } else if (unit === 'gram' || unit === 'kg') {
                      return '⚖️ Ağırlık ölçüsü';
                    } else if (unit === 'adet' || unit === 'porsiyon') {
                      return '🔢 Adet/Porsiyon';
                    } else {
                      return '📏 ' + selectedFood.servingUnit;
                    }
                  })()}
                </Text>
              </View>
            </View>

            {/* Nutrition Preview */}
            <View style={styles.nutritionPreviewSection}>
              <Text style={styles.nutritionPreviewTitle}>Besin Değerleri</Text>
              
              <View style={styles.nutritionPreviewGrid}>
                <View style={styles.nutritionPreviewCard}>
                  <Text style={styles.nutritionPreviewLabel}>Kalori</Text>
                  <Text style={styles.nutritionPreviewValue}>
                    {calculateNutrition(selectedFood.calories)}
                  </Text>
                  <Text style={styles.nutritionPreviewUnit}>kcal</Text>
                </View>

                <View style={styles.nutritionPreviewCard}>
                  <Text style={styles.nutritionPreviewLabel}>Protein</Text>
                  <Text style={styles.nutritionPreviewValue}>
                    {calculateNutrition(selectedFood.protein)}
                  </Text>
                  <Text style={styles.nutritionPreviewUnit}>g</Text>
                </View>

                <View style={styles.nutritionPreviewCard}>
                  <Text style={styles.nutritionPreviewLabel}>Karbonhidrat</Text>
                  <Text style={styles.nutritionPreviewValue}>
                    {calculateNutrition(selectedFood.carbs)}
                  </Text>
                  <Text style={styles.nutritionPreviewUnit}>g</Text>
                </View>

                <View style={styles.nutritionPreviewCard}>
                  <Text style={styles.nutritionPreviewLabel}>Yağ</Text>
                  <Text style={styles.nutritionPreviewValue}>
                    {calculateNutrition(selectedFood.fat)}
                  </Text>
                  <Text style={styles.nutritionPreviewUnit}>g</Text>
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isConfirming && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirmSelection}
                activeOpacity={0.8}
                disabled={isConfirming}
              >
                <Text style={styles.confirmButtonText}>
                  {isConfirming ? '⏳ Ekleniyor...' : '✓ Onayla ve Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  // Default: Show food search
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Besin Ara</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Besin ara..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            renderItem={({ item }) => renderCategoryChip(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoryList}
          />

          {/* Results Count */}
          {!searchQuery && selectedCategory === 'all' && (
            <Text style={styles.resultsCount}>
              {searchResults.length} besin bulundu
            </Text>
          )}
          {(searchQuery || selectedCategory !== 'all') && (
            <Text style={styles.resultsCount}>
              {searchResults.length} besin bulundu
            </Text>
          )}
        </View>

        {/* Recent Foods Section */}
        {!searchQuery && selectedCategory === 'all' && recentFoods.length > 0 && (
          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>⏱️ Son Kullanılanlar</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickAccessList}
            >
              {recentFoods.slice(0, 10).map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.quickAccessCard}
                  onPress={() => handleSelectFood(food)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAccessEmoji}>{food.emoji || '🍴'}</Text>
                  <Text style={styles.quickAccessName} numberOfLines={2}>
                    {food.name}
                  </Text>
                  <Text style={styles.quickAccessCalories}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Favorite Foods Section */}
        {!searchQuery && selectedCategory === 'all' && favoriteFoods.length > 0 && (
          <View style={styles.quickAccessSection}>
            <Text style={styles.quickAccessTitle}>⭐ Favoriler</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickAccessList}
            >
              {favoriteFoods.map((food) => (
                <TouchableOpacity
                  key={food.id}
                  style={styles.quickAccessCard}
                  onPress={() => handleSelectFood(food)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAccessEmoji}>{food.emoji || '🍴'}</Text>
                  <Text style={styles.quickAccessName} numberOfLines={2}>
                    {food.name}
                  </Text>
                  <Text style={styles.quickAccessCalories}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Food List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  categoryList: {
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.primary.main,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  categoryLabelActive: {
    color: Colors.primary.main,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  foodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  foodServing: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  foodItemRight: {
    alignItems: 'flex-end',
    position: 'relative' as 'relative',
  },
  favoriteButton: {
    position: 'absolute' as 'absolute',
    top: -8,
    right: -8,
    padding: 4,
    zIndex: 10,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  foodCalories: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary.main,
    marginTop: 16,
  },
  foodCaloriesLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
  },
  macroText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Serving Selector Styles
  servingScrollView: {
    flex: 1,
  },
  servingScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  servingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: Colors.primary.main,
    fontWeight: '700',
  },
  selectedFoodHeader: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedFoodEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  selectedFoodTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedFoodBase: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  servingAmountSection: {
    marginBottom: 24,
  },
  servingAmountTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  manualInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  adjustButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  inputWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  servingInput: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary.main,
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 80,
  },
  multiplierLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  quickSelectTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  quickSelectButton: {
    minWidth: '18%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickSelectButtonActive: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.primary.main,
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  quickSelectTextActive: {
    color: Colors.primary.main,
  },
  currentServingCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  currentServingLabel: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentServingValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 6,
  },
  currentServingHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#60A5FA',
  },
  nutritionPreviewSection: {
    marginBottom: 24,
  },
  nutritionPreviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  nutritionPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionPreviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  nutritionPreviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nutritionPreviewValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  nutritionPreviewUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  confirmButtonContainer: {
    marginTop: 24,
    paddingTop: 8,
  },
  confirmButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  // Quick Access Sections
  quickAccessSection: {
    paddingVertical: 16,
    paddingLeft: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  quickAccessList: {
    paddingRight: 20,
    gap: 12,
  },
  quickAccessCard: {
    width: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  quickAccessEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickAccessName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
    height: 32,
  },
  quickAccessCalories: {
    fontSize: 11,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});

export default FoodSearchModal;

