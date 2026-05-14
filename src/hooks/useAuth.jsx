import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserProfile, observeAuth, logout } from '../firebase/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuth(async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole('student');
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        setRole(profile?.role || (currentUser.email?.includes('admin') ? 'admin' : 'student'));
      } catch (error) {
        console.error('Unable to load user profile:', error);
        setRole(currentUser.email?.includes('admin') ? 'admin' : 'student');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, role, loading, logout }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
