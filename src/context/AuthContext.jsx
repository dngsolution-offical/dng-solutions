import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn('[useAuth] called outside AuthProvider');
    return { currentUser: null, logout: () => {}, loading: true };
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] setting up onAuthStateChanged');

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log('[AuthContext] auth state changed:', user?.email || 'null');

        if (user) {
          setCurrentUser(user);

          // Ensure user doc exists (async, don't block auth state)
          try {
            const ref = doc(db, 'users', user.uid);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
              const displayName = user.displayName 
                || (user.email ? user.email.split('@')[0] : 'User');
              
              await setDoc(ref, {
                uid: user.uid,
                email: user.email || '',
                name: displayName,
                displayName: displayName,
                photoURL: user.photoURL || null,
                package: 'Free',
                role: 'user',
                ordersUsed: 0,
                emailVerified: user.emailVerified || false,
                createdAt: serverTimestamp(),
                authProvider: user.providerData[0]?.providerId || 'unknown',
              });

              console.log('[AuthContext] ✅ user doc created');
            }
          } catch (e) {
            console.warn('[AuthContext] user doc check failed:', e.message);
          }
        } else {
          setCurrentUser(null);
        }

        setLoading(false);
        console.log('[AuthContext] loading = false');
      },
      (error) => {
        console.error('[AuthContext] auth state error:', error);
        setLoading(false);
      }
    );

    return () => {
      console.log('[AuthContext] unsubscribing');
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('[AuthContext] ✅ signed out');
    } catch (e) {
      console.error('[AuthContext] signOut error:', e);
    }
  };

  const value = { currentUser, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};