import React, { useState, useEffect } from 'react';
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
import { WeightTrackingService } from '../services/weightTrackingService';
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
  const { user, updateUser, signOut } = useAuth();

  // Check if this is first time setup
  const isFirstTimeSetup = !user?.age || !user?.weight || !user?.height || !user?.gender || !user?.goal;

  const [name, setName] = useState(user?.name || '');
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
  const [showPlans, setShowPlans] = useState(false);
  const [weightPlans, setWeightPlans] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  /**
   * Update form fields when user data changes (e.g., after Apple Sign-In)
   */
  useEffect(() => {
    if (user) {
      Logger.log('GoalSetupScreen', 'User data updated, refreshing form fields', {
        userName: user.name,
        userAge: user.age,
        userWeight: user.weight,
        userHeight: user.height,
        userGender: user.gender,
        userGoal: user.goal
      });
      
      // Update form fields with latest user data
      setName(user.name || '');
      setAge(user.age?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setHeight(user.height?.toString() || '');
      setTargetWeight(user.targetWeight?.toString() || '');
      setGender(user.gender || 'male');
      setActivityLevel(user.activityLevel || 'moderate');
      setGoal(user.goal || 'maintain');
    }
  }, [user]);

  /**
   * Auto-fill target weight when goal changes to maintain
   */
  useEffect(() => {
    if (goal === 'maintain' && weight && !targetWeight) {
      setTargetWeight(weight);
    }
  }, [goal, weight, targetWeight]);

  /**
   * Calculate weight plans when target weight changes
   */
  const calculatePlans = () => {
    if (!weight || !height || !age || !targetWeight) return;
    
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);
    const targetWeightNum = parseFloat(targetWeight);

    if (weightNum === targetWeightNum) {
      setShowPlans(false);
      setWeightPlans(null);
      return;
    }

    // Calculate BMR and TDEE
    const bmr = CalorieCalculator.calculateBMR(weightNum, heightNum, ageNum, gender);
    const tdee = CalorieCalculator.calculateTDEE(bmr, activityLevel);

    // Create plans
    const plans = CalorieCalculator.createWeightPlans(
      weightNum,
      targetWeightNum,
      tdee,
      gender
    );

    setWeightPlans(plans);
    setShowPlans(true);
    
    // Auto-select recommended plan
    const recommendedIndex = plans.plans.findIndex((p: any) => p.months === plans.recommendedPlan.months);
    setSelectedPlan(recommendedIndex);

    Logger.log('GoalSetupScreen', 'Weight plans calculated', plans);
  };

  /**
   * Handles goal setup submission
   */
  const handleSubmit = async () => {
    try {
      Logger.log('GoalSetupScreen', 'Submit started');
      setLoading(true);

      // Validation
      if (!name.trim()) {
        Alert.alert('Hata', 'Lütfen adınızı girin');
        return;
      }

      if (!age || !weight || !height) {
        Alert.alert('Hata', 'Lütfen yaş, kilo ve boy bilgilerinizi girin');
        return;
      }

      // Check if target weight is required
      if (!targetWeight) {
        Alert.alert('Hata', 'Lütfen hedef kilonuzu girin');
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
        name: name.trim(),
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        gender,
        activityLevel,
        goal,
        targetWeight: targetWeightNum,
      });

      // If this is first time setup, add initial weight to history
      if (updated && isFirstTimeSetup) {
        Logger.log('GoalSetupScreen', 'Adding initial weight to history');
        await WeightTrackingService.addWeightEntry(
          weightNum,
          new Date(),
          'İlk kilo kaydı'
        );
      }

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
          
          // If user selected a weight plan, use its calories
          let finalGoals = goals;
          let planMessage = '';
          
          if (weightPlans && selectedPlan !== null) {
            const plan = weightPlans.plans[selectedPlan];
            finalGoals = {
              ...goals,
              targetCalories: plan.dailyCalories,
              protein: plan.protein,
              carbs: plan.carbs,
              fat: plan.fat,
            };
            planMessage = `\n📅 Seçilen Plan: ${plan.months} ay\n📊 Haftalık değişim: ${weightPlans.isLosingWeight ? '-' : '+'}${plan.weeklyChange}kg\n\n`;
          }
          
          const successMessage = isFirstTimeSetup 
            ? 'Hoş geldiniz! 🎉\n\nHedefleriniz başarıyla kaydedildi.\n\n'
            : 'Başarılı! 🎉\n\nHedefleriniz güncellendi.\n\n';
          
          Alert.alert(
            isFirstTimeSetup ? 'Kurulum Tamamlandı' : 'Güncelleme Başarılı',
            `${successMessage}${planMessage}Günlük kalori hedefiniz: ${finalGoals.targetCalories} kcal\n\nProtein: ${finalGoals.protein}g\nKarbonhidrat: ${finalGoals.carbs}g\nYağ: ${finalGoals.fat}g`,
            [
              {
                text: isFirstTimeSetup ? 'Başlayalım!' : 'Tamam',
                onPress: () => {
                  if (isFirstTimeSetup) {
                    // First time setup - navigate to Home and can't go back
                    Logger.log('GoalSetupScreen', 'First time setup complete, navigating to Home');
                    navigation.replace('Home');
                  } else {
                    // Updating existing goals - go back to previous screen
                    Logger.log('GoalSetupScreen', 'Goals updated, going back');
                    navigation.goBack();
                  }
                },
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
          <Text style={styles.title}>
            {isFirstTimeSetup ? '🎯 Hedeflerini Belirle' : 'Hedeflerini Güncelle'}
          </Text>
          <Text style={styles.subtitle}>
            {isFirstTimeSetup 
              ? 'Kişiselleştirilmiş beslenme planı oluşturalım'
              : 'Hedeflerini güncelleyerek planını değiştirebilirsin'}
          </Text>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              placeholder={name ? "Ad Soyad" : "Apple ile giriş yaptınız, lütfen ad soyadınızı girin"}
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              editable={!loading}
              maxLength={50}
            />
            {!name && (
              <Text style={styles.helpText}>
                💡 Apple Sign-In'den ad soyad bilgisi alınamadı. Lütfen kendi isminizi girin.
              </Text>
            )}
          </View>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hedef Kilo (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder={goal === 'maintain' ? "Hedef kilonuz" : "65"}
              value={targetWeight}
              onChangeText={(text) => {
                setTargetWeight(text);
                setShowPlans(false); // Reset plans when target weight changes
              }}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            {goal === 'maintain' && (
              <Text style={styles.helpText}>
                💡 Kilo korumak için hedef kilonuz mevcut kilonuzla aynı olmalı
              </Text>
            )}
            {targetWeight && weight && (goal === 'lose_weight' || goal === 'gain_weight') && (
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={calculatePlans}
                disabled={!age || !height || !gender}
              >
                <Text style={styles.calculateButtonText}>
                  📊 Planları Hesapla
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Weight Plans Section */}
        {showPlans && weightPlans && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {weightPlans.isLosingWeight ? '📉' : '📈'} Hedef Kilo Planları
            </Text>
            <Text style={styles.planSubtitle}>
              {weightPlans.currentWeight}kg → {weightPlans.targetWeight}kg ({Math.abs(weightPlans.weightDiff)}kg {weightPlans.isLosingWeight ? 'azalacak' : 'artacak'})
            </Text>

            {weightPlans.plans.map((plan: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.planCard,
                  selectedPlan === index && styles.planCardSelected,
                  plan.isHealthy && styles.planCardHealthy,
                  plan.isTooFast && styles.planCardWarning,
                ]}
                onPress={() => setSelectedPlan(index)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>
                    {plan.months} Aylık Plan
                    {plan.isHealthy && ' ⭐'}
                  </Text>
                  <Text style={styles.planRecommendation}>{plan.recommendation}</Text>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.planRow}>
                    <Text style={styles.planLabel}>Haftalık değişim:</Text>
                    <Text style={styles.planValue}>
                      {weightPlans.isLosingWeight ? '-' : '+'}{plan.weeklyChange}kg
                    </Text>
                  </View>

                  <View style={styles.planRow}>
                    <Text style={styles.planLabel}>Günlük kalori:</Text>
                    <Text style={styles.planValue}>{plan.dailyCalories} kcal</Text>
                  </View>

                  <View style={styles.planRow}>
                    <Text style={styles.planLabel}>Kalori farkı:</Text>
                    <Text style={styles.planValue}>
                      {weightPlans.isLosingWeight ? '' : '+'}{plan.calorieChange} kcal/gün
                    </Text>
                  </View>

                  <View style={styles.planMacros}>
                    <Text style={styles.macroText}>P: {plan.protein}g</Text>
                    <Text style={styles.macroText}>K: {plan.carbs}g</Text>
                    <Text style={styles.macroText}>Y: {plan.fat}g</Text>
                  </View>

                  <Text style={styles.planEndDate}>
                    Tahmini bitiş: {new Date(plan.endDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Button
          title={loading ? 'Hesaplanıyor...' : 'Hedeflerimi Kaydet'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        />
        
        {/* Logout button only for first time setup */}
        {isFirstTimeSetup && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert(
                'Çıkış Yap',
                'Hedeflerinizi kaydetmeden çıkmak istediğinize emin misiniz?',
                [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                      Logger.log('GoalSetupScreen', 'User logged out before completing setup');
                      await signOut();
                    },
                  },
                ]
              );
            }}
            disabled={loading}
          >
            <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
          </TouchableOpacity>
        )}
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
  helpText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    fontStyle: 'italic',
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
    marginBottom: 12,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  calculateButton: {
    backgroundColor: Colors.secondary.main,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  calculateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  planCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: '#F0FDF4',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardHealthy: {
    borderColor: Colors.primary.light,
  },
  planCardWarning: {
    borderColor: '#F59E0B',
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planRecommendation: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  planDetails: {
    gap: 8,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  planValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  planMacros: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    marginTop: 4,
  },
  macroText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  planEndDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent.purple,
    marginTop: 8,
  },
});

export default GoalSetupScreen;

