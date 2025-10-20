import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Colors from '../styles/colors';
import { Logger } from '../utils/logger';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  trackedDates?: Date[]; // Dates with logged meals
}

/**
 * Weekly Calendar Component
 * Swipeable calendar showing week view with tracking indicators
 */
const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onDateSelect,
  trackedDates = [],
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  /**
   * Gets array of dates for current week
   */
  const getWeekDates = (): Date[] => {
    const dates: Date[] = [];
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  /**
   * Checks if date is today
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Checks if date is selected
   */
  const isSelected = (date: Date): boolean => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  /**
   * Checks if date has tracked data
   */
  const hasTrackedData = (date: Date): boolean => {
    return trackedDates.some(
      (tracked) =>
        tracked.getDate() === date.getDate() &&
        tracked.getMonth() === date.getMonth() &&
        tracked.getFullYear() === date.getFullYear()
    );
  };

  /**
   * Handles date selection with animation
   */
  const handleDatePress = (date: Date) => {
    Logger.log('WeeklyCalendar', 'Date selected', { date });
    
    // Animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onDateSelect(date);
  };

  /**
   * Gets Turkish day name
   */
  const getDayName = (date: Date): string => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days[date.getDay() === 0 ? 6 : date.getDay() - 1];
  };

  const weekDates = getWeekDates();
  const monthYear = selectedDate.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Month/Year Header */}
      <View style={styles.header}>
        <Text style={styles.monthYear}>{monthYear}</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary.main }]} />
            <Text style={styles.legendText}>Kayıtlı</Text>
          </View>
        </View>
      </View>

      {/* Week Days */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
        bounces={true}
      >
        {weekDates.map((date, index) => {
          const selected = isSelected(date);
          const today = isToday(date);
          const tracked = hasTrackedData(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                selected && styles.dayCardSelected,
                today && !selected && styles.dayCardToday,
              ]}
              onPress={() => handleDatePress(date)}
              activeOpacity={0.7}
            >
              {/* Day Name */}
              <Text
                style={[
                  styles.dayName,
                  selected && styles.dayNameSelected,
                  today && !selected && styles.dayNameToday,
                ]}
              >
                {getDayName(date)}
              </Text>

              {/* Date Number */}
              <View
                style={[
                  styles.dateCircle,
                  selected && styles.dateCircleSelected,
                  today && !selected && styles.dateCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dateNumber,
                    selected && styles.dateNumberSelected,
                    today && !selected && styles.dateNumberToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>

              {/* Tracking Indicator */}
              {tracked && (
                <View style={styles.trackingIndicator}>
                  <View style={styles.trackingDot} />
                </View>
              )}

              {/* Today Badge */}
              {today && !selected && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Bugün</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  daysContainer: {
    gap: 8,
    paddingHorizontal: 2,
  },
  dayCard: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCardSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayCardToday: {
    borderColor: Colors.primary.light,
    backgroundColor: Colors.background.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dayNameSelected: {
    color: Colors.text.inverse,
  },
  dayNameToday: {
    color: Colors.primary.main,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dateCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateCircleToday: {
    backgroundColor: Colors.primary.light,
    opacity: 0.2,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  dateNumberSelected: {
    color: Colors.text.inverse,
  },
  dateNumberToday: {
    color: Colors.primary.main,
  },
  trackingIndicator: {
    position: 'absolute',
    bottom: 8,
  },
  trackingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.main,
  },
  todayBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.text.inverse,
  },
});

export default WeeklyCalendar;

