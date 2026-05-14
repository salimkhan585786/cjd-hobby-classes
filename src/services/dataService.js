import {
  addDocument,
  getCollection,
  getDocumentsByField,
  updateDocument,
  deleteDocument,
  uploadFile,
  setDocument,
} from '../firebase/firestoreService';
import {
  announcements,
  attendance,
  courses,
  faqs,
  fees,
  galleryItems,
  inquiries,
  orders,
  progress,
  students,
  testimonials,
  workshops,
} from './dummyData';

const seedCollections = [
  ['courses', courses],
  ['workshops', workshops],
  ['gallery', galleryItems],
  ['testimonials', testimonials],
  ['faqs', faqs],
  ['students', students],
  ['attendance', attendance],
  ['fees', fees],
  ['progress', progress],
  ['inquiries', inquiries],
  ['orders', orders],
  ['announcements', announcements],
];

export const initializeFirestoreData = async () => {
  try {
    const results = await Promise.all(
      seedCollections.map(async ([collectionName, records]) => {
        const existing = await getCollection(collectionName);

        if (existing.length > 0) {
          return { collectionName, seeded: false };
        }

        await Promise.all(
          records.map((record) => {
            const id = record.id || `${collectionName}-${Math.random().toString(36).slice(2, 8)}`;
            return setDocument(collectionName, id, record, { merge: true });
          })
        );

        return { collectionName, seeded: true };
      })
    );

    return results;
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
    throw error;
  }
};

export const getCourses = () => getCollection('courses');
export const addCourse = (data) => addDocument('courses', data);
export const updateCourse = (id, data) => updateDocument('courses', id, data);
export const deleteCourse = (id) => deleteDocument('courses', id);

export const getWorkshops = () => getCollection('workshops');
export const addWorkshop = (data) => addDocument('workshops', data);
export const updateWorkshop = (id, data) => updateDocument('workshops', id, data);
export const deleteWorkshop = (id) => deleteDocument('workshops', id);

export const getGallery = () => getCollection('gallery');
export const addGalleryItem = (data) => addDocument('gallery', data);
export const uploadGalleryImage = (file, path) => uploadFile(path, file);

export const getInquiries = () => getCollection('inquiries');
export const addInquiry = (data) => addDocument('inquiries', data);
export const updateInquiry = (id, data) => updateDocument('inquiries', id, data);

export const getOrders = () => getCollection('orders');
export const addOrder = (data) => addDocument('orders', data);
export const updateOrder = (id, data) => updateDocument('orders', id, data);

export const getTestimonials = () => getCollection('testimonials');
export const addTestimonial = (data) => addDocument('testimonials', data);

export const getFaqs = () => getCollection('faqs');
export const addFaq = (data) => addDocument('faqs', data);

export const getStudents = () => getCollection('students');
export const addStudent = (data) => addDocument('students', data);
export const updateStudent = (id, data) => updateDocument('students', id, data);

export const getFees = () => getCollection('fees');
export const getAttendance = () => getCollection('attendance');
export const getAnnouncements = () => getCollection('announcements');
export const addAnnouncement = (data) => addDocument('announcements', data);

export const getStudentProgress = (email) => getDocumentsByField('progress', 'studentEmail', email);
export const getOrdersByStudent = (email) => getDocumentsByField('orders', 'studentEmail', email);
export const getAttendanceByStudent = (email) => getDocumentsByField('attendance', 'studentEmail', email);
export const getFeesByStudent = (email) => getDocumentsByField('fees', 'studentEmail', email);
