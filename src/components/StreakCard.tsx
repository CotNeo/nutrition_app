import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../styles/colors';

interface StreakCardProps {
  streak: number;
  longestStreak?: number;
  hasTodayMeal?: boolean;
}

/**
 * Streak Card Component
 * Shows user's daily tracking streak with motivation and animations
 */
const StreakCard: React.FC<StreakCardProps> = ({ 
  streak, 
  longestStreak = 0,
  hasTodayMeal = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fireScaleAnim = useRef(new Animated.Value(0)).current;

  /**
   * Pulse animation for streak number
   */
  useEffect(() => {
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [streak]);

  /**
   * Fire animation on mount
   */
  useEffect(() => {
    Animated.stagger(
      100,
      Array(Math.min(streak, 7))
        .fill(0)
        .map(() =>
          Animated.spring(fireScaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          })
        )
    ).start();
  }, [streak]);
  const getMotivation = () => {
    if (streak === 0) {
      return hasTodayMeal ? 'İlk günü tamamladın! 🎉' : 'İlk öğününü ekle! 💪';
    }
    if (streak === 1) return 'Harika başlangıç! Devam! 🌱';
    if (streak === 3) return '3 gün üst üste! Süper! ⭐';
    if (streak === 7) return '1 hafta! Muhteşemsin! 🔥';
    if (streak === 14) return '2 hafta! İnanılmaz! 💎';
    if (streak === 30) return '1 ay! Efsanesin! 🏆';
    if (streak === 100) return '100 GÜN! LEGEND! 👑';
    if (streak < 7) return 'Harika gidiyorsun! 🌟';
    if (streak < 30) return 'İnanılmaz! Devam et! 🔥';
    if (streak < 100) return 'Efsane bir seri! 🏆';
    return 'Unutulmaz bir başarı! 👑💎';
  };

  const getEmoji = () => {
    if (streak === 0) return '🆕';
    if (streak < 7) return '⭐';
    if (streak < 14) return '🔥';
    if (streak < 30) return '💪';
    if (streak < 100) return '🏆';
    return '👑';
  };

  const getCardColor = () => {
    if (streak === 0) return Colors.neutral[400];
    if (streak < 7) return Colors.accent.yellow;
    if (streak < 30) return Colors.accent.orange;
    return Colors.accent.pink;
  };

  return (
    <View style={[styles.card, { borderColor: getCardColor() }]}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale: pulseAnim }] }]}>
          {getEmoji()}
        </Animated.Text>
        <View style={styles.textContainer}>
          <View style={styles.streakHeader}>
            <Animated.Text style={[styles.streakNumber, { transform: [{ scale: pulseAnim }] }]}>
              {streak}
            </Animated.Text>
            <Text style={styles.streakUnit}>Gün</Text>
          </View>
          <Text style={styles.label}>
            {streak === 0 ? 'Seriyi Başlat' : 'Seri Devam Ediyor'}
          </Text>
          <Text style={styles.motivation}>{getMotivation()}</Text>
          {longestStreak > 0 && longestStreak > streak && (
            <Text style={styles.record}>
              🏅 En İyi: {longestStreak} gün
            </Text>
          )}
        </View>
      </View>
      
      {/* Fire indicators */}
      {streak > 0 && (
        <View style={styles.fireContainer}>
          {[...Array(Math.min(streak, 7))].map((_, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.fireMini,
                {
                  transform: [{ scale: fireScaleAnim }],
                  opacity: fireScaleAnim,
                },
              ]}
            >
              🔥
            </Animated.Text>
          ))}
          {streak > 7 && (
            <Text style={styles.moreIndicator}>+{streak - 7}</Text>
          )}
        </View>
      )}

      {/* Progress to next milestone */}
      {streak > 0 && (
        <View style={styles.milestoneProgress}>
          <Text style={styles.milestoneText}>
            {getNextMilestone(streak)}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Gets next milestone message
 */
const getNextMilestone = (streak: number): string => {
  if (streak < 3) return `${3 - streak} güne 3 günlük seri! ⭐`;
  if (streak < 7) return `${7 - streak} güne 1 hafta! 🔥`;
  if (streak < 14) return `${14 - streak} güne 2 hafta! 💪`;
  if (streak < 30) return `${30 - streak} güne 1 ay! 🏆`;
  if (streak < 60) return `${60 - streak} güne 2 ay! 💎`;
  if (streak < 100) return `${100 - streak} güne 100 gün! 👑`;
  return 'Efsane seviyedesin! 👑';
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: Colors.accent.orange,
    shadowColor: Colors.accent.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 48,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.accent.orange,
    letterSpacing: -1.5,
    marginRight: 6,
  },
  streakUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  motivation: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  record: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent.yellow,
    marginTop: 4,
  },
  fireContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  fireMini: {
    fontSize: 18,
  },
  moreIndicator: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accent.orange,
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  milestoneProgress: {
    backgroundColor: Colors.background.secondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default StreakCard;

