import { Meal, NutritionGoals } from '../types';
import { StorageService, STORAGE_KEYS } from '../utils/storage';
import { Logger } from '../utils/logger';

/**
 * Service for managing nutrition-related operations
 * Handles meals, nutrition goals, and calculations
 */
export class NutritionService {
  /**
   * Saves a new meal
   * @param meal Meal object to save
   * @returns Promise<boolean> Success status
   */
  static async saveMeal(meal: Meal): Promise<boolean> {
    try {
      Logger.log('NutritionService', 'Saving meal', { name: meal.name, calories: meal.calories });

      // 1. Get existing meals from storage
      const existingMeals = await this.getMeals();

      // 2. Add new meal to the list
      const updatedMeals = [...existingMeals, meal];

      // 3. Save updated meals list
      const success = await StorageService.setItem(STORAGE_KEYS.MEALS, updatedMeals);

      if (success) {
        Logger.log('NutritionService', 'Meal saved successfully', meal);
      } else {
        Logger.error('NutritionService', 'Failed to save meal');
      }

      return success;
    } catch (error) {
      Logger.error('NutritionService', 'Error saving meal', error);
      return false;
    }
  }

  /**
   * Retrieves all saved meals
   * @returns Promise<Meal[]> Array of meals
   */
  static async getMeals(): Promise<Meal[]> {
    try {
      Logger.log('NutritionService', 'Fetching all meals');
      const meals = await StorageService.getItem<Meal[]>(STORAGE_KEYS.MEALS);
      Logger.log('NutritionService', `Found ${meals?.length || 0} meals`);
      return meals || [];
    } catch (error) {
      Logger.error('NutritionService', 'Error fetching meals', error);
      return [];
    }
  }

  /**
   * Deletes a meal by ID
   * @param mealId ID of the meal to delete
   * @returns Promise<boolean> Success status
   */
  static async deleteMeal(mealId: string): Promise<boolean> {
    try {
      Logger.log('NutritionService', 'Deleting meal', { mealId });

      // 1. Get existing meals
      const meals = await this.getMeals();

      // 2. Filter out the meal to delete
      const updatedMeals = meals.filter((meal) => meal.id !== mealId);

      // 3. Save updated list
      const success = await StorageService.setItem(STORAGE_KEYS.MEALS, updatedMeals);

      if (success) {
        Logger.log('NutritionService', 'Meal deleted successfully', { mealId });
      }

      return success;
    } catch (error) {
      Logger.error('NutritionService', 'Error deleting meal', error);
      return false;
    }
  }

  /**
   * Saves nutrition goals
   * @param goals NutritionGoals object
   * @returns Promise<boolean> Success status
   */
  static async saveNutritionGoals(goals: NutritionGoals): Promise<boolean> {
    try {
      Logger.log('NutritionService', 'Saving nutrition goals', goals);
      const success = await StorageService.setItem(STORAGE_KEYS.NUTRITION_GOALS, goals);

      if (success) {
        Logger.log('NutritionService', 'Nutrition goals saved successfully');
      }

      return success;
    } catch (error) {
      Logger.error('NutritionService', 'Error saving nutrition goals', error);
      return false;
    }
  }

  /**
   * Retrieves nutrition goals
   * @returns Promise<NutritionGoals | null> Nutrition goals or null
   */
  static async getNutritionGoals(): Promise<NutritionGoals | null> {
    try {
      Logger.log('NutritionService', 'Fetching nutrition goals');
      const goals = await StorageService.getItem<NutritionGoals>(STORAGE_KEYS.NUTRITION_GOALS);
      Logger.log('NutritionService', 'Nutrition goals fetched', goals);
      return goals;
    } catch (error) {
      Logger.error('NutritionService', 'Error fetching nutrition goals', error);
      return null;
    }
  }

  /**
   * Calculates total nutrition for a given day
   * @param date Date to calculate for
   * @returns Promise<{ calories: number; protein: number; carbs: number; fat: number }>
   */
  static async calculateDailyNutrition(date: Date): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }> {
    try {
      Logger.log('NutritionService', 'Calculating daily nutrition', { date });

      // 1. Get all meals
      const meals = await this.getMeals();

      // 2. Filter meals for the given date
      const targetDate = new Date(date).toDateString();
      const dailyMeals = meals.filter(
        (meal) => new Date(meal.date).toDateString() === targetDate
      );

      // 3. Sum up nutrition values
      const totals = dailyMeals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      Logger.log('NutritionService', 'Daily nutrition calculated', totals);
      return totals;
    } catch (error) {
      Logger.error('NutritionService', 'Error calculating daily nutrition', error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  }
}

