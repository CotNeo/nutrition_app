import { Meal } from '../types';
import { NutritionService } from './nutritionService';
import { Logger } from '../utils/logger';

/**
 * Streak Service
 * Calculates and manages user's daily tracking streak
 */
export class StreakService {
  /**
   * Calculates current streak based on meal logging
   * @returns Promise<number> Current streak in days
   */
  static async calculateStreak(): Promise<number> {
    try {
      Logger.log('StreakService', 'Calculating streak');

      // 1. Get all meals
      const meals = await NutritionService.getMeals();
      
      if (meals.length === 0) {
        Logger.log('StreakService', 'No meals found, streak is 0');
        return 0;
      }

      // 2. Get unique dates with meals (sorted descending)
      const uniqueDates = this.getUniqueDates(meals)
        .sort((a, b) => b.getTime() - a.getTime());

      Logger.log('StreakService', 'Unique dates found', { count: uniqueDates.length });

      // 3. Calculate streak from today backwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;
      let checkDate = new Date(today);

      for (let i = 0; i < uniqueDates.length; i++) {
        const mealDate = new Date(uniqueDates[i]);
        mealDate.setHours(0, 0, 0, 0);

        // Check if this date matches our expected date
        if (this.isSameDay(mealDate, checkDate)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1); // Move to previous day
        } else if (mealDate < checkDate) {
          // Gap found, break the streak
          break;
        }
      }

      Logger.log('StreakService', 'Streak calculated', { streak });
      return streak;
    } catch (error) {
      Logger.error('StreakService', 'Failed to calculate streak', error);
      return 0;
    }
  }

  /**
   * Gets unique dates from meals array
   * @param meals Array of meals
   * @returns Array of unique dates
   */
  private static getUniqueDates(meals: Meal[]): Date[] {
    const uniqueDates: Date[] = [];
    
    meals.forEach((meal) => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      
      const exists = uniqueDates.some((date) => this.isSameDay(date, mealDate));
      
      if (!exists) {
        uniqueDates.push(mealDate);
      }
    });

    return uniqueDates;
  }

  /**
   * Checks if two dates are the same day
   * @param date1 First date
   * @param date2 Second date
   * @returns boolean
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Checks if today has any meals logged
   * @returns Promise<boolean>
   */
  static async hasTodayMeal(): Promise<boolean> {
    try {
      const meals = await NutritionService.getMeals();
      const today = new Date();
      
      return meals.some((meal) => this.isSameDay(new Date(meal.date), today));
    } catch (error) {
      Logger.error('StreakService', 'Failed to check today meal', error);
      return false;
    }
  }

  /**
   * Gets milestone for current streak
   * @param streak Current streak
   * @returns Milestone info or null
   */
  static getMilestone(streak: number): { message: string; emoji: string } | null {
    const milestones = [
      { days: 1, message: 'İlk adım atıldı! 🎉', emoji: '🎉' },
      { days: 3, message: '3 gün üst üste! Harika! 🌟', emoji: '🌟' },
      { days: 7, message: '1 hafta tamamlandı! 🔥', emoji: '🔥' },
      { days: 14, message: '2 hafta! Süpersin! 💪', emoji: '💪' },
      { days: 30, message: '1 ay! İnanılmaz! 🏆', emoji: '🏆' },
      { days: 60, message: '2 ay! Efsanesin! 👑', emoji: '👑' },
      { days: 100, message: '100 gün! Unutulmaz! 🎊', emoji: '🎊' },
    ];

    const milestone = milestones.find((m) => m.days === streak);
    return milestone || null;
  }

  /**
   * Gets longest streak ever
   * @returns Promise<number>
   */
  static async getLongestStreak(): Promise<number> {
    try {
      const meals = await NutritionService.getMeals();
      
      if (meals.length === 0) return 0;

      const uniqueDates = this.getUniqueDates(meals)
        .sort((a, b) => a.getTime() - b.getTime());

      let maxStreak = 1;
      let currentStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }

      Logger.log('StreakService', 'Longest streak calculated', { maxStreak });
      return maxStreak;
    } catch (error) {
      Logger.error('StreakService', 'Failed to get longest streak', error);
      return 0;
    }
  }
}

