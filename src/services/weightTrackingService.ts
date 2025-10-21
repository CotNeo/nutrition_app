import { StorageService, STORAGE_KEYS } from '../utils/storage';
import { Logger } from '../utils/logger';

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  date: Date;
  note?: string;
}

/**
 * Weight Tracking Service
 * Manages user's weight history and tracking
 */
export class WeightTrackingService {
  /**
   * Adds a new weight entry
   * @param weight Weight in kg
   * @param date Date of measurement
   * @param note Optional note
   * @returns Promise<boolean> Success status
   */
  static async addWeightEntry(
    weight: number,
    date: Date = new Date(),
    note?: string
  ): Promise<boolean> {
    try {
      Logger.log('WeightTrackingService', 'Adding weight entry', { weight, date });

      // Validate weight
      if (weight < 30 || weight > 300) {
        Logger.error('WeightTrackingService', 'Invalid weight value');
        return false;
      }

      // Get existing entries
      const entries = await this.getWeightHistory();

      // Create new entry
      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        weight,
        date,
        note,
      };

      // Add to beginning of array (most recent first)
      const updatedEntries = [newEntry, ...entries];

      // Save to storage
      const success = await StorageService.setItem(STORAGE_KEYS.WEIGHT_HISTORY, updatedEntries);

      if (success) {
        Logger.log('WeightTrackingService', 'Weight entry added successfully');
      }

      return success;
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error adding weight entry', error);
      return false;
    }
  }

  /**
   * Gets all weight history entries
   * @returns Promise<WeightEntry[]> Array of weight entries
   */
  static async getWeightHistory(): Promise<WeightEntry[]> {
    try {
      Logger.log('WeightTrackingService', 'Getting weight history');
      const entries = await StorageService.getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_HISTORY);
      Logger.log('WeightTrackingService', `Found ${entries?.length || 0} weight entries`);
      return entries || [];
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error getting weight history', error);
      return [];
    }
  }

  /**
   * Gets weight history for a specific date range
   * @param startDate Start date
   * @param endDate End date
   * @returns Promise<WeightEntry[]> Filtered weight entries
   */
  static async getWeightHistoryRange(
    startDate: Date,
    endDate: Date
  ): Promise<WeightEntry[]> {
    try {
      Logger.log('WeightTrackingService', 'Getting weight history range', {
        startDate,
        endDate,
      });

      const entries = await this.getWeightHistory();
      
      const filtered = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });

      // Sort by date ascending
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      Logger.log('WeightTrackingService', `Found ${filtered.length} entries in range`);
      return filtered;
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error getting weight history range', error);
      return [];
    }
  }

  /**
   * Gets latest weight entry
   * @returns Promise<WeightEntry | null>
   */
  static async getLatestWeight(): Promise<WeightEntry | null> {
    try {
      const entries = await this.getWeightHistory();
      
      if (entries.length === 0) return null;

      // Sort by date descending and get first
      const sorted = entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return sorted[0];
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error getting latest weight', error);
      return null;
    }
  }

  /**
   * Deletes a weight entry
   * @param entryId ID of entry to delete
   * @returns Promise<boolean> Success status
   */
  static async deleteWeightEntry(entryId: string): Promise<boolean> {
    try {
      Logger.log('WeightTrackingService', 'Deleting weight entry', { entryId });

      const entries = await this.getWeightHistory();
      const updatedEntries = entries.filter((entry) => entry.id !== entryId);

      const success = await StorageService.setItem(STORAGE_KEYS.WEIGHT_HISTORY, updatedEntries);

      if (success) {
        Logger.log('WeightTrackingService', 'Weight entry deleted successfully');
      }

      return success;
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error deleting weight entry', error);
      return false;
    }
  }

  /**
   * Gets weight change statistics
   * @returns Weight change stats
   */
  static async getWeightChangeStats(): Promise<{
    currentWeight: number | null;
    startWeight: number | null;
    totalChange: number;
    changePercentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    try {
      const entries = await this.getWeightHistory();

      if (entries.length === 0) {
        return {
          currentWeight: null,
          startWeight: null,
          totalChange: 0,
          changePercentage: 0,
          trend: 'stable',
        };
      }

      // Sort by date
      const sorted = entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const startWeight = sorted[0].weight;
      const currentWeight = sorted[sorted.length - 1].weight;
      const totalChange = currentWeight - startWeight;
      const changePercentage = (totalChange / startWeight) * 100;

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (totalChange > 0.5) {
        trend = 'increasing';
      } else if (totalChange < -0.5) {
        trend = 'decreasing';
      }

      Logger.log('WeightTrackingService', 'Weight change stats calculated', {
        currentWeight,
        startWeight,
        totalChange,
      });

      return {
        currentWeight,
        startWeight,
        totalChange: Math.round(totalChange * 10) / 10,
        changePercentage: Math.round(changePercentage * 10) / 10,
        trend,
      };
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error calculating weight stats', error);
      return {
        currentWeight: null,
        startWeight: null,
        totalChange: 0,
        changePercentage: 0,
        trend: 'stable',
      };
    }
  }

  /**
   * Gets average weekly weight change
   * @returns Promise<number> Average weekly change in kg
   */
  static async getAverageWeeklyChange(): Promise<number> {
    try {
      const entries = await this.getWeightHistory();

      if (entries.length < 2) return 0;

      // Sort by date
      const sorted = entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const firstEntry = sorted[0];
      const lastEntry = sorted[sorted.length - 1];

      const weightDiff = lastEntry.weight - firstEntry.weight;
      const timeDiff = new Date(lastEntry.date).getTime() - new Date(firstEntry.date).getTime();
      const weeks = timeDiff / (7 * 24 * 60 * 60 * 1000);

      if (weeks === 0) return 0;

      const weeklyChange = weightDiff / weeks;
      return Math.round(weeklyChange * 100) / 100;
    } catch (error) {
      Logger.error('WeightTrackingService', 'Error calculating weekly change', error);
      return 0;
    }
  }
}

