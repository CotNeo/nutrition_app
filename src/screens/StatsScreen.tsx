import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { StatsService } from '../services/statsService';
import { CalorieCalculator } from '../services/calorieCalculator';
import { WeightTrackingService, WeightEntry } from '../services/weightTrackingService';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

const screenWidth = Dimensions.get('window').width;

type TimePeriod = 'week' | 'month';

/**
 * Statistics Screen
 * Displays charts and reports for nutrition tracking
 */
const StatsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [trend, setTrend] = useState<any>(null);
  const [mealDistribution, setMealDistribution] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [weightStats, setWeightStats] = useState<any>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    loadStats();
  }, [timePeriod]);

  /**
   * Load all statistics
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      Logger.log('StatsScreen', 'Loading stats', { timePeriod });

      // Load weekly stats
      const weekly = await StatsService.getWeeklyStats();
      setWeeklyStats(weekly);

      // Load monthly stats
      const monthly = await StatsService.getMonthlyStats();
      setMonthlyStats(monthly);

      // Load daily data for charts
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - (timePeriod === 'week' ? 7 : 30));

      const daily = await StatsService.getDailyNutritionRange(startDate, today);
      setDailyData(daily);

      // Load trend
      const trendData = await StatsService.getCalorieTrend(timePeriod === 'week' ? 7 : 30);
      setTrend(trendData);

      // Load meal distribution
      const distribution = await StatsService.getMealTypeDistribution(
        timePeriod === 'week' ? 7 : 30
      );
      setMealDistribution(distribution);

      // Load weight history
      const weightStartDate = new Date(today);
      weightStartDate.setDate(weightStartDate.getDate() - (timePeriod === 'week' ? 7 : 30));
      const weights = await WeightTrackingService.getWeightHistoryRange(
        weightStartDate,
        today
      );
      setWeightHistory(weights);

      // Load weight stats
      const wStats = await WeightTrackingService.getWeightChangeStats();
      setWeightStats(wStats);

      Logger.log('StatsScreen', 'Stats loaded successfully');
    } catch (error) {
      Logger.error('StatsScreen', 'Error loading stats', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  /**
   * Get chart config
   */
  const chartConfig = {
    backgroundColor: Colors.primary.main,
    backgroundGradientFrom: Colors.primary.main,
    backgroundGradientTo: Colors.primary.dark,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#fff',
    },
  };

  /**
   * Prepare line chart data (Calorie trend)
   */
  const getLineChartData = () => {
    if (!dailyData || dailyData.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const labels = dailyData.map((day) =>
      new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    );

    return {
      labels: labels.length > 7 ? labels.filter((_, i) => i % 4 === 0) : labels,
      datasets: [
        {
          data: dailyData.map((day) => day.calories),
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  /**
   * Prepare bar chart data (Daily calories comparison)
   */
  const getBarChartData = () => {
    if (!dailyData || dailyData.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const last7Days = dailyData.slice(-7);
    const labels = last7Days.map((day) =>
      new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })
    );

    return {
      labels,
      datasets: [
        {
          data: last7Days.map((day) => day.calories),
        },
      ],
    };
  };

  /**
   * Handle weight entry submission
   */
  const handleAddWeight = async () => {
    try {
      const weightValue = parseFloat(newWeight);

      if (isNaN(weightValue) || weightValue < 30 || weightValue > 300) {
        return;
      }

      Logger.log('StatsScreen', 'Adding weight entry', { weight: weightValue });

      const success = await WeightTrackingService.addWeightEntry(weightValue);

      if (success) {
        setShowWeightModal(false);
        setNewWeight('');
        await loadStats();
        
        // Update user's current weight in profile
        await updateUser({ weight: weightValue });
      }
    } catch (error) {
      Logger.error('StatsScreen', 'Error adding weight', error);
    }
  };

  /**
   * Prepare weight chart data
   */
  const getWeightChartData = () => {
    if (!weightHistory || weightHistory.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const labels = weightHistory.map((entry) =>
      new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    );

    return {
      labels: labels.length > 7 ? labels.filter((_, i) => i % 2 === 0) : labels,
      datasets: [
        {
          data: weightHistory.map((entry) => entry.weight),
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  /**
   * Prepare pie chart data (Macro distribution)
   */
  const getPieChartData = () => {
    const stats = timePeriod === 'week' ? weeklyStats : monthlyStats;
    if (!stats) {
      return [];
    }

    const distribution = StatsService.getMacroDistribution(
      stats.totalProtein,
      stats.totalCarbs,
      stats.totalFat
    );

    return [
      {
        name: `Protein ${distribution.proteinPercent}%`,
        population: stats.totalProtein * 4, // Convert to calories
        color: Colors.secondary.main,
        legendFontColor: Colors.text.primary,
        legendFontSize: 14,
      },
      {
        name: `Karb ${distribution.carbsPercent}%`,
        population: stats.totalCarbs * 4,
        color: Colors.accent.orange,
        legendFontColor: Colors.text.primary,
        legendFontSize: 14,
      },
      {
        name: `Yağ ${distribution.fatPercent}%`,
        population: stats.totalFat * 9,
        color: Colors.accent.purple,
        legendFontColor: Colors.text.primary,
        legendFontSize: 14,
      },
    ];
  };

  const currentStats = timePeriod === 'week' ? weeklyStats : monthlyStats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.main]} />
        }
      >
        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, timePeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setTimePeriod('week')}
          >
            <Text style={[styles.periodText, timePeriod === 'week' && styles.periodTextActive]}>
              7 Gün
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, timePeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setTimePeriod('month')}
          >
            <Text style={[styles.periodText, timePeriod === 'month' && styles.periodTextActive]}>
              30 Gün
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        {currentStats && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>📊 Özet</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Ortalama Kalori</Text>
                <Text style={styles.summaryValue}>{currentStats.avgCalories}</Text>
                <Text style={styles.summaryUnit}>kcal/gün</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Toplam Öğün</Text>
                <Text style={styles.summaryValue}>{currentStats.totalMeals}</Text>
                <Text style={styles.summaryUnit}>öğün</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Takip Günü</Text>
                <Text style={styles.summaryValue}>{currentStats.daysTracked}</Text>
                <Text style={styles.summaryUnit}>gün</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Toplam Kalori</Text>
                <Text style={styles.summaryValue}>
                  {(currentStats.totalCalories / 1000).toFixed(1)}k
                </Text>
                <Text style={styles.summaryUnit}>kcal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weight Tracking Chart */}
        {weightHistory.length > 0 && (
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>⚖️ Kilo Takibi</Text>
              <TouchableOpacity
                style={styles.addWeightButton}
                onPress={() => setShowWeightModal(true)}
              >
                <Text style={styles.addWeightButtonText}>+ Kilo Ekle</Text>
              </TouchableOpacity>
            </View>
            {weightStats && (
              <View style={styles.weightStatsRow}>
                <View style={styles.weightStatItem}>
                  <Text style={styles.weightStatLabel}>Mevcut</Text>
                  <Text style={styles.weightStatValue}>
                    {weightStats.currentWeight}kg
                  </Text>
                </View>
                <View style={styles.weightStatItem}>
                  <Text style={styles.weightStatLabel}>Değişim</Text>
                  <Text
                    style={[
                      styles.weightStatValue,
                      weightStats.totalChange > 0 && styles.weightIncreased,
                      weightStats.totalChange < 0 && styles.weightDecreased,
                    ]}
                  >
                    {weightStats.totalChange > 0 ? '+' : ''}
                    {weightStats.totalChange}kg
                  </Text>
                </View>
                {user?.targetWeight && (
                  <View style={styles.weightStatItem}>
                    <Text style={styles.weightStatLabel}>Hedef</Text>
                    <Text style={styles.weightStatValue}>{user.targetWeight}kg</Text>
                  </View>
                )}
              </View>
            )}
            <LineChart
              data={getWeightChartData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: Colors.accent.purple,
                backgroundGradientTo: '#6B21A8',
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              yAxisSuffix="kg"
            />
          </View>
        )}

        {/* Weight Entry Button (when no history) */}
        {weightHistory.length === 0 && !loading && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>⚖️ Kilo Takibi</Text>
            <View style={styles.emptyWeightCard}>
              <Text style={styles.emptyWeightEmoji}>⚖️</Text>
              <Text style={styles.emptyWeightTitle}>
                {user?.weight ? 'Güncel Kilonuzu Girin' : 'Kilo Geçmişiniz Boş'}
              </Text>
              <Text style={styles.emptyWeightText}>
                {user?.weight 
                  ? `Başlangıç kilonuz: ${user.weight}kg\nGüncel kilonuzu girerek ilerlemenizi takip edin`
                  : 'Kilonuzu düzenli girerek ilerlemenizi takip edin'}
              </Text>
              <TouchableOpacity
                style={styles.emptyWeightButton}
                onPress={() => {
                  if (user?.weight) {
                    setNewWeight(user.weight.toString());
                  }
                  setShowWeightModal(true);
                }}
              >
                <Text style={styles.emptyWeightButtonText}>
                  ⚖️ {user?.weight ? 'Güncel Kilo Gir' : 'İlk Kilonu Ekle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Calorie Trend Chart */}
        {dailyData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>📈 Kalori Trendi</Text>
            {trend && (
              <Text style={styles.trendText}>
                {trend.trend === 'increasing' && '📈 Artış eğilimi'}
                {trend.trend === 'decreasing' && '📉 Azalış eğilimi'}
                {trend.trend === 'stable' && '➡️ Stabil seyrediyor'}
                {trend.change !== 0 && ` (${trend.change > 0 ? '+' : ''}${trend.change} kcal/gün)`}
              </Text>
            )}
            <LineChart
              data={getLineChartData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
            />
          </View>
        )}

        {/* Daily Calories Bar Chart */}
        {dailyData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>📊 Günlük Kalori</Text>
            <BarChart
              data={getBarChartData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: Colors.secondary.main,
                backgroundGradientTo: Colors.secondary.dark,
              }}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              fromZero={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        )}

        {/* Macro Distribution Pie Chart */}
        {currentStats && currentStats.totalCalories > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>🥗 Makro Besin Dağılımı</Text>
            <PieChart
              data={getPieChartData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
              style={styles.chart}
            />
          </View>
        )}

        {/* Meal Type Distribution */}
        {mealDistribution && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>🍽️ Öğün Dağılımı</Text>
            <View style={styles.mealDistGrid}>
              <View style={styles.mealDistCard}>
                <Text style={styles.mealDistEmoji}>🌅</Text>
                <Text style={styles.mealDistValue}>{mealDistribution.breakfast}</Text>
                <Text style={styles.mealDistLabel}>Kahvaltı</Text>
              </View>
              <View style={styles.mealDistCard}>
                <Text style={styles.mealDistEmoji}>☀️</Text>
                <Text style={styles.mealDistValue}>{mealDistribution.lunch}</Text>
                <Text style={styles.mealDistLabel}>Öğle</Text>
              </View>
              <View style={styles.mealDistCard}>
                <Text style={styles.mealDistEmoji}>🌙</Text>
                <Text style={styles.mealDistValue}>{mealDistribution.dinner}</Text>
                <Text style={styles.mealDistLabel}>Akşam</Text>
              </View>
              <View style={styles.mealDistCard}>
                <Text style={styles.mealDistEmoji}>🍎</Text>
                <Text style={styles.mealDistValue}>{mealDistribution.snack}</Text>
                <Text style={styles.mealDistLabel}>Atıştırma</Text>
              </View>
            </View>
          </View>
        )}

        {/* Macro Breakdown */}
        {currentStats && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>🔬 Makro Besin Detayları</Text>
            <View style={styles.macroBreakdown}>
              <View style={styles.macroBreakdownItem}>
                <View style={styles.macroBreakdownHeader}>
                  <View style={[styles.macroColorDot, { backgroundColor: Colors.secondary.main }]} />
                  <Text style={styles.macroBreakdownLabel}>Protein</Text>
                </View>
                <Text style={styles.macroBreakdownValue}>{currentStats.totalProtein}g</Text>
                <Text style={styles.macroBreakdownAvg}>
                  Ort: {Math.round(currentStats.totalProtein / (currentStats.daysTracked || 1))}g/gün
                </Text>
              </View>

              <View style={styles.macroBreakdownItem}>
                <View style={styles.macroBreakdownHeader}>
                  <View style={[styles.macroColorDot, { backgroundColor: Colors.accent.orange }]} />
                  <Text style={styles.macroBreakdownLabel}>Karbonhidrat</Text>
                </View>
                <Text style={styles.macroBreakdownValue}>{currentStats.totalCarbs}g</Text>
                <Text style={styles.macroBreakdownAvg}>
                  Ort: {Math.round(currentStats.totalCarbs / (currentStats.daysTracked || 1))}g/gün
                </Text>
              </View>

              <View style={styles.macroBreakdownItem}>
                <View style={styles.macroBreakdownHeader}>
                  <View style={[styles.macroColorDot, { backgroundColor: Colors.accent.purple }]} />
                  <Text style={styles.macroBreakdownLabel}>Yağ</Text>
                </View>
                <Text style={styles.macroBreakdownValue}>{currentStats.totalFat}g</Text>
                <Text style={styles.macroBreakdownAvg}>
                  Ort: {Math.round(currentStats.totalFat / (currentStats.daysTracked || 1))}g/gün
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* No Data State */}
        {!loading && dailyData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Henüz Veri Yok</Text>
            <Text style={styles.emptyText}>
              Öğün ekleyerek istatistiklerinizi görmeye başlayın
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('MealAdd')}
            >
              <Text style={styles.emptyButtonText}>🍽️ İlk Öğünü Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Weight Modal */}
      {showWeightModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚖️ Kilonu Gir</Text>
            <Text style={styles.modalSubtitle}>
              {new Date().toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>

            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                placeholder={user?.weight ? user.weight.toString() : "70.5"}
                placeholderTextColor="#9CA3AF"
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>

            <View style={styles.weightHints}>
              {user?.weight && weightHistory.length === 0 && (
                <Text style={styles.startWeightHint}>
                  📊 Başlangıç kilonuz: {user.weight}kg
                </Text>
              )}
              {user?.targetWeight && (
                <Text style={styles.targetWeightHint}>
                  🎯 Hedef kilonuz: {user.targetWeight}kg
                </Text>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowWeightModal(false);
                  setNewWeight('');
                }}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleAddWeight}
                disabled={!newWeight}
              >
                <Text style={styles.modalConfirmText}>✓ Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  periodText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  summaryUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.tertiary,
  },
  chartSection: {
    marginBottom: 24,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  mealDistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealDistCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  mealDistEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  mealDistValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  mealDistLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  macroBreakdown: {
    gap: 12,
  },
  macroBreakdownItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  macroBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  macroBreakdownLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  macroBreakdownValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  macroBreakdownAvg: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addWeightButton: {
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addWeightButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  weightStatItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  weightStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  weightStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  weightIncreased: {
    color: Colors.accent.orange,
  },
  weightDecreased: {
    color: Colors.primary.main,
  },
  emptyWeightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  emptyWeightEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyWeightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyWeightText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyWeightButton: {
    backgroundColor: Colors.accent.purple,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyWeightButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.accent.purple,
  },
  weightInput: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.accent.purple,
    textAlign: 'center',
    minWidth: 120,
  },
  weightUnit: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  weightHints: {
    marginBottom: 20,
    gap: 8,
  },
  startWeightHint: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary.main,
    textAlign: 'center',
    backgroundColor: Colors.background.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  targetWeightHint: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent.purple,
    textAlign: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.neutral[200],
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent.purple,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default StatsScreen;

