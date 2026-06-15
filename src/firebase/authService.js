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
import { getDocument, getDocumentsByField, setDocument, updateDocument } from './firestoreService';

export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async ({ email, password, name, role = 'student', securityQuestion = '', securityAnswer = '', loginPin = '' }) => {
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
    securityQuestion,
    securityAnswer: securityAnswer.toLowerCase().trim(),
    loginPin,
    storedPassword: password,
  };

  await setDocument('users', credential.user.uid, baseProfile, { merge: true });

  await setDocument('passwordReset', email, {
    uid: credential.user.uid,
    email,
    securityQuestion,
    securityAnswer: securityAnswer.toLowerCase().trim(),
    loginPin,
    storedPassword: password,
  }, { merge: true });

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

export const findUserByEmail = async (email) => {
  const results = await getDocumentsByField('passwordReset', 'email', email);
  return results.length > 0 ? results[0] : null;
};

export const verifySecurityAnswer = async (email, answer) => {
  const user = await findUserByEmail(email);
  if (!user) return { found: false };
  if (!user.securityAnswer) return { found: true, hasQuestion: false };
  const match = user.securityAnswer === answer.toLowerCase().trim();
  return { found: true, hasQuestion: true, match, uid: user.uid || user.id };
};

export const resetLoginPin = async (uid, newPin, newPassword = '') => {
  const updates = { loginPin: newPin };
  if (newPassword) updates.storedPassword = newPassword;
  await updateDocument('users', uid, updates);
  await updateDocument('students', uid, updates);
  // Also update passwordReset collection by email
  const user = await getDocument('users', uid);
  if (user && user.email) {
    await setDocument('passwordReset', user.email, updates, { merge: true });
  }
};

export const loginWithPin = async (email, pin) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No account found with this email.');
  if (!user.loginPin) throw new Error('No PIN set for this account. Please use password login.');
  if (user.loginPin !== pin) throw new Error('Incorrect PIN. Please try again.');
  if (!user.storedPassword) throw new Error('Cannot authenticate with PIN. Please use password login.');
  return signInWithEmailAndPassword(auth, email, user.storedPassword);
};

export const resetPasswordViaSecurity = async (email, newPin) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('No account found with this email.');
  await setDocument('passwordReset', email, { loginPin: newPin }, { merge: true });
};
