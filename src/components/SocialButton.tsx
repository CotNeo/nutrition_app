import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import Colors from '../styles/colors';

type SocialProvider = 'google' | 'apple';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Social Login Button Component
 * Follows official brand guidelines for Google and Apple
 */
const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const isGoogle = provider === 'google';

  const buttonStyle = isGoogle ? styles.googleButton : styles.appleButton;
  const textStyle = isGoogle ? styles.googleText : styles.appleText;
  const logo = isGoogle ? 'G' : ''; // Will be replaced with actual logos
  const title = isGoogle ? 'Google ile devam et' : 'Apple ile devam et';

  return (
    <TouchableOpacity
      style={[buttonStyle, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isGoogle ? Colors.brand.google.blue : Colors.brand.apple.white} />
      ) : (
        <>
          <View style={isGoogle ? styles.googleLogo : styles.appleLogo}>
            <Text style={styles.logoText}>{logo}</Text>
          </View>
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Google Button - Official Google Identity Guidelines
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.apple.white,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginLeft: 12,
    letterSpacing: 0.25,
  },
  googleLogo: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.brand.google.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Apple Button - Official Apple Human Interface Guidelines
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.apple.black,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  appleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.brand.apple.white,
    marginLeft: 8,
    letterSpacing: 0.25,
  },
  appleLogo: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brand.apple.white,
  },
  
  disabled: {
    opacity: 0.5,
  },
});

export default SocialButton;

