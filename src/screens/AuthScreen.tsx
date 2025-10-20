import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import SocialButton from '../components/SocialButton';
import { useAuth } from '../contexts/AuthContext';
import { Logger } from '../utils/logger';
import Colors from '../styles/colors';

type AuthMode = 'login' | 'register';

/**
 * Authentication Screen
 * Handles user login and registration with social and email options
 */
const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles email/password authentication
   */
  const handleEmailAuth = async () => {
    try {
      Logger.log('AuthScreen', `${mode} started`, { email });
      setLoading(true);

      // Validation
      if (!email || !password) {
        Logger.warn('AuthScreen', 'Email and password required');
        Alert.alert('Hata', 'Lütfen email ve şifre girin');
        return;
      }

      if (mode === 'register' && !name) {
        Logger.warn('AuthScreen', 'Name required for registration');
        Alert.alert('Hata', 'Lütfen adınızı girin');
        return;
      }

      // Call auth service
      let success = false;
      if (mode === 'login') {
        success = await signIn(email, password);
      } else {
        success = await signUp(email, password, name, phone);
      }

      if (success) {
        Logger.log('AuthScreen', `${mode} successful`, { email });
      } else {
        Alert.alert('Hata', 'Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      Logger.error('AuthScreen', `${mode} failed`, error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google Sign In
   */
  const handleGoogleSignIn = async () => {
    try {
      Logger.log('AuthScreen', 'Google Sign In started');
      setLoading(true);

      const success = await signInWithGoogle();
      
      if (success) {
        Logger.log('AuthScreen', 'Google Sign In successful');
      } else {
        Alert.alert('Hata', 'Google girişi başarısız oldu.');
      }
    } catch (error) {
      Logger.error('AuthScreen', 'Google Sign In failed', error);
      Alert.alert('Hata', 'Google girişi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Apple Sign In
   */
  const handleAppleSignIn = async () => {
    try {
      Logger.log('AuthScreen', 'Apple Sign In started');
      setLoading(true);

      const success = await signInWithApple();
      
      if (success) {
        Logger.log('AuthScreen', 'Apple Sign In successful');
      } else {
        Alert.alert('Hata', 'Apple girişi başarısız oldu.');
      }
    } catch (error) {
      Logger.error('AuthScreen', 'Apple Sign In failed', error);
      Alert.alert('Hata', 'Apple girişi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles between login and register modes
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    Logger.log('AuthScreen', `Switched to ${mode === 'login' ? 'register' : 'login'} mode`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🥗</Text>
            <Text style={styles.title}>Nutrition App</Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Hesabınıza giriş yapın'
                : 'Yeni hesap oluşturun'}
            </Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialSection}>
            <SocialButton
              provider="google"
              onPress={handleGoogleSignIn}
              loading={loading && mode === 'google'}
              disabled={loading}
            />

            {Platform.OS === 'ios' && (
              <SocialButton
                provider="apple"
                onPress={handleAppleSignIn}
                loading={loading && mode === 'apple'}
                disabled={loading}
              />
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Phone Form */}
          <View style={styles.formSection}>
            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınızı girin"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Telefon (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+90 555 123 45 67"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {mode === 'login' && (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => Logger.log('AuthScreen', 'Forgot password pressed')}
              >
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}

            <Button
              title={
                loading
                  ? 'Lütfen bekleyin...'
                  : mode === 'login'
                  ? 'Giriş Yap'
                  : 'Kayıt Ol'
              }
              onPress={handleEmailAuth}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Toggle Mode */}
          <View style={styles.toggleSection}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? 'Hesabınız yok mu? '
                : 'Zaten hesabınız var mı? '}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={loading}>
              <Text style={styles.toggleLink}>
                {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 72,
    marginBottom: 20,
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
  socialSection: {
    marginBottom: 28,
    gap: 14,
  },
  socialButton: {
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: 20,
    color: Colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  formSection: {
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 12,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleText: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  toggleLink: {
    color: Colors.primary.main,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default AuthScreen;

