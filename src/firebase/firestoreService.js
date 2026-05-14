import { collection, addDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

export const getCollection = async (name) => {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getDocumentsByField = async (name, field, value) => {
  const q = query(collection(db, name), where(field, '==', value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addDocument = async (name, data) => {
  const refDoc = await addDoc(collection(db, name), data);
  return refDoc.id;
};

export const updateDocument = async (name, id, data) => {
  const docRef = doc(db, name, id);
  await updateDoc(docRef, data);
  return id;
};

export const setDocument = async (name, id, data, options) => {
  const docRef = doc(db, name, id);
  await setDoc(docRef, data, options);
  return id;
};

export const getDocument = async (name, id) => {
  const docRef = doc(db, name, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const deleteDocument = async (name, id) => {
  const docRef = doc(db, name, id);
  await deleteDoc(docRef);
};

export const uploadFile = async (path, file) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};
