import { User } from '../types';
import { StorageService, STORAGE_KEYS } from '../utils/storage';
import { Logger } from '../utils/logger';

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

      // TODO: Implement Google Sign In with Firebase or Google SDK
      // For now, create a demo Google user
      const googleUser: User = {
        id: `google_${Date.now()}`,
        name: 'Google Kullanıcı',
        email: 'google.user@gmail.com',
      };

      await StorageService.setItem(STORAGE_KEYS.USER, googleUser);
      Logger.log('AuthService', 'Google Sign In successful', { userId: googleUser.id });
      return googleUser;
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

      // TODO: Implement Apple Sign In
      // For now, create a demo Apple user
      const appleUser: User = {
        id: `apple_${Date.now()}`,
        name: 'Apple Kullanıcı',
        email: 'apple.user@icloud.com',
      };

      await StorageService.setItem(STORAGE_KEYS.USER, appleUser);
      Logger.log('AuthService', 'Apple Sign In successful', { userId: appleUser.id });
      return appleUser;
    } catch (error) {
      Logger.error('AuthService', 'Apple Sign In failed', error);
      return null;
    }
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

