import { Food } from '../types';
import { Logger } from '../utils/logger';

/**
 * Barcode Service
 * Handles barcode scanning and product lookup from OpenFoodFacts API
 */
export class BarcodeService {
  private static API_URL = 'https://world.openfoodfacts.org/api/v0/product';

  /**
   * Searches for a product by barcode using OpenFoodFacts API
   * @param barcode Product barcode
   * @returns Promise<Food | null> Product information or null
   */
  static async searchProductByBarcode(barcode: string): Promise<Food | null> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 BARCODE SERVICE - PRODUCT SEARCH');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.log('BarcodeService', 'Step 1: Starting product search', { barcode });

      // Validate barcode
      if (!this.isValidBarcode(barcode)) {
        Logger.error('BarcodeService', 'Invalid barcode format', { barcode, length: barcode.length });
        return null;
      }

      // Build API URL
      const apiUrl = `${this.API_URL}/${barcode}.json`;
      Logger.log('BarcodeService', 'Step 2: Calling OpenFoodFacts API', { url: apiUrl });
      console.log('📡 API URL:', apiUrl);

      // Call OpenFoodFacts API
      const response = await fetch(apiUrl);
      Logger.log('BarcodeService', 'Step 3: API Response received', { 
        status: response.status,
        ok: response.ok 
      });
      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        Logger.error('BarcodeService', 'API request failed', { status: response.status });
        return null;
      }

      const data = await response.json();
      Logger.log('BarcodeService', 'Step 4: JSON parsed', { 
        hasProduct: !!data.product,
        status: data.status 
      });
      console.log('📦 API Response:', JSON.stringify(data, null, 2));

      if (data.status === 0 || !data.product) {
        Logger.log('BarcodeService', 'Product not found in database', { barcode });
        console.log('❌ Product not found');
        return null;
      }

      const product = data.product;
      console.log('✅ Product found:', product.product_name || product.product_name_tr);
      Logger.log('BarcodeService', 'Step 5: Product found', { 
        name: product.product_name,
        name_tr: product.product_name_tr,
        brands: product.brands,
        barcode 
      });

      // Extract nutrition data (per 100g)
      const nutriments = product.nutriments || {};
      Logger.log('BarcodeService', 'Step 6: Extracting nutrition data', {
        hasNutriments: !!product.nutriments,
        energyKcal: nutriments['energy-kcal_100g'],
        energy: nutriments.energy_100g,
        proteins: nutriments.proteins_100g,
        carbs: nutriments.carbohydrates_100g,
        fat: nutriments.fat_100g,
      });
      console.log('🔬 Nutriments:', nutriments);

      // Calculate calories - try multiple fields
      let calories = 0;
      if (nutriments['energy-kcal_100g']) {
        calories = Math.round(nutriments['energy-kcal_100g']);
        console.log('  Using energy-kcal_100g:', calories);
      } else if (nutriments['energy-kcal']) {
        calories = Math.round(nutriments['energy-kcal']);
        console.log('  Using energy-kcal:', calories);
      } else if (nutriments.energy_100g) {
        calories = Math.round(nutriments.energy_100g / 4.184);
        console.log('  Using energy_100g (converted):', calories);
      } else if (nutriments.energy) {
        calories = Math.round(nutriments.energy / 4.184);
        console.log('  Using energy (converted):', calories);
      } else {
        console.log('  ⚠️ No energy data found, using 0');
      }

      // Get macros with multiple fallbacks
      const protein = Math.round(
        nutriments.proteins_100g || 
        nutriments.proteins || 
        nutriments.protein_100g || 
        nutriments.protein || 
        0
      );
      const carbs = Math.round(
        nutriments.carbohydrates_100g || 
        nutriments.carbohydrates || 
        nutriments['carbohydrates-100g'] ||
        0
      );
      const fat = Math.round(
        nutriments.fat_100g || 
        nutriments.fat || 
        nutriments['fat-100g'] ||
        0
      );

      console.log('🔢 Calculated Macros:');
      console.log('  Calories:', calories);
      console.log('  Protein:', protein);
      console.log('  Carbs:', carbs);
      console.log('  Fat:', fat);

      // Determine category
      const category = this.determineCategory(product);
      Logger.log('BarcodeService', 'Step 7: Category determined', { category });

      // Get product name with fallbacks
      const productName = 
        product.product_name || 
        product.product_name_tr || 
        product.generic_name ||
        product.brands || 
        'Bilinmeyen Ürün';

      console.log('📝 Product Name:', productName);

      // Get serving info with smart unit detection
      let servingSize = 100;
      let servingUnit = 'gram';

      console.log('📏 Serving Info from API:');
      console.log('  serving_quantity:', product.serving_quantity);
      console.log('  serving_quantity_unit:', product.serving_quantity_unit);
      console.log('  serving_size:', product.serving_size);
      console.log('  quantity:', product.quantity);

      // Determine serving size and unit
      if (product.serving_quantity && product.serving_quantity_unit) {
        servingSize = parseFloat(product.serving_quantity) || 100;
        servingUnit = this.normalizeServingUnit(product.serving_quantity_unit);
      } else if (product.serving_size) {
        // Parse serving size like "330 ml" or "100g"
        const match = product.serving_size.match(/(\d+\.?\d*)\s*(\w+)/);
        if (match) {
          servingSize = parseFloat(match[1]) || 100;
          servingUnit = this.normalizeServingUnit(match[2]);
        }
      } else if (product.quantity) {
        // Parse quantity like "330 ml"
        const match = product.quantity.match(/(\d+\.?\d*)\s*(\w+)/);
        if (match) {
          servingSize = parseFloat(match[1]) || 100;
          servingUnit = this.normalizeServingUnit(match[2]);
        }
      }

      // Detect if liquid or solid based on category or unit
      const isLiquid = this.isLiquidProduct(product, servingUnit);
      if (isLiquid && servingUnit === 'gram') {
        servingUnit = 'ml';
      }

      console.log('📏 Final Serving:', servingSize, servingUnit);
      console.log('💧 Is Liquid:', isLiquid);

      // Store base values (per 100g or 100ml) for dynamic calculation
      const baseCalories = isNaN(calories) ? 0 : calories;
      const baseProtein = isNaN(protein) ? 0 : protein;
      const baseCarbs = isNaN(carbs) ? 0 : carbs;
      const baseFat = isNaN(fat) ? 0 : fat;

      // Calculate nutrition for the specific serving size
      const servingMultiplier = servingSize / 100;
      const calculatedCalories = Math.round(baseCalories * servingMultiplier);
      const calculatedProtein = Math.round(baseProtein * servingMultiplier);
      const calculatedCarbs = Math.round(baseCarbs * servingMultiplier);
      const calculatedFat = Math.round(baseFat * servingMultiplier);

      console.log('📊 Nutrition Calculation:');
      console.log('  Base (per 100g/ml):');
      console.log('    Calories:', baseCalories);
      console.log('    Protein:', baseProtein);
      console.log('    Carbs:', baseCarbs);
      console.log('    Fat:', baseFat);
      console.log('  Serving:', servingSize, servingUnit);
      console.log('  Multiplier:', servingMultiplier);
      console.log('  Calculated:');
      console.log('    Calories:', calculatedCalories);
      console.log('    Protein:', calculatedProtein);
      console.log('    Carbs:', calculatedCarbs);
      console.log('    Fat:', calculatedFat);

      // Convert to our Food format
      const food: Food = {
        id: `barcode_${barcode}`,
        name: productName,
        category,
        calories: calculatedCalories,
        protein: calculatedProtein,
        carbs: calculatedCarbs,
        fat: calculatedFat,
        servingSize: isNaN(servingSize) ? 100 : servingSize,
        servingUnit: servingUnit || 'gram',
        emoji: this.getCategoryEmoji(product),
        // Store base values for dynamic recalculation
        baseCalories,
        baseProtein,
        baseCarbs,
        baseFat,
        isLiquid,
      };

      // Validate food object before returning
      if (!food.name || food.name === 'Bilinmeyen Ürün') {
        console.log('⚠️ Product has no valid name');
      }
      if (food.calories === 0 && food.protein === 0 && food.carbs === 0 && food.fat === 0) {
        console.log('⚠️ Product has no nutrition data');
      }

      Logger.log('BarcodeService', 'Step 8: Product converted to Food format', food);
      console.log('✨ Final Food Object:', JSON.stringify(food, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return food;
    } catch (error) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ BARCODE SERVICE ERROR:');
      console.error('  Error Type:', error instanceof Error ? error.name : typeof error);
      console.error('  Error Message:', error instanceof Error ? error.message : String(error));
      console.error('  Full Error:', error);
      if (error instanceof Error && error.stack) {
        console.error('  Stack Trace:', error.stack);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      Logger.error('BarcodeService', 'Error searching product', error);
      return null;
    }
  }

  /**
   * Determines category from product data
   * @param product Product data from API
   * @returns Category
   */
  private static determineCategory(product: any): Food['category'] {
    const categories = product.categories_tags || [];
    const categoriesStr = categories.join(' ').toLowerCase();

    console.log('🏷️ Category Detection:');
    console.log('  Categories Tags:', categories);
    console.log('  Combined String:', categoriesStr);

    // Match categories
    if (categoriesStr.includes('beverage') || categoriesStr.includes('drink')) {
      console.log('  → Matched: beverage 🥤');
      return 'beverage';
    }
    if (categoriesStr.includes('dairy') || categoriesStr.includes('milk') || categoriesStr.includes('cheese')) {
      console.log('  → Matched: dairy 🥛');
      return 'dairy';
    }
    if (categoriesStr.includes('fruit')) {
      console.log('  → Matched: fruit 🍎');
      return 'fruit';
    }
    if (categoriesStr.includes('vegetable')) {
      console.log('  → Matched: vegetable 🥗');
      return 'vegetable';
    }
    if (categoriesStr.includes('snack') || categoriesStr.includes('chip')) {
      console.log('  → Matched: snack 🍿');
      return 'snack';
    }
    if (categoriesStr.includes('dessert') || categoriesStr.includes('sweet') || categoriesStr.includes('candy')) {
      console.log('  → Matched: dessert 🍰');
      return 'dessert';
    }
    if (categoriesStr.includes('meat') || categoriesStr.includes('fish') || categoriesStr.includes('protein')) {
      console.log('  → Matched: protein 🥩');
      return 'protein';
    }
    if (categoriesStr.includes('bread') || categoriesStr.includes('pasta') || categoriesStr.includes('rice')) {
      console.log('  → Matched: carb 🍚');
      return 'carb';
    }

    // Default
    console.log('  → Default: meal 🍽️');
    return 'meal';
  }

  /**
   * Normalizes serving unit to standard format
   * @param unit Unit from API
   * @returns Normalized unit
   */
  private static normalizeServingUnit(unit: string): string {
    const normalized = unit.toLowerCase().trim();
    
    // Map various units to our standard units
    const unitMap: Record<string, string> = {
      // Liquid units
      'ml': 'ml',
      'milliliter': 'ml',
      'millilitre': 'ml',
      'l': 'litre',
      'liter': 'litre',
      'litre': 'litre',
      'cl': 'cl',
      'centiliter': 'cl',
      
      // Weight units
      'g': 'gram',
      'gram': 'gram',
      'gramme': 'gram',
      'gr': 'gram',
      'kg': 'kg',
      'kilogram': 'kg',
      'oz': 'oz',
      
      // Count units
      'adet': 'adet',
      'piece': 'adet',
      'pcs': 'adet',
      'unit': 'adet',
      'portion': 'porsiyon',
      'serving': 'porsiyon',
      'servis': 'porsiyon',
      
      // Volume
      'bardak': 'bardak',
      'cup': 'bardak',
      'kase': 'kase',
      'bowl': 'kase',
      'kaşık': 'kaşık',
      'tablespoon': 'kaşık',
      'tbsp': 'kaşık',
    };

    const mappedUnit = unitMap[normalized] || normalized;
    console.log(`  Unit Mapping: ${unit} → ${mappedUnit}`);
    return mappedUnit;
  }

  /**
   * Checks if product is liquid based on category and unit
   * @param product Product data
   * @param unit Serving unit
   * @returns boolean
   */
  private static isLiquidProduct(product: any, unit: string): boolean {
    const categories = product.categories_tags || [];
    const categoriesStr = categories.join(' ').toLowerCase();
    
    // Check category
    const categoryIndicatesLiquid = 
      categoriesStr.includes('beverage') ||
      categoriesStr.includes('drink') ||
      categoriesStr.includes('juice') ||
      categoriesStr.includes('soda') ||
      categoriesStr.includes('water') ||
      categoriesStr.includes('milk') ||
      categoriesStr.includes('beer') ||
      categoriesStr.includes('wine');
    
    // Check unit
    const unitIndicatesLiquid = 
      unit.includes('ml') ||
      unit.includes('l') ||
      unit.includes('litre') ||
      unit.includes('cl');
    
    return categoryIndicatesLiquid || unitIndicatesLiquid;
  }

  /**
   * Gets emoji based on category
   * @param product Product data
   * @returns Emoji string
   */
  private static getCategoryEmoji(product: any): string {
    const category = this.determineCategory(product);
    
    const emojiMap: Record<Food['category'], string> = {
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

    return emojiMap[category] || '🍴';
  }

  /**
   * Validates barcode format
   * @param barcode Barcode string
   * @returns boolean
   */
  static isValidBarcode(barcode: string): boolean {
    // Remove any whitespace
    const cleanBarcode = String(barcode).trim();
    
    // Reject URLs and QR codes
    if (cleanBarcode.startsWith('http://') || 
        cleanBarcode.startsWith('https://') ||
        cleanBarcode.startsWith('www.')) {
      console.log('✓ Barcode Validation:');
      console.log('  Barcode:', barcode);
      console.log('  Result: ❌ URL/QR Code (rejected)');
      return false;
    }
    
    // Accept any barcode with reasonable length
    const minLength = 6;
    const maxLength = 20;
    
    // Check if it has reasonable length
    const hasValidLength = cleanBarcode.length >= minLength && cleanBarcode.length <= maxLength;
    
    // Most barcodes are numeric, but some can be alphanumeric
    const isNumeric = /^\d+$/.test(cleanBarcode);
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(cleanBarcode);
    
    const isValid = hasValidLength && (isNumeric || isAlphanumeric);

    console.log('✓ Barcode Validation:');
    console.log('  Barcode:', barcode);
    console.log('  Clean Barcode:', cleanBarcode);
    console.log('  Length:', cleanBarcode.length, `(${minLength}-${maxLength} allowed)`);
    console.log('  Is Numeric:', isNumeric);
    console.log('  Is Alphanumeric:', isAlphanumeric);
    console.log('  Valid Length:', hasValidLength);
    console.log('  Result:', isValid ? '✅ Valid' : '❌ Invalid');

    if (!isValid && cleanBarcode.length > 0 && cleanBarcode.length <= 20) {
      console.log('  ⚠️ Validation failed but length OK, trying anyway...');
      // Even if validation fails, let's try the API anyway
      return true;
    }

    return isValid;
  }
}

