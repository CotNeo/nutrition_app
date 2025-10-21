import { Food } from '../types';
import { Logger } from '../utils/logger';

/**
 * Food Database Service
 * All serving sizes adjusted to realistic, everyday portions for easy use
 */
export class FoodDatabase {
  private static foods: Food[] = [
    // ---------- TURKISH MAIN / MEALS ----------
    { id: 'meal_001', name: 'Tavuk Göğsü Izgara', category: 'protein', calories: 248, protein: 46, carbs: 0, fat: 5, servingSize: 150, servingUnit: 'gram', emoji: '🍗' },
    { id: 'meal_002', name: 'Kuru Fasulye', category: 'meal', calories: 254, protein: 17, carbs: 46, fat: 1, servingSize: 200, servingUnit: 'gram', emoji: '🍲' },
    { id: 'meal_003', name: 'Mercimek Çorbası', category: 'meal', calories: 150, protein: 9, carbs: 21, fat: 3, servingSize: 250, servingUnit: 'ml', emoji: '🍜' },
    { id: 'meal_004', name: 'Izgara Köfte', category: 'protein', calories: 300, protein: 24, carbs: 6, fat: 19, servingSize: 120, servingUnit: 'gram', emoji: '🥩' },
    { id: 'meal_005', name: 'Menemen', category: 'meal', calories: 173, protein: 8, carbs: 8, fat: 12, servingSize: 150, servingUnit: 'gram', emoji: '🍳' },
    { id: 'meal_006', name: 'Tavuklu Makarna', category: 'meal', calories: 300, protein: 18, carbs: 40, fat: 7, servingSize: 200, servingUnit: 'gram', emoji: '🍝' },
    { id: 'meal_007', name: 'Pirinç Pilavı', category: 'carb', calories: 195, protein: 4, carbs: 42, fat: 0.5, servingSize: 150, servingUnit: 'gram', emoji: '🍚' },
    { id: 'meal_008', name: 'Bulgur Pilavı', category: 'carb', calories: 165, protein: 5, carbs: 35, fat: 0.6, servingSize: 150, servingUnit: 'gram', emoji: '🍚' },
    { id: 'meal_009', name: 'Tavuklu Salata', category: 'meal', calories: 250, protein: 28, carbs: 10, fat: 10, servingSize: 200, servingUnit: 'gram', emoji: '🥗' },
    { id: 'meal_010', name: 'Ton Balıklı Salata', category: 'meal', calories: 200, protein: 24, carbs: 10, fat: 7, servingSize: 200, servingUnit: 'gram', emoji: '🥗' },
    { id: 'meal_011', name: 'Izgara Somon', category: 'protein', calories: 309, protein: 33, carbs: 0, fat: 20, servingSize: 1, servingUnit: 'porsiyon', emoji: '🐟' },
    { id: 'meal_012', name: 'Omlet (2 Yumurta)', category: 'protein', calories: 185, protein: 13, carbs: 2, fat: 14, servingSize: 1, servingUnit: 'porsiyon', emoji: '🍳' },
    { id: 'meal_013', name: 'Haşlanmış Yumurta', category: 'protein', calories: 78, protein: 6, carbs: 1, fat: 5, servingSize: 1, servingUnit: 'adet', emoji: '🥚' },

    // Yeni Türk yemekleri
    { id: 'meal_014', name: 'Adana Kebap', category: 'protein', calories: 368, protein: 27, carbs: 5, fat: 26, servingSize: 150, servingUnit: 'gram', emoji: '🥙' },
    { id: 'meal_015', name: 'Urfa Kebap', category: 'protein', calories: 353, protein: 27, carbs: 5, fat: 24, servingSize: 150, servingUnit: 'gram', emoji: '🥙' },
    { id: 'meal_016', name: 'İskender Kebap', category: 'meal', calories: 425, protein: 23, carbs: 35, fat: 23, servingSize: 250, servingUnit: 'gram', emoji: '🥙' },
    { id: 'meal_017', name: 'Tavuk Şiş', category: 'protein', calories: 218, protein: 33, carbs: 2, fat: 9, servingSize: 150, servingUnit: 'gram', emoji: '🍢' },
    { id: 'meal_018', name: 'Et Döner', category: 'protein', calories: 258, protein: 20, carbs: 4, fat: 18, servingSize: 120, servingUnit: 'gram', emoji: '🥙' },
    { id: 'meal_019', name: 'Tavuk Döner', category: 'protein', calories: 198, protein: 22, carbs: 4, fat: 11, servingSize: 120, servingUnit: 'gram', emoji: '🥙' },
    { id: 'meal_020', name: 'Mantı (yoğurtlu)', category: 'meal', calories: 380, protein: 14, carbs: 54, fat: 12, servingSize: 200, servingUnit: 'gram', emoji: '🥟' },
    { id: 'meal_021', name: 'Dolma (Biber)', category: 'meal', calories: 218, protein: 5, carbs: 24, fat: 11, servingSize: 150, servingUnit: 'gram', emoji: '🌶️' },
    { id: 'meal_022', name: 'Yaprak Sarma', category: 'meal', calories: 240, protein: 5, carbs: 33, fat: 9, servingSize: 150, servingUnit: 'gram', emoji: '🍃' },
    { id: 'meal_023', name: 'Kuru Köfte', category: 'protein', calories: 336, protein: 20, carbs: 10, fat: 24, servingSize: 120, servingUnit: 'gram', emoji: '🥩' },
    { id: 'meal_024', name: 'Sebzeli Güveç', category: 'meal', calories: 170, protein: 6, carbs: 20, fat: 6, servingSize: 200, servingUnit: 'gram', emoji: '🍲' },
    { id: 'meal_025', name: 'Etli Nohut', category: 'meal', calories: 280, protein: 16, carbs: 28, fat: 12, servingSize: 200, servingUnit: 'gram', emoji: '🧆' },

    // ---------- BAKERY / DOUGH ----------
    { id: 'dough_001', name: 'Lahmacun', category: 'meal', calories: 240, protein: 10, carbs: 28, fat: 10, servingSize: 1, servingUnit: 'adet', emoji: '🫓' },
    { id: 'dough_002', name: 'Kaşarlı Pide', category: 'meal', calories: 405, protein: 18, carbs: 45, fat: 17, servingSize: 1, servingUnit: 'dilim', emoji: '🫓' },
    { id: 'dough_003', name: 'Kıymalı Pide', category: 'meal', calories: 390, protein: 17, carbs: 44, fat: 15, servingSize: 1, servingUnit: 'dilim', emoji: '🫓' },
    { id: 'dough_004', name: 'Su Böreği', category: 'meal', calories: 348, protein: 10, carbs: 31, fat: 22, servingSize: 1, servingUnit: 'dilim', emoji: '🥧' },
    { id: 'dough_005', name: 'Gözleme (peynirli)', category: 'meal', calories: 330, protein: 14, carbs: 42, fat: 12, servingSize: 1, servingUnit: 'adet', emoji: '🫓' },

    // ---------- BREAKFAST ----------
    { id: 'breakfast_001', name: 'Beyaz Peynir', category: 'dairy', calories: 132, protein: 9, carbs: 2, fat: 11, servingSize: 50, servingUnit: 'gram', emoji: '🧀' },
    { id: 'breakfast_002', name: 'Kaşar Peyniri', category: 'dairy', calories: 165, protein: 12, carbs: 1, fat: 13, servingSize: 50, servingUnit: 'gram', emoji: '🧀' },
    { id: 'breakfast_003', name: 'Lor Peyniri', category: 'dairy', calories: 90, protein: 11, carbs: 2, fat: 4, servingSize: 60, servingUnit: 'gram', emoji: '🧀' },
    { id: 'breakfast_004', name: 'Labne', category: 'dairy', calories: 94, protein: 2, carbs: 2, fat: 8, servingSize: 40, servingUnit: 'gram', emoji: '🧀' },
    { id: 'breakfast_005', name: 'Zeytin (Yeşil)', category: 'snack', calories: 58, protein: 0.4, carbs: 2, fat: 6, servingSize: 40, servingUnit: 'gram', emoji: '🫒' },
    { id: 'breakfast_006', name: 'Bal', category: 'snack', calories: 61, protein: 0.1, carbs: 16, fat: 0, servingSize: 20, servingUnit: 'kaşık', emoji: '🍯' },
    { id: 'breakfast_007', name: 'Reçel', category: 'snack', calories: 56, protein: 0.1, carbs: 14, fat: 0, servingSize: 20, servingUnit: 'kaşık', emoji: '🍓' },
    { id: 'breakfast_008', name: 'Tereyağı', category: 'dairy', calories: 72, protein: 0.1, carbs: 0, fat: 8, servingSize: 10, servingUnit: 'gram', emoji: '🧈' },
    { id: 'breakfast_009', name: 'Simit', category: 'carb', calories: 289, protein: 8, carbs: 54, fat: 5, servingSize: 1, servingUnit: 'adet', emoji: '🥯' },
    { id: 'breakfast_010', name: 'Beyaz Ekmek', category: 'carb', calories: 67, protein: 2.5, carbs: 13, fat: 1, servingSize: 1, servingUnit: 'dilim', emoji: '🍞' },
    { id: 'breakfast_011', name: 'Tam Buğday Ekmeği', category: 'carb', calories: 62, protein: 3.5, carbs: 11, fat: 1, servingSize: 1, servingUnit: 'dilim', emoji: '🍞' },
    { id: 'breakfast_012', name: 'Sucuk', category: 'protein', calories: 186, protein: 10, carbs: 1, fat: 16, servingSize: 60, servingUnit: 'gram', emoji: '🥓' },
    { id: 'breakfast_013', name: 'Pastırma', category: 'protein', calories: 100, protein: 11, carbs: 1, fat: 6, servingSize: 40, servingUnit: 'gram', emoji: '🥓' },
    { id: 'breakfast_014', name: 'Yulaf Ezmesi', category: 'carb', calories: 227, protein: 8, carbs: 40, fat: 4, servingSize: 60, servingUnit: 'gram', emoji: '🌾' },

    // ---------- FRUITS ----------
    { id: 'fruit_001', name: 'Elma', category: 'fruit', calories: 78, protein: 0.5, carbs: 21, fat: 0.3, servingSize: 1, servingUnit: 'adet', emoji: '🍎' },
    { id: 'fruit_002', name: 'Muz', category: 'fruit', calories: 107, protein: 1.3, carbs: 28, fat: 0.4, servingSize: 1, servingUnit: 'adet', emoji: '🍌' },
    { id: 'fruit_003', name: 'Portakal', category: 'fruit', calories: 70, protein: 1.4, carbs: 18, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🍊' },
    { id: 'fruit_004', name: 'Çilek', category: 'fruit', calories: 48, protein: 1, carbs: 12, fat: 0.5, servingSize: 1, servingUnit: 'kase', emoji: '🍓' },
    { id: 'fruit_005', name: 'Üzüm', category: 'fruit', calories: 83, protein: 0.8, carbs: 22, fat: 0.2, servingSize: 1, servingUnit: 'salkım', emoji: '🍇' },
    { id: 'fruit_006', name: 'Karpuz', category: 'fruit', calories: 60, protein: 1, carbs: 16, fat: 0.3, servingSize: 1, servingUnit: 'dilim', emoji: '🍉' },
    { id: 'fruit_007', name: 'Kavun', category: 'fruit', calories: 68, protein: 1.6, carbs: 16, fat: 0.4, servingSize: 1, servingUnit: 'dilim', emoji: '🍈' },
    { id: 'fruit_008', name: 'Şeftali', category: 'fruit', calories: 59, protein: 1.4, carbs: 15, fat: 0.5, servingSize: 1, servingUnit: 'adet', emoji: '🍑' },
    { id: 'fruit_009', name: 'Armut', category: 'fruit', calories: 86, protein: 0.6, carbs: 23, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🍐' },
    { id: 'fruit_010', name: 'Kivi', category: 'fruit', calories: 55, protein: 1, carbs: 14, fat: 0.5, servingSize: 1, servingUnit: 'adet', emoji: '🥝' },
    { id: 'fruit_011', name: 'Nar', category: 'fruit', calories: 125, protein: 2.6, carbs: 29, fat: 1.8, servingSize: 1, servingUnit: 'adet', emoji: '🫚' },
    { id: 'fruit_012', name: 'İncir (taze)', category: 'fruit', calories: 44, protein: 0.5, carbs: 12, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🟣' },
    { id: 'fruit_013', name: 'Hurma (kuru)', category: 'fruit', calories: 57, protein: 0.5, carbs: 15, fat: 0.1, servingSize: 1, servingUnit: 'adet', emoji: '🍬' },

    // ---------- VEGETABLES ----------
    { id: 'veg_001', name: 'Domates', category: 'vegetable', calories: 27, protein: 1.4, carbs: 6, fat: 0.3, servingSize: 1, servingUnit: 'adet', emoji: '🍅' },
    { id: 'veg_002', name: 'Salatalık', category: 'vegetable', calories: 24, protein: 1, carbs: 5, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🥒' },
    { id: 'veg_003', name: 'Marul', category: 'vegetable', calories: 12, protein: 1, carbs: 2, fat: 0.2, servingSize: 1, servingUnit: 'porsiyon', emoji: '🥬' },
    { id: 'veg_004', name: 'Brokoli', category: 'vegetable', calories: 51, protein: 4, carbs: 11, fat: 0.6, servingSize: 1, servingUnit: 'porsiyon', emoji: '🥦' },
    { id: 'veg_005', name: 'Havuç', category: 'vegetable', calories: 49, protein: 1, carbs: 12, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🥕' },
    { id: 'veg_006', name: 'Patlıcan', category: 'vegetable', calories: 40, protein: 1.6, carbs: 10, fat: 0.3, servingSize: 1, servingUnit: 'adet', emoji: '🍆' },
    { id: 'veg_007', name: 'Biber (yeşil)', category: 'vegetable', calories: 24, protein: 1.2, carbs: 6, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🫑' },
    { id: 'veg_008', name: 'Soğan', category: 'vegetable', calories: 40, protein: 1, carbs: 9, fat: 0.1, servingSize: 1, servingUnit: 'adet', emoji: '🧅' },
    { id: 'veg_009', name: 'Ispanak', category: 'vegetable', calories: 35, protein: 4, carbs: 6, fat: 0.6, servingSize: 1, servingUnit: 'porsiyon', emoji: '🌿' },
    { id: 'veg_010', name: 'Karnabahar', category: 'vegetable', calories: 38, protein: 3, carbs: 8, fat: 0.5, servingSize: 1, servingUnit: 'porsiyon', emoji: '🥦' },
    { id: 'veg_011', name: 'Patates (haşlanmış)', category: 'vegetable', calories: 131, protein: 3, carbs: 30, fat: 0.2, servingSize: 1, servingUnit: 'adet', emoji: '🥔' },

    // ---------- LEGUMES / GRAINS ----------
    { id: 'leg_001', name: 'Nohut (pişmiş)', category: 'meal', calories: 246, protein: 13, carbs: 41, fat: 4, servingSize: 150, servingUnit: 'gram', emoji: '🧆' },
    { id: 'leg_002', name: 'Mercimek (pişmiş)', category: 'meal', calories: 174, protein: 14, carbs: 30, fat: 0.6, servingSize: 150, servingUnit: 'gram', emoji: '🫘' },
    { id: 'leg_003', name: 'Barbunya (pişmiş)', category: 'meal', calories: 209, protein: 14, carbs: 38, fat: 1.2, servingSize: 150, servingUnit: 'gram', emoji: '🫘' },
    { id: 'leg_004', name: 'Bulgur (kuru)', category: 'carb', calories: 205, protein: 7, carbs: 46, fat: 0.8, servingSize: 60, servingUnit: 'gram', emoji: '🌾' },
    { id: 'leg_005', name: 'Esmer Pirinç (kuru)', category: 'carb', calories: 217, protein: 5, carbs: 46, fat: 1.6, servingSize: 60, servingUnit: 'gram', emoji: '🌾' },

    // ---------- SNACKS / NUTS ----------
    { id: 'snack_001', name: 'Badem', category: 'snack', calories: 174, protein: 6, carbs: 7, fat: 15, servingSize: 1, servingUnit: 'avuç', emoji: '🌰' },
    { id: 'snack_002', name: 'Ceviz', category: 'snack', calories: 196, protein: 5, carbs: 4, fat: 20, servingSize: 1, servingUnit: 'avuç', emoji: '🌰' },
    { id: 'snack_003', name: 'Fındık', category: 'snack', calories: 188, protein: 5, carbs: 5, fat: 18, servingSize: 1, servingUnit: 'avuç', emoji: '🌰' },
    { id: 'snack_004', name: 'Fıstık (yer fıstığı)', category: 'snack', calories: 170, protein: 8, carbs: 5, fat: 15, servingSize: 1, servingUnit: 'avuç', emoji: '🥜' },
    { id: 'snack_005', name: 'Leblebi', category: 'snack', calories: 182, protein: 10, carbs: 31, fat: 3, servingSize: 1, servingUnit: 'avuç', emoji: '🟡' },
    { id: 'snack_006', name: 'Protein Bar', category: 'snack', calories: 200, protein: 20, carbs: 22, fat: 7, servingSize: 1, servingUnit: 'adet', emoji: '🍫' },
    { id: 'snack_007', name: 'Granola Bar', category: 'snack', calories: 150, protein: 3, carbs: 25, fat: 5, servingSize: 1, servingUnit: 'adet', emoji: '🍫' },

    // ---------- BEVERAGES ----------
    { id: 'bev_001', name: 'Süt (Tam Yağlı)', category: 'beverage', calories: 122, protein: 6, carbs: 10, fat: 7, servingSize: 1, servingUnit: 'bardak', emoji: '🥛' },
    { id: 'bev_002', name: 'Süt (Yarım Yağlı)', category: 'beverage', calories: 100, protein: 7, carbs: 10, fat: 4, servingSize: 1, servingUnit: 'bardak', emoji: '🥛' },
    { id: 'bev_003', name: 'Süt (Yağsız)', category: 'beverage', calories: 68, protein: 7, carbs: 10, fat: 0.2, servingSize: 1, servingUnit: 'bardak', emoji: '🥛' },
    { id: 'bev_004', name: 'Ayran', category: 'beverage', calories: 54, protein: 3, carbs: 4, fat: 3, servingSize: 1, servingUnit: 'bardak', emoji: '🥛' },
    { id: 'bev_005', name: 'Portakal Suyu', category: 'beverage', calories: 90, protein: 1.4, carbs: 20, fat: 0.4, servingSize: 1, servingUnit: 'bardak', emoji: '🧃' },
    { id: 'bev_006', name: 'Türk Kahvesi (şekersiz)', category: 'beverage', calories: 2, protein: 0.1, carbs: 0.3, fat: 0, servingSize: 1, servingUnit: 'fincan', emoji: '☕' },
    { id: 'bev_007', name: 'Çay (Şekersiz)', category: 'beverage', calories: 2, protein: 0, carbs: 0.4, fat: 0, servingSize: 1, servingUnit: 'bardak', emoji: '🍵' },
    { id: 'bev_008', name: 'Maden Suyu', category: 'beverage', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 1, servingUnit: 'bardak', emoji: '🫗' },

    // ---------- DAIRY ----------
    { id: 'dairy_001', name: 'Yoğurt (Tam Yağlı)', category: 'dairy', calories: 122, protein: 7, carbs: 9, fat: 7, servingSize: 1, servingUnit: 'kase', emoji: '🥛' },
    { id: 'dairy_002', name: 'Yoğurt (Yağsız)', category: 'dairy', calories: 112, protein: 11, carbs: 15, fat: 0.4, servingSize: 1, servingUnit: 'kase', emoji: '🥛' },

    // ---------- DESSERTS ----------
    { id: 'dessert_001', name: 'Baklava', category: 'dessert', calories: 387, protein: 5, carbs: 49, fat: 20, servingSize: 1, servingUnit: 'dilim', emoji: '🍰' },
    { id: 'dessert_002', name: 'Sütlaç', category: 'dessert', calories: 168, protein: 5, carbs: 27, fat: 4, servingSize: 1, servingUnit: 'kase', emoji: '🍮' },
    { id: 'dessert_003', name: 'Dondurma (Vanilya)', category: 'dessert', calories: 103, protein: 2, carbs: 12, fat: 5.5, servingSize: 1, servingUnit: 'top', emoji: '🍦' },
    { id: 'dessert_004', name: 'Çikolata (Sütlü)', category: 'dessert', calories: 267, protein: 4, carbs: 30, fat: 15, servingSize: 1, servingUnit: 'bar', emoji: '🍫' },
    { id: 'dessert_005', name: 'Künefe', category: 'dessert', calories: 525, protein: 11, carbs: 60, fat: 26, servingSize: 1, servingUnit: 'porsiyon', emoji: '🧀' },
    { id: 'dessert_006', name: 'Kazandibi', category: 'dessert', calories: 270, protein: 6, carbs: 42, fat: 8, servingSize: 1, servingUnit: 'dilim', emoji: '🍮' },
    { id: 'dessert_007', name: 'Tulumba', category: 'dessert', calories: 152, protein: 1, carbs: 22, fat: 6, servingSize: 1, servingUnit: 'adet', emoji: '🍯' },

    // ---------- FAST FOOD ----------
    { id: 'fast_001', name: 'Pizza (karışık)', category: 'meal', calories: 399, protein: 17, carbs: 50, fat: 15, servingSize: 1, servingUnit: 'dilim', emoji: '🍕' },
    { id: 'fast_002', name: 'Hamburger', category: 'meal', calories: 490, protein: 28, carbs: 40, fat: 23, servingSize: 1, servingUnit: 'adet', emoji: '🍔' },
    { id: 'fast_003', name: 'Patates Kızartması', category: 'snack', calories: 312, protein: 3, carbs: 41, fat: 15, servingSize: 1, servingUnit: 'porsiyon', emoji: '🍟' },
    { id: 'fast_004', name: 'Dürüm (et döner)', category: 'meal', calories: 460, protein: 24, carbs: 44, fat: 20, servingSize: 1, servingUnit: 'adet', emoji: '🌯' },
    { id: 'fast_005', name: 'Dürüm (tavuk döner)', category: 'meal', calories: 410, protein: 26, carbs: 44, fat: 14, servingSize: 1, servingUnit: 'adet', emoji: '🌯' },
  ];

  static getAllFoods(): Food[] {
    Logger.log('FoodDatabase', 'Getting all foods', { count: this.foods.length });
    return this.foods;
  }

  static searchFoods(query: string): Food[] {
    Logger.log('FoodDatabase', 'Searching foods', { query });
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return this.foods;
    const results = this.foods.filter((food) => food.name.toLowerCase().includes(normalizedQuery));
    Logger.log('FoodDatabase', 'Search completed', { query, resultsCount: results.length });
    return results;
  }

  static getFoodsByCategory(category: Food['category']): Food[] {
    Logger.log('FoodDatabase', 'Getting foods by category', { category });
    const results = this.foods.filter((food) => food.category === category);
    Logger.log('FoodDatabase', 'Category search completed', { category, resultsCount: results.length });
    return results;
  }

  static getFoodById(id: string): Food | null {
    Logger.log('FoodDatabase', 'Getting food by ID', { id });
    const food = this.foods.find((f) => f.id === id);
    if (food) Logger.log('FoodDatabase', 'Food found', food);
    else Logger.log('FoodDatabase', 'Food not found', { id });
    return food || null;
  }

  static getPopularFoods(limit: number = 10): Food[] {
    Logger.log('FoodDatabase', 'Getting popular foods', { limit });
    return this.foods.slice(0, limit);
  }

  static getCategoryStats(): Array<{ category: string; count: number; emoji: string }> {
    Logger.log('FoodDatabase', 'Getting category stats');
    const categoryMap = new Map<string, number>();
    this.foods.forEach((food) => {
      const count = categoryMap.get(food.category) || 0;
      categoryMap.set(food.category, count + 1);
    });
    const categoryEmojis: Record<string, string> = {
      meal: '🍽️',
      protein: '🥩',
      carb: '🍚',
      fruit: '🍎',
      vegetable: '🥗',
      snack: '🍿',
      beverage: '🥤',
      dairy: '🥛',
      dessert: '🍰',
    };
    const stats = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      emoji: categoryEmojis[category] || '🍴',
    }));
    Logger.log('FoodDatabase', 'Category stats generated', { stats });
    return stats;
  }
}