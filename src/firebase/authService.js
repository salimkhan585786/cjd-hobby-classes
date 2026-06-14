import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { getDocument, setDocument } from './firestoreService';

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async ({ email, password, name, role = 'student' }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  const baseProfile = {
    uid: credential.user.uid,
    name: name || '',
    email,
    role,
    emailVerified: true,
    createdAt: new Date().toISOString(),
  };

  await setDocument('users', credential.user.uid, baseProfile, { merge: true });

  if (role === 'student') {
    await setDocument(
      'students',
      credential.user.uid,
      {
        ...baseProfile,
        level: 'Beginner',
        enrolledCourses: [],
        workshopRegistrations: [],
        assignmentsUploaded: 0,
        certificates: 0,
        feeStatus: 'Pending',
        progressPercent: 0,
        attendanceRate: 0,
        joinedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  return credential;
};

export const logout = () => signOut(auth);
export const observeAuth = (callback) => onAuthStateChanged(auth, callback);
export const getUserProfile = (uid) => getDocument('users', uid);
export const requestPasswordReset = (email) => sendPasswordResetEmail(auth, email);
export const confirmPasswordReset = (oobCode, newPassword) => firebaseConfirmPasswordReset(auth, oobCode, newPassword);
