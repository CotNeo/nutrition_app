import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { Logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Context Provider
 * Manages authentication state across the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check if user is logged in on app start
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Checks current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      Logger.log('AuthContext', 'Checking auth status');
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      Logger.log('AuthContext', 'Auth status checked', { loggedIn: !!currentUser });
    } catch (error) {
      Logger.error('AuthContext', 'Failed to check auth status', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const loggedInUser = await AuthService.loginWithEmail(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.error('AuthContext', 'Sign in failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const newUser = await AuthService.registerWithEmail(email, password, name, phone);
      
      if (newUser) {
        setUser(newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.error('AuthContext', 'Sign up failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const googleUser = await AuthService.signInWithGoogle();
      
      if (googleUser) {
        setUser(googleUser);
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.error('AuthContext', 'Google sign in failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Apple
   */
  const signInWithApple = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const appleUser = await AuthService.signInWithApple();
      
      if (appleUser) {
        setUser(appleUser);
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.error('AuthContext', 'Apple sign in failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      Logger.error('AuthContext', 'Sign out failed', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const updatedUser = await AuthService.updateProfile(updates);
      
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
      
      return false;
    } catch (error) {
      Logger.error('AuthContext', 'Update user failed', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth Context
 * @returns AuthContextType
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

