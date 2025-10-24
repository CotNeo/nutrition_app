import { User } from '../types';
import { StorageService, STORAGE_KEYS } from '../utils/storage';
import { Logger } from '../utils/logger';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

/**
 * Authentication Service
 * Manages user authentication, registration, and session management
 */
export class AuthService {
  /**
   * Registers a new user with email and password
   * @param email User's email
   * @param password User's password
   * @param name User's full name
   * @param phone Optional phone number
   * @returns Promise<User | null>
   */
  static async registerWithEmail(
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Register started', { email, name });

      // 1. Validate input
      if (!email || !password || !name) {
        Logger.error('AuthService', 'Missing required fields');
        return null;
      }

      // 2. Check if user already exists
      const existingUser = await this.getCurrentUser();
      if (existingUser) {
        Logger.warn('AuthService', 'User already logged in');
        return existingUser;
      }

      // 3. Create new user object
      const newUser: User = {
        id: Date.now().toString(), // Simple ID generation (replace with UUID in production)
        name,
        email,
      };

      if (phone) {
        newUser.age = undefined; // Will be set in profile
      }

      // 4. Save user to storage
      const success = await StorageService.setItem(STORAGE_KEYS.USER, newUser);

      if (success) {
        Logger.log('AuthService', 'Registration successful', { userId: newUser.id });
        return newUser;
      }

      Logger.error('AuthService', 'Failed to save user');
      return null;
    } catch (error) {
      Logger.error('AuthService', 'Registration failed', error);
      return null;
    }
  }

  /**
   * Logs in user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise<User | null>
   */
  static async loginWithEmail(email: string, password: string): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Login started', { email });

      // 1. Validate input
      if (!email || !password) {
        Logger.error('AuthService', 'Missing email or password');
        return null;
      }

      // 2. Check if user exists (in real app, verify with backend)
      const user = await StorageService.getItem<User>(STORAGE_KEYS.USER);

      if (user && user.email === email) {
        Logger.log('AuthService', 'Login successful', { userId: user.id });
        return user;
      }

      // 3. If no user found, create a demo user (for testing)
      const demoUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
      };

      await StorageService.setItem(STORAGE_KEYS.USER, demoUser);
      Logger.log('AuthService', 'Demo user created and logged in', { userId: demoUser.id });
      return demoUser;
    } catch (error) {
      Logger.error('AuthService', 'Login failed', error);
      return null;
    }
  }

  /**
   * Signs in with Google
   * @returns Promise<User | null>
   */
  static async signInWithGoogle(): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Google Sign In started');

      // Configure WebBrowser for auth
      WebBrowser.maybeCompleteAuthSession();

      // Google OAuth configuration
      const redirectUri = AuthSession.makeRedirectUri();

      const request = new AuthSession.AuthRequest({
        clientId: 'YOUR_CLIENT_ID', // Replace with your actual client ID
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: {},
        prompt: AuthSession.Prompt.SelectAccount,
      });

      // Start the authentication flow
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${result.authentication?.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        const googleUser: User = {
          id: `google_${userInfo.id}`,
          name: userInfo.name || 'Google Kullanıcı',
          email: userInfo.email,
        };

        await StorageService.setItem(STORAGE_KEYS.USER, googleUser);
        Logger.log('AuthService', 'Google Sign In successful', { 
          userId: googleUser.id,
          name: googleUser.name,
          email: googleUser.email
        });
        return googleUser;
      }

      Logger.error('AuthService', 'Google Sign In failed - no user info');
      return null;
    } catch (error) {
      Logger.error('AuthService', 'Google Sign In failed', error);
      return null;
    }
  }

  /**
   * Signs in with Apple
   * @returns Promise<User | null>
   */
  static async signInWithApple(): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Apple Sign In started');

      // Check if Apple Sign In is available
      if (Platform.OS !== 'ios') {
        Logger.warn('AuthService', 'Apple Sign In only available on iOS');
        // For development/testing on non-iOS platforms, create a demo user with realistic name
        const demoNames = ['Ahmet Yılmaz', 'Fatma Öztürk', 'Mehmet Demir', 'Ayşe Kaya'];
        const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
        
        const demoAppleUser: User = {
          id: `apple_demo_${Date.now()}`,
          name: randomName,
          email: 'demo.apple@icloud.com',
        };
        
        await StorageService.setItem(STORAGE_KEYS.USER, demoAppleUser);
        Logger.log('AuthService', 'Demo Apple user created for non-iOS platform', { 
          userId: demoAppleUser.id,
          userName: demoAppleUser.name 
        });
        return demoAppleUser;
      }

      // Check if there's already a user with Apple ID (for subsequent logins)
      const existingUser = await this.getCurrentUser();
      if (existingUser && existingUser.id.startsWith('apple_')) {
        Logger.log('AuthService', 'Existing Apple user found, returning existing user', {
          userId: existingUser.id,
          userName: existingUser.name
        });
        return existingUser;
      }

      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Logger.error('AuthService', 'Apple Authentication not available');
        return null;
      }

      // Request Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      Logger.log('AuthService', 'Apple credential received', { 
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        givenName: credential.fullName?.givenName,
        familyName: credential.fullName?.familyName,
        hasFullName: !!credential.fullName,
        hasGivenName: !!credential.fullName?.givenName,
        hasFamilyName: !!credential.fullName?.familyName
      });

      // Debug: Apple credential'ın tam içeriğini logla
      Logger.log('AuthService', 'Full Apple credential object', credential);

      // Apple Sign-In'den fullName gelip gelmediğini kontrol et
      if (credential.fullName && (credential.fullName.givenName || credential.fullName.familyName)) {
        Logger.log('AuthService', 'Apple provided fullName information', {
          givenName: credential.fullName.givenName,
          familyName: credential.fullName.familyName
        });
      } else {
        Logger.warn('AuthService', 'Apple did not provide fullName information - this is normal for subsequent logins');
      }

      // Create user object from Apple credential
      const displayName = this.getDisplayName(credential.fullName, credential.user);
      const appleUser: User = {
        id: credential.user, // Apple's unique user identifier
        name: displayName, // Otomatik olarak Apple'dan alınan ad soyad
        email: credential.email || `${credential.user}@privaterelay.appleid.com`,
      };

      // Save user to storage
      await StorageService.setItem(STORAGE_KEYS.USER, appleUser);
      Logger.log('AuthService', 'Apple Sign In successful', { 
        userId: appleUser.id,
        userName: appleUser.name,
        userEmail: appleUser.email 
      });
      
      return appleUser;
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        Logger.log('AuthService', 'Apple Sign In canceled by user');
      } else {
        Logger.error('AuthService', 'Apple Sign In failed', error);
      }
      return null;
    }
  }

  /**
   * Helper method to get display name from Apple's full name object
   * @param fullName Apple's full name object
   * @param userId Apple user ID for fallback
   * @returns Display name string
   */
  private static getDisplayName(fullName: AppleAuthentication.AppleAuthenticationFullName | null, userId?: string): string {
    if (!fullName) {
      Logger.warn('AuthService', 'No full name provided by Apple - this is normal for subsequent logins');
      // Apple Sign-In sadece ilk kez fullName verir, sonraki girişlerde vermez
      // Bu durumda daha kullanıcı dostu bir isim oluşturalım
      return this.generateAppleUserName(userId);
    }

    const { givenName, familyName } = fullName;
    
    Logger.log('AuthService', 'Processing Apple full name', { 
      givenName, 
      familyName,
      hasGivenName: !!givenName,
      hasFamilyName: !!familyName
    });
    
    // İdeal durum: Hem ad hem soyad var
    if (givenName && familyName) {
      const fullName = `${givenName.trim()} ${familyName.trim()}`;
      Logger.log('AuthService', 'Full name created', { fullName });
      return fullName;
    } 
    // Sadece ad var
    else if (givenName) {
      Logger.log('AuthService', 'Using given name only', { givenName });
      return givenName.trim();
    } 
    // Sadece soyad var
    else if (familyName) {
      Logger.log('AuthService', 'Using family name only', { familyName });
      return familyName.trim();
    }
    
    // Hiçbiri yok
    Logger.warn('AuthService', 'No valid name components found');
    return this.generateAppleUserName(userId);
  }

  /**
   * Generates a user-friendly name for Apple users when fullName is not available
   * @param userId Apple user ID
   * @returns Generated user name
   */
  private static generateAppleUserName(userId?: string): string {
    // Apple Sign-In'den fullName gelmediğinde daha kullanıcı dostu bir isim oluştur
    // Bu durumda kullanıcı GoalSetupScreen'de kendi ismini girebilir
    
    Logger.warn('AuthService', 'Generating fallback name for Apple user', { userId });
    
    // Apple Sign-In'den fullName gelmediğinde boş string döndür
    // Bu sayede kullanıcı GoalSetupScreen'de kendi ismini girebilir
    return '';
  }

  /**
   * Gets the currently logged in user
   * @returns Promise<User | null>
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Getting current user');
      const user = await StorageService.getItem<User>(STORAGE_KEYS.USER);
      
      if (user) {
        Logger.log('AuthService', 'User found', { userId: user.id });
      } else {
        Logger.log('AuthService', 'No user logged in');
      }
      
      return user;
    } catch (error) {
      Logger.error('AuthService', 'Failed to get current user', error);
      return null;
    }
  }

  /**
   * Checks if user is logged in
   * @returns Promise<boolean>
   */
  static async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Logs out the current user
   * @returns Promise<boolean>
   */
  static async logout(): Promise<boolean> {
    try {
      Logger.log('AuthService', 'Logout started');
      
      // Remove user data
      await StorageService.removeItem(STORAGE_KEYS.USER);
      
      // Optionally clear all data
      // await StorageService.clear();
      
      Logger.log('AuthService', 'Logout successful');
      return true;
    } catch (error) {
      Logger.error('AuthService', 'Logout failed', error);
      return false;
    }
  }

  /**
   * Updates user profile
   * @param updates Partial user data to update
   * @returns Promise<User | null>
   */
  static async updateProfile(updates: Partial<User>): Promise<User | null> {
    try {
      Logger.log('AuthService', 'Updating profile', updates);
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        Logger.error('AuthService', 'No user logged in');
        return null;
      }

      const updatedUser = { ...currentUser, ...updates };
      const success = await StorageService.setItem(STORAGE_KEYS.USER, updatedUser);

      if (success) {
        Logger.log('AuthService', 'Profile updated successfully');
        return updatedUser;
      }

      return null;
    } catch (error) {
      Logger.error('AuthService', 'Profile update failed', error);
      return null;
    }
  }
}

