import { User, CalorieGoals } from '../types';
import { Logger } from '../utils/logger';

/**
 * Calorie Calculator Service
 * Calculates BMR, TDEE, and personalized macro goals based on user data
 */
export class CalorieCalculator {
  /**
   * Calculates Basal Metabolic Rate using Mifflin-St Jeor Equation
   * @param weight Weight in kg
   * @param height Height in cm
   * @param age Age in years
   * @param gender Gender
   * @returns BMR in calories
   */
  static calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female' | 'other'
  ): number {
    Logger.log('CalorieCalculator', 'Calculating BMR', { weight, height, age, gender });

    let bmr: number;

    if (gender === 'male') {
      // Men: BMR = 10W + 6.25H - 5A + 5
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Women: BMR = 10W + 6.25H - 5A - 161
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    Logger.log('CalorieCalculator', 'BMR calculated', { bmr: Math.round(bmr) });
    return Math.round(bmr);
  }

  /**
   * Calculates Total Daily Energy Expenditure
   * @param bmr Basal Metabolic Rate
   * @param activityLevel Activity level
   * @returns TDEE in calories
   */
  static calculateTDEE(
    bmr: number,
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  ): number {
    Logger.log('CalorieCalculator', 'Calculating TDEE', { bmr, activityLevel });

    const activityMultipliers = {
      sedentary: 1.2, // Little or no exercise
      light: 1.375, // Light exercise 1-3 days/week
      moderate: 1.55, // Moderate exercise 3-5 days/week
      active: 1.725, // Hard exercise 6-7 days/week
      very_active: 1.9, // Very hard exercise & physical job
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    Logger.log('CalorieCalculator', 'TDEE calculated', { tdee });
    return tdee;
  }

  /**
   * Calculates target calories based on goal
   * @param tdee Total Daily Energy Expenditure
   * @param goal User's goal
   * @returns Target calories
   */
  static calculateTargetCalories(
    tdee: number,
    goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
  ): number {
    Logger.log('CalorieCalculator', 'Calculating target calories', { tdee, goal });

    let targetCalories: number;

    switch (goal) {
      case 'lose_weight':
        // 500 calorie deficit for ~0.5kg/week weight loss
        targetCalories = tdee - 500;
        break;
      case 'gain_weight':
        // 300 calorie surplus for healthy weight gain
        targetCalories = tdee + 300;
        break;
      case 'gain_muscle':
        // 500 calorie surplus with high protein for muscle gain
        targetCalories = tdee + 500;
        break;
      case 'maintain':
      default:
        targetCalories = tdee;
        break;
    }

    Logger.log('CalorieCalculator', 'Target calories calculated', { targetCalories });
    return Math.round(targetCalories);
  }

  /**
   * Calculates macro nutrient distribution
   * @param targetCalories Target daily calories
   * @param weight Body weight in kg
   * @param goal User's goal
   * @returns Macro nutrients in grams
   */
  static calculateMacros(
    targetCalories: number,
    weight: number,
    goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
  ): { protein: number; carbs: number; fat: number } {
    Logger.log('CalorieCalculator', 'Calculating macros', {
      targetCalories,
      weight,
      goal,
    });

    let proteinRatio: number;
    let fatRatio: number;
    let carbsRatio: number;

    switch (goal) {
      case 'lose_weight':
        // High protein to preserve muscle, moderate carbs, low fat
        proteinRatio = 0.35; // 35%
        fatRatio = 0.25; // 25%
        carbsRatio = 0.4; // 40%
        break;
      case 'gain_muscle':
        // Very high protein for muscle growth
        proteinRatio = 0.4; // 40%
        fatRatio = 0.25; // 25%
        carbsRatio = 0.35; // 35%
        break;
      case 'gain_weight':
        // Balanced with slightly higher carbs
        proteinRatio = 0.25; // 25%
        fatRatio = 0.25; // 25%
        carbsRatio = 0.5; // 50%
        break;
      case 'maintain':
      default:
        // Balanced macros
        proteinRatio = 0.3; // 30%
        fatRatio = 0.3; // 30%
        carbsRatio = 0.4; // 40%
        break;
    }

    // Calculate grams (protein = 4 cal/g, carbs = 4 cal/g, fat = 9 cal/g)
    const protein = Math.round((targetCalories * proteinRatio) / 4);
    const carbs = Math.round((targetCalories * carbsRatio) / 4);
    const fat = Math.round((targetCalories * fatRatio) / 9);

    const macros = { protein, carbs, fat };
    Logger.log('CalorieCalculator', 'Macros calculated', macros);
    return macros;
  }

  /**
   * Calculates complete calorie goals for a user
   * @param user User object with required fields
   * @returns CalorieGoals or null if user data is incomplete
   */
  static calculateUserGoals(user: User): CalorieGoals | null {
    try {
      Logger.log('CalorieCalculator', 'Calculating user goals', {
        userId: user.id,
        hasRequiredData: !!(user.weight && user.height && user.age && user.gender),
      });

      // Validate required fields
      if (!user.weight || !user.height || !user.age || !user.gender) {
        Logger.warn('CalorieCalculator', 'Missing required user data');
        return null;
      }

      // Set defaults if not provided
      const activityLevel = user.activityLevel || 'moderate';
      const goal = user.goal || 'maintain';

      // 1. Calculate BMR
      const bmr = this.calculateBMR(user.weight, user.height, user.age, user.gender);

      // 2. Calculate TDEE
      const tdee = this.calculateTDEE(bmr, activityLevel);

      // 3. Calculate target calories based on goal
      const targetCalories = this.calculateTargetCalories(tdee, goal);

      // 4. Calculate macros
      const macros = this.calculateMacros(targetCalories, user.weight, goal);

      const calorieGoals: CalorieGoals = {
        bmr,
        tdee,
        targetCalories,
        ...macros,
      };

      Logger.log('CalorieCalculator', 'User goals calculated', calorieGoals);
      return calorieGoals;
    } catch (error) {
      Logger.error('CalorieCalculator', 'Failed to calculate user goals', error);
      return null;
    }
  }

  /**
   * Gets recommended weight loss per week in kg
   * @param goal User's goal
   * @returns Weight change per week in kg
   */
  static getWeeklyWeightChange(goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'): number {
    switch (goal) {
      case 'lose_weight':
        return -0.5; // -0.5 kg per week (healthy weight loss)
      case 'gain_weight':
        return 0.3; // +0.3 kg per week
      case 'gain_muscle':
        return 0.5; // +0.5 kg per week (with muscle focus)
      case 'maintain':
      default:
        return 0;
    }
  }

  /**
   * Estimates time to reach target weight
   * @param currentWeight Current weight in kg
   * @param targetWeight Target weight in kg
   * @param goal User's goal
   * @returns Estimated weeks to reach goal
   */
  static estimateTimeToGoal(
    currentWeight: number,
    targetWeight: number,
    goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
  ): number {
    const weightDiff = Math.abs(targetWeight - currentWeight);
    const weeklyChange = Math.abs(this.getWeeklyWeightChange(goal));

    if (weeklyChange === 0) return 0;

    return Math.ceil(weightDiff / weeklyChange);
  }

  /**
   * Creates weight loss/gain plans for different timeframes
   * @param currentWeight Current weight in kg
   * @param targetWeight Target weight in kg
   * @param tdee Total Daily Energy Expenditure
   * @param gender User's gender
   * @returns Array of plans with different timeframes
   */
  static createWeightPlans(
    currentWeight: number,
    targetWeight: number,
    tdee: number,
    gender: 'male' | 'female' | 'other'
  ) {
    const weightDiff = targetWeight - currentWeight;
    const isLosingWeight = weightDiff < 0;
    const absoluteDiff = Math.abs(weightDiff);

    // Timeframes in months
    const timeframes = [3, 6, 9, 12];

    const plans = timeframes.map((months) => {
      // Convert months to weeks
      const weeks = months * 4;
      
      // Weekly weight change needed
      const weeklyChange = absoluteDiff / weeks;
      
      // 1 kg fat = ~7700 calories
      // Calculate daily calorie deficit/surplus needed
      const dailyCalorieChange = (weeklyChange * 7700) / 7;
      
      // Target daily calories
      const targetCalories = Math.round(tdee + (isLosingWeight ? -dailyCalorieChange : dailyCalorieChange));
      
      // Calculate macros for this calorie target
      const goal = isLosingWeight ? 'lose_weight' : 'gain_weight';
      const macros = this.calculateMacros(targetCalories, currentWeight, goal);
      
      // Determine if the plan is healthy (0.25kg - 1kg per week is safe)
      const isHealthy = weeklyChange >= 0.25 && weeklyChange <= 1.0;
      const isTooFast = weeklyChange > 1.0;
      const isTooSlow = weeklyChange < 0.25;
      
      // Recommendation
      let recommendation = '';
      if (isHealthy) {
        recommendation = '✅ Sağlıklı ve sürdürülebilir';
      } else if (isTooFast) {
        recommendation = '⚠️ Çok hızlı, sağlıksız olabilir';
      } else {
        recommendation = '🐢 Çok yavaş ilerliyor';
      }
      
      return {
        months,
        weeks,
        weeklyChange: Math.round(weeklyChange * 100) / 100,
        dailyCalories: targetCalories,
        calorieChange: Math.round(dailyCalorieChange),
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        isHealthy,
        isTooFast,
        isTooSlow,
        recommendation,
        endDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
      };
    });

    // Find recommended plan (prioritize healthy plans)
    const recommendedPlan = plans.find((p) => p.isHealthy) || plans[2]; // Default to 9 months

    return {
      plans,
      recommendedPlan,
      currentWeight,
      targetWeight,
      weightDiff,
      isLosingWeight,
    };
  }

  /**
   * Get a simple weight plan description
   * @param currentWeight Current weight in kg
   * @param targetWeight Target weight in kg
   * @returns Simple plan description
   */
  static getSimplePlan(currentWeight: number, targetWeight: number): string {
    const diff = Math.abs(targetWeight - currentWeight);
    const isLosing = targetWeight < currentWeight;
    
    if (diff === 0) {
      return 'Hedef kilonuz mevcut kilonuzla aynı';
    }
    
    // Healthy rate: 0.5kg per week
    const weeks = Math.ceil(diff / 0.5);
    const months = Math.ceil(weeks / 4);
    
    return `${isLosing ? 'Vermek' : 'Almak'} istediğiniz ${diff}kg için tahmini süre: ${months} ay`;
  }
}

