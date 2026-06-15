import {
  addDocument,
  getCollection,
  getDocumentsByField,
  getDocument,
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
import { formatCurrency, slugify } from '../utils/helpers';

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

const toUniqueList = (items = []) => Array.from(new Set(items.filter(Boolean)));

const computeFeeStatus = (amount, paid) => {
  const total = Number(amount || 0);
  const settled = Number(paid || 0);

  if (settled <= 0) return 'Pending';
  if (settled >= total) return 'Paid';
  return 'Partial';
};

const computePaymentStatus = (amount, paid, locked = false) => {
  if (locked) return 'Locked';

  const total = Number(amount || 0);
  const settled = Number(paid || 0);

  if (settled <= 0) return 'Unpaid';
  if (settled >= total) return 'Paid';
  return 'Partial';
};

const createStudentDefaults = (existing = {}) => ({
  level: existing?.level || 'Beginner',
  enrolledCourses: toUniqueList(existing?.enrolledCourses || []),
  workshopRegistrations: toUniqueList(existing?.workshopRegistrations || []),
  assignmentsUploaded: Number(existing?.assignmentsUploaded || 0),
  certificates: Number(existing?.certificates || 0),
  feeStatus: existing?.feeStatus || 'Pending',
  progressPercent: Number(existing?.progressPercent || 0),
  attendanceRate: Number(existing?.attendanceRate || 0),
  joinedAt: existing?.joinedAt || new Date().toISOString(),
});

const buildEnrollmentFeePayload = (request, overrides = {}) => {
  const amount = Number(overrides.amount ?? request.amount ?? 0);
  const paid = Number(overrides.paid ?? request.paidAmount ?? 0);
  const dueDate =
    overrides.dueDate ||
    request.dueDate ||
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  return {
    studentEmail: request.studentEmail || '',
    studentUid: request.studentUid || '',
    plan: request.itemTitle || request.plan || 'Enrollment request',
    amount,
    paid,
    dueDate,
    status: computeFeeStatus(amount, paid),
    source: 'enrollment-request',
    requestId: request.id || '',
    courseId: request.itemId || '',
    reminderDays: Number(overrides.reminderDays ?? request.reminderDays ?? 7),
    remindersEnabled: Boolean(overrides.remindersEnabled ?? request.remindersEnabled ?? true),
    createdAt: overrides.createdAt || request.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const syncEnrollmentRequestFee = async (requestId, request, overrides = {}) => {
  const feeId = request.feeId || `fee-request-${requestId}`;
  const feePayload = buildEnrollmentFeePayload({ ...request, id: requestId }, overrides);

  await setDocument('fees', feeId, feePayload, { merge: true });
  return { feeId, feePayload };
};

const updateStudentFeeSummary = async (studentUid, studentEmail) => {
  if (!studentUid && !studentEmail) {
    return;
  }

  const feeEntries = studentEmail ? await getFeesByStudent(studentEmail) : [];
  const totalOutstanding = feeEntries.reduce(
    (sum, item) => sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0),
    0
  );
  const hasPartial = feeEntries.some(
    (item) => Number(item.paid || 0) > 0 && Number(item.paid || 0) < Number(item.amount || 0)
  );
  const hasPending = feeEntries.some((item) => Number(item.paid || 0) <= 0);
  const nextStatus = totalOutstanding <= 0 ? 'Paid' : hasPartial ? 'Partial' : hasPending ? 'Pending' : 'Pending';

  if (studentUid) {
    await setDocument(
      'students',
      studentUid,
      {
        feeStatus: feeEntries.length > 0 ? nextStatus : 'Pending',
      },
      { merge: true }
    );
  }
};

const updateStudentMetricByEmail = async (studentEmail, updates) => {
  if (!studentEmail) {
    return;
  }

  const matches = await getDocumentsByField('students', 'email', studentEmail);
  const student = matches[0];

  if (!student?.id) {
    return;
  }

  await setDocument('students', student.id, updates, { merge: true });
};

const applyCourseEnrollment = async ({ uid, email, name, courseTitle }) => {
  if (!uid || !courseTitle) {
    throw new Error('Course enrollment requires a student and course title.');
  }

  const student = await ensureStudentProfile({ uid, email, name });
  const enrolledCourses = toUniqueList([...(student.enrolledCourses || []), courseTitle]);

  await setDocument(
    'students',
    uid,
    {
      enrolledCourses,
      feeStatus: student.feeStatus || 'Pending',
      progressPercent: student.progressPercent || 0,
      attendanceRate: student.attendanceRate || 0,
    },
    { merge: true }
  );

  return {
    ...student,
    enrolledCourses,
  };
};

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
export const uploadCourseMedia = (file, path) => uploadFile(path, file);

export const getWorkshops = () => getCollection('workshops');
export const addWorkshop = (data) => addDocument('workshops', data);
export const updateWorkshop = (id, data) => updateDocument('workshops', id, data);
export const deleteWorkshop = (id) => deleteDocument('workshops', id);
export const uploadWorkshopMedia = (file, path) => uploadFile(path, file);

export const getGallery = () => getCollection('gallery');
export const addGalleryItem = (data) => addDocument('gallery', data);
export const updateGalleryItem = (id, data) => updateDocument('gallery', id, data);
export const deleteGalleryItem = (id) => deleteDocument('gallery', id);
export const uploadGalleryImage = (file, path) => uploadFile(path, file);

export const getGalleryCollage = () => getCollection('galleryCollage');
export const addGalleryCollageItem = (data) => addDocument('galleryCollage', data);
export const deleteGalleryCollageItem = (id) => deleteDocument('galleryCollage', id);
export const uploadGalleryCollageImage = (file, path) => uploadFile(path, file);

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
export const getProgressRecords = () => getCollection('progress');
export const getEnrollmentRequests = () => getCollection('enrollmentRequests');
export const getNotifications = () => getCollection('notifications');

export const getStudentProgress = (email) => getDocumentsByField('progress', 'studentEmail', email);
export const getOrdersByStudent = (email) => getDocumentsByField('orders', 'studentEmail', email);
export const getAttendanceByStudent = (email) => getDocumentsByField('attendance', 'studentEmail', email);
export const getFeesByStudent = (email) => getDocumentsByField('fees', 'studentEmail', email);
export const getEnrollmentRequestsByStudent = (email) =>
  getDocumentsByField('enrollmentRequests', 'studentEmail', email);

export const addStudentNotification = (data) =>
  addDocument('notifications', {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
    read: Boolean(data.read),
  });

export const ensureStudentProfile = async ({ uid, email, name }) => {
  if (!uid) {
    throw new Error('Student profile requires an authenticated user id.');
  }

  const existing = await getDocument('students', uid);
  const profile = {
    uid,
    email: email || existing?.email || '',
    name: name || existing?.name || '',
    role: 'student',
    ...createStudentDefaults(existing),
  };

  await setDocument('students', uid, profile, { merge: true });
  return { ...existing, ...profile };
};

export const enrollStudentInCourse = async ({ uid, email, name, course }) => {
  if (!course?.title) {
    throw new Error('Course details are missing.');
  }

  return applyCourseEnrollment({
    uid,
    email,
    name,
    courseTitle: course.title,
  });
};

export const registerStudentForWorkshop = async ({ uid, email, name, workshop }) => {
  if (!workshop?.title) {
    throw new Error('Workshop details are missing.');
  }

  if (Number(workshop.seats || 0) <= 0) {
    throw new Error('This workshop is fully booked.');
  }

  const student = await ensureStudentProfile({ uid, email, name });
  const workshopRegistrations = toUniqueList([...(student.workshopRegistrations || []), workshop.title]);

  await setDocument(
    'students',
    uid,
    {
      workshopRegistrations,
      feeStatus: student.feeStatus || 'Pending',
    },
    { merge: true }
  );

  if (workshop.id) {
    try {
      await updateDocument('workshops', workshop.id, {
        seats: Math.max(Number(workshop.seats || 0) - 1, 0),
      });
    } catch (error) {
      console.warn('Unable to decrement workshop seats in Firestore:', error);
    }
  }

  const feeId = `fee-workshop-${uid}-${slugify(workshop.title)}`;
  await setDocument(
    'fees',
    feeId,
    {
      studentEmail: email || student.email || '',
      plan: workshop.title,
      amount: Number(workshop.price || 0),
      paid: 0,
      status: 'Pending',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      source: 'workshop-registration',
      studentUid: uid,
      workshopId: workshop.id || '',
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await updateStudentFeeSummary(uid, email || student.email || '');

  return {
    ...student,
    workshopRegistrations,
  };
};

export const createEnrollmentRequest = async ({ uid, email, name, course }) => {
  if (!uid || !email) {
    throw new Error('You need to be signed in to request enrollment.');
  }

  if (!course?.title) {
    throw new Error('Course details are missing.');
  }

  const student = await ensureStudentProfile({ uid, email, name });
  const alreadyEnrolled = (student.enrolledCourses || []).includes(course.title);

  if (alreadyEnrolled) {
    throw new Error('You are already enrolled in this course.');
  }

  const existingRequests = await getEnrollmentRequestsByStudent(email);
  const activeRequest = existingRequests.find(
    (item) =>
      item.itemType === 'course' &&
      item.itemTitle === course.title &&
      !['Rejected', 'Cancelled'].includes(item.requestStatus)
  );

  if (activeRequest) {
    return activeRequest.id;
  }

  const requestId = `request-course-${uid}-${slugify(course.title)}`;
  const amount = Number(course.price || 0);
  const payload = {
    studentUid: uid,
    studentEmail: email,
    studentName: name || student.name || '',
    itemType: 'course',
    itemId: course.id || '',
    itemTitle: course.title,
    amount,
    paidAmount: 0,
    outstandingAmount: amount,
    paymentStatus: 'Locked',
    requestStatus: 'Pending Approval',
    enrolled: false,
    remindersEnabled: true,
    reminderDays: 7,
    source: 'student-course-request',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDocument('enrollmentRequests', requestId, payload, { merge: true });
  return requestId;
};

export const finalizeEnrollmentRequest = async (requestId, overrides = {}) => {
  const request = await getDocument('enrollmentRequests', requestId);

  if (!request) {
    throw new Error('Enrollment request was not found.');
  }

  if (request.itemType !== 'course') {
    throw new Error('Only course enrollment requests can be finalized right now.');
  }

  const amount = Number(overrides.amount ?? request.amount ?? 0);
  const paidAmount = Number(overrides.paidAmount ?? request.paidAmount ?? 0);
  const dueDate = overrides.dueDate || request.dueDate || new Date().toISOString();
  const reminderDays = Number(overrides.reminderDays ?? request.reminderDays ?? 7);
  const remindersEnabled = Boolean(overrides.remindersEnabled ?? request.remindersEnabled ?? true);

  await applyCourseEnrollment({
    uid: request.studentUid,
    email: request.studentEmail,
    name: request.studentName,
    courseTitle: request.itemTitle,
  });

  const { feeId } = await syncEnrollmentRequestFee(requestId, request, {
    amount,
    paid: paidAmount,
    dueDate,
    reminderDays,
    remindersEnabled,
  });

  await setDocument(
    'enrollmentRequests',
    requestId,
    {
      feeId,
      amount,
      paidAmount,
      outstandingAmount: Math.max(amount - paidAmount, 0),
      paymentStatus: computePaymentStatus(amount, paidAmount, false),
      requestStatus: request.requestStatus === 'Rejected' ? 'Approved' : request.requestStatus || 'Approved',
      enrolled: true,
      enrolledAt: request.enrolledAt || new Date().toISOString(),
      dueDate,
      reminderDays,
      remindersEnabled,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await updateStudentFeeSummary(request.studentUid, request.studentEmail);
  return requestId;
};

export const approveEnrollmentRequest = async (requestId, overrides = {}) => {
  const request = await getDocument('enrollmentRequests', requestId);

  if (!request) {
    throw new Error('Enrollment request was not found.');
  }

  const amount = Number(overrides.amount ?? request.amount ?? 0);
  const paidAmount = Number(overrides.paidAmount ?? request.paidAmount ?? 0);
  const dueDate =
    overrides.dueDate || request.dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const reminderDays = Number(overrides.reminderDays ?? request.reminderDays ?? 7);
  const remindersEnabled = Boolean(overrides.remindersEnabled ?? request.remindersEnabled ?? true);

  const { feeId } = await syncEnrollmentRequestFee(requestId, request, {
    amount,
    paid: paidAmount,
    dueDate,
    reminderDays,
    remindersEnabled,
  });

  await setDocument(
    'enrollmentRequests',
    requestId,
    {
      feeId,
      amount,
      paidAmount,
      outstandingAmount: Math.max(amount - paidAmount, 0),
      requestStatus: 'Approved',
      paymentStatus: computePaymentStatus(amount, paidAmount, false),
      dueDate,
      reminderDays,
      remindersEnabled,
      updatedAt: new Date().toISOString(),
      approvedAt: request.approvedAt || new Date().toISOString(),
    },
    { merge: true }
  );

  if (paidAmount > 0 && !request.enrolled) {
    await finalizeEnrollmentRequest(requestId, {
      amount,
      paidAmount,
      dueDate,
      reminderDays,
      remindersEnabled,
    });
  } else {
    await updateStudentFeeSummary(request.studentUid, request.studentEmail);
  }

  await addStudentNotification({
    studentUid: request.studentUid,
    studentEmail: request.studentEmail,
    type: 'approval',
    title: 'Enrollment request approved',
    message: `${request.itemTitle} is approved. You can now pay the course fee from your student dashboard.`,
    source: 'enrollment-request',
    requestId,
  });

  return requestId;
};

export const rejectEnrollmentRequest = async (requestId) => {
  const request = await getDocument('enrollmentRequests', requestId);

  if (!request) {
    throw new Error('Enrollment request was not found.');
  }

  await setDocument(
    'enrollmentRequests',
    requestId,
    {
      requestStatus: 'Rejected',
      paymentStatus: 'Locked',
      updatedAt: new Date().toISOString(),
      rejectedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return requestId;
};

export const recordEnrollmentRequestPayment = async (requestId, paymentAmount, metadata = {}) => {
  const request = await getDocument('enrollmentRequests', requestId);

  if (!request) {
    throw new Error('Enrollment request was not found.');
  }

  if (request.requestStatus !== 'Approved') {
    throw new Error('Payment is locked until the admin approves this request.');
  }

  const amount = Number(metadata.amount ?? request.amount ?? 0);
  const currentPaid = Number(request.paidAmount || 0);
  const settledAmount = Math.max(Number(paymentAmount || 0), 0);
  const paidAmount = Math.min(currentPaid + settledAmount, amount);
  const dueDate = metadata.dueDate || request.dueDate || new Date().toISOString();
  const reminderDays = Number(metadata.reminderDays ?? request.reminderDays ?? 7);
  const remindersEnabled = Boolean(metadata.remindersEnabled ?? request.remindersEnabled ?? true);

  const { feeId } = await syncEnrollmentRequestFee(requestId, request, {
    amount,
    paid: paidAmount,
    dueDate,
    reminderDays,
    remindersEnabled,
  });

  await setDocument(
    'enrollmentRequests',
    requestId,
    {
      feeId,
      amount,
      paidAmount,
      outstandingAmount: Math.max(amount - paidAmount, 0),
      paymentStatus: computePaymentStatus(amount, paidAmount, false),
      lastPaymentAt: new Date().toISOString(),
      dueDate,
      reminderDays,
      remindersEnabled,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (paidAmount > 0 && !request.enrolled) {
    await finalizeEnrollmentRequest(requestId, {
      amount,
      paidAmount,
      dueDate,
      reminderDays,
      remindersEnabled,
    });
  } else {
    await updateStudentFeeSummary(request.studentUid, request.studentEmail);
  }

  await addStudentNotification({
    studentUid: request.studentUid,
    studentEmail: request.studentEmail,
    type: 'payment-confirmation',
    title: 'Payment confirmed',
    message: `${formatCurrency(paymentAmount)} has been recorded for ${request.itemTitle}. Remaining balance: ${formatCurrency(Math.max(amount - paidAmount, 0))}.`,
    source: 'payment',
    requestId,
  });

  return requestId;
};

export const saveStudentRecord = async (studentId, data) => {
  const payload = {
    ...data,
    assignmentsUploaded: Number(data.assignmentsUploaded || 0),
    certificates: Number(data.certificates || 0),
    progressPercent: Number(data.progressPercent || 0),
    attendanceRate: Number(data.attendanceRate || 0),
  };

  await setDocument('students', studentId, payload, { merge: true });
  return studentId;
};

export const saveFeeRecord = async (id, data) => {
  const payload = {
    ...data,
    amount: Number(data.amount || 0),
    paid: Number(data.paid || 0),
    status: data.status || computeFeeStatus(data.amount, data.paid),
  };

  if (id) {
    await setDocument('fees', id, payload, { merge: true });
    if (payload.studentUid || payload.studentEmail) {
      await updateStudentFeeSummary(payload.studentUid, payload.studentEmail);
    }
    return id;
  }

  const createdId = await addDocument('fees', payload);
  if (payload.studentUid || payload.studentEmail) {
    await updateStudentFeeSummary(payload.studentUid, payload.studentEmail);
  }
  return createdId;
};

export const saveAttendanceRecord = async (id, data) => {
  const payload = {
    ...data,
    attended: Number(data.attended || 0),
    total: Number(data.total || 0),
  };

  if (id) {
    await setDocument('attendance', id, payload, { merge: true });
    const attendanceRate = payload.total > 0 ? Math.round((payload.attended / payload.total) * 100) : 0;
    await updateStudentMetricByEmail(payload.studentEmail, { attendanceRate });
    return id;
  }

  const createdId = await addDocument('attendance', payload);
  const attendanceRate = payload.total > 0 ? Math.round((payload.attended / payload.total) * 100) : 0;
  await updateStudentMetricByEmail(payload.studentEmail, { attendanceRate });
  return createdId;
};

export const saveProgressRecord = async (id, data) => {
  const payload = {
    ...data,
    completion: Number(data.completion || 0),
  };

  if (id) {
    await setDocument('progress', id, payload, { merge: true });
    await updateStudentMetricByEmail(payload.studentEmail, { progressPercent: payload.completion });
    return id;
  }

  const createdId = await addDocument('progress', payload);
  await updateStudentMetricByEmail(payload.studentEmail, { progressPercent: payload.completion });
  return createdId;
};
