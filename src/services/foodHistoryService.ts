import { Food } from '../types';
import { StorageService, STORAGE_KEYS } from '../utils/storage';
import { Logger } from '../utils/logger';

/**
 * Food History Service
 * Manages recently used foods and favorites
 */
export class FoodHistoryService {
  private static MAX_RECENT_FOODS = 20;

  /**
   * Adds a food to recent foods list
   * @param food Food to add to recent list
   */
  static async addToRecentFoods(food: Food): Promise<void> {
    try {
      Logger.log('FoodHistoryService', 'Adding food to recent', { food: food.name });

      // 1. Get existing recent foods
      const recentFoods = await this.getRecentFoods();

      // 2. Remove food if it already exists (to avoid duplicates)
      const filteredFoods = recentFoods.filter((f) => f.id !== food.id);

      // 3. Add food to the beginning of the list
      const updatedFoods = [food, ...filteredFoods];

      // 4. Keep only the most recent items (limit to MAX_RECENT_FOODS)
      const limitedFoods = updatedFoods.slice(0, this.MAX_RECENT_FOODS);

      // 5. Save to storage
      await StorageService.setItem(STORAGE_KEYS.RECENT_FOODS, limitedFoods);

      Logger.log('FoodHistoryService', 'Food added to recent successfully', {
        totalRecent: limitedFoods.length,
      });
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error adding to recent foods', error);
    }
  }

  /**
   * Gets list of recently used foods
   * @returns Promise<Food[]> Array of recent foods
   */
  static async getRecentFoods(): Promise<Food[]> {
    try {
      Logger.log('FoodHistoryService', 'Getting recent foods');
      const recentFoods = await StorageService.getItem<Food[]>(STORAGE_KEYS.RECENT_FOODS);
      Logger.log('FoodHistoryService', `Found ${recentFoods?.length || 0} recent foods`);
      return recentFoods || [];
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error getting recent foods', error);
      return [];
    }
  }

  /**
   * Clears recent foods list
   */
  static async clearRecentFoods(): Promise<boolean> {
    try {
      Logger.log('FoodHistoryService', 'Clearing recent foods');
      const success = await StorageService.removeItem(STORAGE_KEYS.RECENT_FOODS);
      Logger.log('FoodHistoryService', 'Recent foods cleared');
      return success;
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error clearing recent foods', error);
      return false;
    }
  }

  /**
   * Adds a food to favorites
   * @param food Food to add to favorites
   */
  static async addToFavorites(food: Food): Promise<boolean> {
    try {
      Logger.log('FoodHistoryService', 'Adding food to favorites', { food: food.name });

      // 1. Get existing favorites
      const favorites = await this.getFavoriteFoods();

      // 2. Check if already in favorites
      if (favorites.some((f) => f.id === food.id)) {
        Logger.log('FoodHistoryService', 'Food already in favorites');
        return false;
      }

      // 3. Add to favorites
      const updatedFavorites = [...favorites, food];

      // 4. Save to storage
      await StorageService.setItem(STORAGE_KEYS.FAVORITE_FOODS, updatedFavorites);

      Logger.log('FoodHistoryService', 'Food added to favorites successfully');
      return true;
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error adding to favorites', error);
      return false;
    }
  }

  /**
   * Removes a food from favorites
   * @param foodId Food ID to remove
   */
  static async removeFromFavorites(foodId: string): Promise<boolean> {
    try {
      Logger.log('FoodHistoryService', 'Removing food from favorites', { foodId });

      // 1. Get existing favorites
      const favorites = await this.getFavoriteFoods();

      // 2. Remove food
      const updatedFavorites = favorites.filter((f) => f.id !== foodId);

      // 3. Save to storage
      await StorageService.setItem(STORAGE_KEYS.FAVORITE_FOODS, updatedFavorites);

      Logger.log('FoodHistoryService', 'Food removed from favorites successfully');
      return true;
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error removing from favorites', error);
      return false;
    }
  }

  /**
   * Gets list of favorite foods
   * @returns Promise<Food[]> Array of favorite foods
   */
  static async getFavoriteFoods(): Promise<Food[]> {
    try {
      Logger.log('FoodHistoryService', 'Getting favorite foods');
      const favorites = await StorageService.getItem<Food[]>(STORAGE_KEYS.FAVORITE_FOODS);
      Logger.log('FoodHistoryService', `Found ${favorites?.length || 0} favorite foods`);
      return favorites || [];
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error getting favorite foods', error);
      return [];
    }
  }

  /**
   * Checks if a food is in favorites
   * @param foodId Food ID to check
   * @returns Promise<boolean> True if in favorites
   */
  static async isFavorite(foodId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteFoods();
      return favorites.some((f) => f.id === foodId);
    } catch (error) {
      Logger.error('FoodHistoryService', 'Error checking favorite status', error);
      return false;
    }
  }
}

