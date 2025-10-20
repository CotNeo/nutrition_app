import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { CalorieCalculator } from '../services/calorieCalculator';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle';

/**
 * Goal Setup Screen
 * Collects user data and calculates personalized nutrition goals
 */
const GoalSetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const [age, setAge] = useState(user?.age?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight?.toString() || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    user?.activityLevel || 'moderate'
  );
  const [goal, setGoal] = useState<Goal>(user?.goal || 'maintain');
  const [loading, setLoading] = useState(false);

  /**
   * Handles goal setup submission
   */
  const handleSubmit = async () => {
    try {
      Logger.log('GoalSetupScreen', 'Submit started');
      setLoading(true);

      // Validation
      if (!age || !weight || !height) {
        Alert.alert('Hata', 'Lütfen yaş, kilo ve boy bilgilerinizi girin');
        return;
      }

      const ageNum = parseInt(age);
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const targetWeightNum = targetWeight ? parseFloat(targetWeight) : undefined;

      if (ageNum < 15 || ageNum > 120) {
        Alert.alert('Hata', 'Lütfen geçerli bir yaş girin (15-120)');
        return;
      }

      if (weightNum < 30 || weightNum > 300) {
        Alert.alert('Hata', 'Lütfen geçerli bir kilo girin (30-300 kg)');
        return;
      }

      if (heightNum < 100 || heightNum > 250) {
        Alert.alert('Hata', 'Lütfen geçerli bir boy girin (100-250 cm)');
        return;
      }

      // Update user profile
      const updated = await updateUser({
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        gender,
        activityLevel,
        goal,
        targetWeight: targetWeightNum,
      });

      if (updated) {
        // Calculate goals
        const goals = CalorieCalculator.calculateUserGoals({
          ...user!,
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          gender,
          activityLevel,
          goal,
        });

        if (goals) {
          Logger.log('GoalSetupScreen', 'Goals calculated', goals);
          Alert.alert(
            'Başarılı! 🎉',
            `Günlük kalori hedefiniz: ${goals.targetCalories} kcal\n\nProtein: ${goals.protein}g\nKarbonhidrat: ${goals.carbs}g\nYağ: ${goals.fat}g`,
            [
              {
                text: 'Tamam',
                onPress: () => navigation.navigate('Home'),
              },
            ]
          );
        }
      }
    } catch (error) {
      Logger.error('GoalSetupScreen', 'Submit failed', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const activityLabels = {
    sedentary: 'Hareketsiz (Ofis işi)',
    light: 'Az Hareketli (Hafif egzersiz 1-3 gün/hafta)',
    moderate: 'Orta (Egzersiz 3-5 gün/hafta)',
    active: 'Aktif (Yoğun egzersiz 6-7 gün/hafta)',
    very_active: 'Çok Aktif (Fiziksel iş + egzersiz)',
  };

  const goalLabels = {
    lose_weight: '🔻 Kilo Vermek (-0.5kg/hafta)',
    maintain: '⚖️ Kilomu Korumak',
    gain_weight: '🔺 Kilo Almak (+0.3kg/hafta)',
    gain_muscle: '💪 Kas Kazanmak (+0.5kg/hafta)',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Hedeflerini Belirle</Text>
          <Text style={styles.subtitle}>Kişiselleştirilmiş beslenme planı oluşturalım</Text>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Yaş</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Cinsiyet</Text>
              <View style={styles.genderContainer}>
                {(['male', 'female'] as Gender[]).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                    onPress={() => setGender(g)}
                    disabled={loading}
                  >
                    <Text
                      style={[styles.genderText, gender === g && styles.genderTextActive]}
                    >
                      {g === 'male' ? '👨 Erkek' : '👩 Kadın'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Boy (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="175"
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>
          </View>
        </View>

        {/* Activity Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃 Aktivite Seviyesi</Text>
          {(Object.keys(activityLabels) as ActivityLevel[]).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                activityLevel === level && styles.optionButtonActive,
              ]}
              onPress={() => setActivityLevel(level)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.optionText,
                  activityLevel === level && styles.optionTextActive,
                ]}
              >
                {activityLabels[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Hedefin</Text>
          {(Object.keys(goalLabels) as Goal[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionButton, goal === g && styles.optionButtonActive]}
              onPress={() => setGoal(g)}
              disabled={loading}
            >
              <Text style={[styles.optionText, goal === g && styles.optionTextActive]}>
                {goalLabels[g]}
              </Text>
            </TouchableOpacity>
          ))}

          {(goal === 'lose_weight' || goal === 'gain_weight') && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hedef Kilo (opsiyonel)</Text>
              <TextInput
                style={styles.input}
                placeholder="65"
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          )}
        </View>

        <Button
          title={loading ? 'Hesaplanıyor...' : 'Hedeflerimi Kaydet'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  genderButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  genderTextActive: {
    color: Colors.text.inverse,
  },
  optionButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.background.primary,
    marginBottom: 12,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main,
    shadowColor: Colors.primary.main,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  optionTextActive: {
    color: Colors.text.inverse,
    fontWeight: '800',
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 32,
  },
});

export default GoalSetupScreen;

