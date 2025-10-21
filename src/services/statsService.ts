import { Meal } from '../types';
import { NutritionService } from './nutritionService';
import { Logger } from '../utils/logger';

/**
 * Statistics Service
 * Provides analytics and reporting for nutrition tracking
 */
export class StatsService {
  /**
   * Gets daily nutrition data for a date range
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of daily nutrition totals
   */
  static async getDailyNutritionRange(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: Date;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealCount: number;
  }>> {
    try {
      Logger.log('StatsService', 'Getting daily nutrition range', { startDate, endDate });

      const meals = await NutritionService.getMeals();
      const dailyData: Map<string, any> = new Map();

      // Filter meals within date range
      const filteredMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.date);
        return mealDate >= startDate && mealDate <= endDate;
      });

      // Group by date
      filteredMeals.forEach((meal) => {
        const dateKey = new Date(meal.date).toDateString();
        
        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, {
            date: new Date(meal.date),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            mealCount: 0,
          });
        }

        const day = dailyData.get(dateKey);
        day.calories += meal.calories;
        day.protein += meal.protein;
        day.carbs += meal.carbs;
        day.fat += meal.fat;
        day.mealCount += 1;
      });

      const result = Array.from(dailyData.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      Logger.log('StatsService', 'Daily nutrition range calculated', {
        totalDays: result.length,
      });

      return result;
    } catch (error) {
      Logger.error('StatsService', 'Error getting daily nutrition range', error);
      return [];
    }
  }

  /**
   * Gets weekly summary statistics
   * @returns Weekly stats
   */
  static async getWeeklyStats(): Promise<{
    totalCalories: number;
    avgCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    daysTracked: number;
    totalMeals: number;
  }> {
    try {
      Logger.log('StatsService', 'Calculating weekly stats');

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const dailyData = await this.getDailyNutritionRange(weekAgo, today);

      const stats = dailyData.reduce(
        (acc, day) => ({
          totalCalories: acc.totalCalories + day.calories,
          totalProtein: acc.totalProtein + day.protein,
          totalCarbs: acc.totalCarbs + day.carbs,
          totalFat: acc.totalFat + day.fat,
          totalMeals: acc.totalMeals + day.mealCount,
          daysTracked: acc.daysTracked + 1,
        }),
        {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalMeals: 0,
          daysTracked: 0,
        }
      );

      const avgCalories = stats.daysTracked > 0 
        ? Math.round(stats.totalCalories / stats.daysTracked) 
        : 0;

      Logger.log('StatsService', 'Weekly stats calculated', { ...stats, avgCalories });

      return { ...stats, avgCalories };
    } catch (error) {
      Logger.error('StatsService', 'Error calculating weekly stats', error);
      return {
        totalCalories: 0,
        avgCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysTracked: 0,
        totalMeals: 0,
      };
    }
  }

  /**
   * Gets monthly summary statistics
   * @returns Monthly stats
   */
  static async getMonthlyStats(): Promise<{
    totalCalories: number;
    avgCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    daysTracked: number;
    totalMeals: number;
  }> {
    try {
      Logger.log('StatsService', 'Calculating monthly stats');

      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const dailyData = await this.getDailyNutritionRange(monthAgo, today);

      const stats = dailyData.reduce(
        (acc, day) => ({
          totalCalories: acc.totalCalories + day.calories,
          totalProtein: acc.totalProtein + day.protein,
          totalCarbs: acc.totalCarbs + day.carbs,
          totalFat: acc.totalFat + day.fat,
          totalMeals: acc.totalMeals + day.mealCount,
          daysTracked: acc.daysTracked + 1,
        }),
        {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          totalMeals: 0,
          daysTracked: 0,
        }
      );

      const avgCalories = stats.daysTracked > 0 
        ? Math.round(stats.totalCalories / stats.daysTracked) 
        : 0;

      Logger.log('StatsService', 'Monthly stats calculated', { ...stats, avgCalories });

      return { ...stats, avgCalories };
    } catch (error) {
      Logger.error('StatsService', 'Error calculating monthly stats', error);
      return {
        totalCalories: 0,
        avgCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysTracked: 0,
        totalMeals: 0,
      };
    }
  }

  /**
   * Gets macro distribution percentages
   * @param protein Protein in grams
   * @param carbs Carbs in grams
   * @param fat Fat in grams
   * @returns Percentage distribution
   */
  static getMacroDistribution(protein: number, carbs: number, fat: number): {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  } {
    // Calories per gram: Protein = 4, Carbs = 4, Fat = 9
    const proteinCal = protein * 4;
    const carbsCal = carbs * 4;
    const fatCal = fat * 9;
    const total = proteinCal + carbsCal + fatCal;

    if (total === 0) {
      return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };
    }

    return {
      proteinPercent: Math.round((proteinCal / total) * 100),
      carbsPercent: Math.round((carbsCal / total) * 100),
      fatPercent: Math.round((fatCal / total) * 100),
    };
  }

  /**
   * Gets best and worst performing days
   * @param days Number of days to analyze
   * @returns Best and worst days
   */
  static async getBestAndWorstDays(days: number = 7): Promise<{
    bestDay: { date: Date; calories: number; } | null;
    worstDay: { date: Date; calories: number; } | null;
  }> {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const dailyData = await this.getDailyNutritionRange(startDate, today);

      if (dailyData.length === 0) {
        return { bestDay: null, worstDay: null };
      }

      // Best day = closest to goal (assuming 2000 kcal target for now)
      // TODO: Use actual user goal
      const TARGET = 2000;
      
      const sorted = dailyData
        .map((day) => ({
          date: day.date,
          calories: day.calories,
          diff: Math.abs(day.calories - TARGET),
        }))
        .sort((a, b) => a.diff - b.diff);

      return {
        bestDay: { date: sorted[0].date, calories: sorted[0].calories },
        worstDay: { date: sorted[sorted.length - 1].date, calories: sorted[sorted.length - 1].calories },
      };
    } catch (error) {
      Logger.error('StatsService', 'Error getting best/worst days', error);
      return { bestDay: null, worstDay: null };
    }
  }

  /**
   * Gets average nutrition for last N days
   * @param days Number of days to analyze
   * @returns Average nutrition values
   */
  static async getAverageNutrition(days: number = 7): Promise<{
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
  }> {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const dailyData = await this.getDailyNutritionRange(startDate, today);

      if (dailyData.length === 0) {
        return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
      }

      const totals = dailyData.reduce(
        (acc, day) => ({
          calories: acc.calories + day.calories,
          protein: acc.protein + day.protein,
          carbs: acc.carbs + day.carbs,
          fat: acc.fat + day.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      return {
        avgCalories: Math.round(totals.calories / dailyData.length),
        avgProtein: Math.round(totals.protein / dailyData.length),
        avgCarbs: Math.round(totals.carbs / dailyData.length),
        avgFat: Math.round(totals.fat / dailyData.length),
      };
    } catch (error) {
      Logger.error('StatsService', 'Error calculating average nutrition', error);
      return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
    }
  }

  /**
   * Gets meal type distribution
   * @param days Number of days to analyze
   * @returns Meal type breakdown
   */
  static async getMealTypeDistribution(days: number = 7): Promise<{
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  }> {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const meals = await NutritionService.getMeals();
      const filteredMeals = meals.filter((meal) => {
        const mealDate = new Date(meal.date);
        return mealDate >= startDate && mealDate <= today;
      });

      const distribution = filteredMeals.reduce(
        (acc, meal) => {
          acc[meal.mealType] += 1;
          return acc;
        },
        { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
      );

      Logger.log('StatsService', 'Meal type distribution calculated', distribution);
      return distribution;
    } catch (error) {
      Logger.error('StatsService', 'Error calculating meal distribution', error);
      return { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    }
  }

  /**
   * Gets calorie trend (increasing/decreasing/stable)
   * @param days Number of days to analyze
   * @returns Trend analysis
   */
  static async getCalorieTrend(days: number = 7): Promise<{
    trend: 'increasing' | 'decreasing' | 'stable';
    change: number; // Average daily change
  }> {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      const dailyData = await this.getDailyNutritionRange(startDate, today);

      if (dailyData.length < 2) {
        return { trend: 'stable', change: 0 };
      }

      // Calculate trend using first half vs second half
      const midPoint = Math.floor(dailyData.length / 2);
      const firstHalf = dailyData.slice(0, midPoint);
      const secondHalf = dailyData.slice(midPoint);

      const avgFirst = firstHalf.reduce((acc, day) => acc + day.calories, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((acc, day) => acc + day.calories, 0) / secondHalf.length;

      const change = Math.round(avgSecond - avgFirst);
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

      if (change > 50) {
        trend = 'increasing';
      } else if (change < -50) {
        trend = 'decreasing';
      }

      Logger.log('StatsService', 'Calorie trend calculated', { trend, change });
      return { trend, change };
    } catch (error) {
      Logger.error('StatsService', 'Error calculating trend', error);
      return { trend: 'stable', change: 0 };
    }
  }
}

