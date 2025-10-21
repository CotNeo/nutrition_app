import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';

/**
 * Storage utility for managing AsyncStorage operations
 * Provides a clean interface for storing and retrieving data
 */
export class StorageService {
  /**
   * Stores data in AsyncStorage
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   * @returns Promise<boolean> Success status
   */
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      Logger.log('StorageService', `Setting item: ${key}`);
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      Logger.log('StorageService', `Successfully saved: ${key}`);
      return true;
    } catch (error) {
      Logger.error('StorageService', `Failed to save ${key}`, error);
      return false;
    }
  }

  /**
   * Retrieves data from AsyncStorage
   * @param key Storage key
   * @returns Promise<T | null> Retrieved value or null if not found
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      Logger.log('StorageService', `Getting item: ${key}`);
      const jsonValue = await AsyncStorage.getItem(key);
      
      if (jsonValue === null) {
        Logger.log('StorageService', `No value found for: ${key}`);
        return null;
      }

      const parsed = JSON.parse(jsonValue) as T;
      Logger.log('StorageService', `Successfully retrieved: ${key}`);
      return parsed;
    } catch (error) {
      Logger.error('StorageService', `Failed to get ${key}`, error);
      return null;
    }
  }

  /**
   * Removes an item from AsyncStorage
   * @param key Storage key
   * @returns Promise<boolean> Success status
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      Logger.log('StorageService', `Removing item: ${key}`);
      await AsyncStorage.removeItem(key);
      Logger.log('StorageService', `Successfully removed: ${key}`);
      return true;
    } catch (error) {
      Logger.error('StorageService', `Failed to remove ${key}`, error);
      return false;
    }
  }

  /**
   * Clears all data from AsyncStorage
   * @returns Promise<boolean> Success status
   */
  static async clear(): Promise<boolean> {
    try {
      Logger.log('StorageService', 'Clearing all storage');
      await AsyncStorage.clear();
      Logger.log('StorageService', 'Successfully cleared storage');
      return true;
    } catch (error) {
      Logger.error('StorageService', 'Failed to clear storage', error);
      return false;
    }
  }
}

// Storage keys constants
export const STORAGE_KEYS = {
  USER: 'user',
  MEALS: 'meals',
  NUTRITION_GOALS: 'nutrition_goals',
  AUTH_TOKEN: 'auth_token',
  RECENT_FOODS: 'recent_foods',
  FAVORITE_FOODS: 'favorite_foods',
} as const;

