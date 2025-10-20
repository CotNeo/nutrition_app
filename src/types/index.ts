/**
 * Common types and interfaces used across the application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle';
  targetWeight?: number; // in kg (for weight goals)
}

export interface CalorieGoals {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  targetCalories: number; // Based on goal
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

