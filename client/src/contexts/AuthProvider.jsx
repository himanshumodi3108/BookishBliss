import React, { createContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import app from '../firebase/firebase.config';
import apiClient from '../utils/api';

export const AuthContext = createContext();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set persistence when the provider mounts
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error("Auth persistence error:", error);
        setError(error.message);
      });
  }, []);

  // JWT Signup
  const signupJWT = async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/signup', { email, password, name });
      const { token, user } = response;
      
      // Store JWT token and user
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('jwtUser', JSON.stringify(user));
      setJwtToken(token);
      setUser({ ...user, uid: user._id });
      
      return { user: { ...user, uid: user._id }, token };
    } catch (error) {
      setError(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // JWT Login
  const loginJWT = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response;
      
      // Store JWT token and user
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('jwtUser', JSON.stringify(user));
      setJwtToken(token);
      setUser({ ...user, uid: user._id });
      
      return { user: { ...user, uid: user._id }, token };
    } catch (error) {
      setError(error.message || 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const createUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Store Firebase user in database
      try {
        await apiClient.post('/auth/firebase-login', {});
      } catch (err) {
        console.error('Failed to store Firebase user:', err);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Store Firebase user in database
      try {
        await apiClient.post('/auth/firebase-login', {});
      } catch (err) {
        console.error('Failed to store Firebase user:', err);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Store Firebase user in database
      try {
        await apiClient.post('/auth/firebase-login', {});
      } catch (err) {
        console.error('Failed to store Firebase user:', err);
      }
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const logOut = async () => {
    setError(null);
    try {
      // Clear JWT token if exists
      if (jwtToken) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('jwtUser');
        setJwtToken(null);
        setUser(null);
      }
      // Sign out from Firebase if logged in with Firebase
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  useEffect(() => {
    // Check for JWT token first
    const storedToken = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('jwtUser');
    
    if (storedToken && storedUser) {
      setJwtToken(storedToken);
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      // Listen to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          // Store Firebase user in database
          try {
            await apiClient.post('/auth/firebase-login', {});
          } catch (err) {
            console.error('Failed to store Firebase user:', err);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const authInfo = {
    user,
    jwtToken,
    createUser,
    loginWithGoogle,
    loading,
    login,
    logOut,
    error,
    // JWT methods
    signupJWT,
    loginJWT
  }

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;