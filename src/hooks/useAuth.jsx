import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getUserProfile, observeAuth, logout } from '../firebase/authService';

const AuthContext = createContext({});
const configuredAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'admin@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const resolveRole = (currentUser, profile) => {
  if (profile?.role) {
    return profile.role;
  }

  const email = currentUser?.email?.trim().toLowerCase();
  if (email && configuredAdminEmails.includes(email)) {
    return 'admin';
  }

  return 'student';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = observeAuth(async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole('student');
        setEmailVerified(false);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        setRole(resolveRole(currentUser, profile));
        setEmailVerified(currentUser.emailVerified || profile?.emailVerified || false);
      } catch (error) {
        console.error('Unable to load user profile:', error);
        setRole(resolveRole(currentUser, null));
        setEmailVerified(currentUser.emailVerified || false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, role, loading, logout, emailVerified }),
    [user, role, loading, emailVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
