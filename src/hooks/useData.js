import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getAnnouncements,
  getAttendance,
  getAttendanceByStudent,
  getCourses,
  getEnrollmentRequests,
  getEnrollmentRequestsByStudent,
  getFaqs,
  getFees,
  getFeesByStudent,
  getGallery,
  getGalleryCollage,
  getInquiries,
  getOrders,
  getOrdersByStudent,
  getNotifications,
  getStudentProgress,
  getStudents,
  getTestimonials,
  getWorkshops,
  getProgressRecords,
} from '../services/dataService';
import {
  announcements as dummyAnnouncements,
  attendance as dummyAttendance,
  courses as dummyCourses,
  faqs as dummyFaqs,
  fees as dummyFees,
  galleryItems as dummyGallery,
  getFallbackOrders,
  inquiries as dummyInquiries,
  orders as dummyOrders,
  progress as dummyProgress,
  students as dummyStudents,
  testimonials as dummyTestimonials,
  workshops as dummyWorkshops,
} from '../services/dummyData';

const EMPTY_LIST = [];

const useCollectionData = (getter, fallback, options = {}) => {
  const { useFallbackOnEmpty = true } = options;
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const results = await getter();
        if (!active) return;
        setData(results.length > 0 || !useFallbackOnEmpty ? results : fallback);
      } catch (error) {
        console.error('Error fetching collection:', error);
        if (active) setData(fallback);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [getter, fallback, useFallbackOnEmpty]);

  return { data, loading, setData };
};

const useStudentCollection = (getter, createFallback, options = {}) => {
  const { useFallbackOnEmpty = true } = options;
  const { user } = useAuth();
  const [data, setData] = useState(createFallback(user));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      if (!user?.email) {
        setData(createFallback(user));
        setLoading(false);
        return;
      }

      try {
        const results = await getter(user.email);
        if (!active) return;
        setData(results.length > 0 || !useFallbackOnEmpty ? results : createFallback(user));
      } catch (error) {
        console.error('Error fetching student collection:', error);
        if (active) setData(createFallback(user));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [getter, user, useFallbackOnEmpty]);

  return { data, loading, setData };
};

export const useCourses = () => {
  const { data, loading, setData } = useCollectionData(getCourses, dummyCourses);
  return {
    courses: data.map((course) => ({
      ...course,
      format: 'Offline',
    })),
    loading,
    setCourses: setData,
  };
};

export const useWorkshops = () => {
  const { data, loading, setData } = useCollectionData(getWorkshops, dummyWorkshops);
  return {
    workshops: data.map((workshop) => ({
      ...workshop,
      mode: 'Offline',
    })),
    loading,
    setWorkshops: setData,
  };
};

export const useGallery = () => {
  const { data, loading, setData } = useCollectionData(getGallery, dummyGallery);
  return { gallery: data, loading, setGallery: setData };
};

export const useGalleryCollage = () => {
  const { data, loading, setData } = useCollectionData(getGalleryCollage, EMPTY_LIST, { useFallbackOnEmpty: false });
  return { galleryCollage: data, loading, setGalleryCollage: setData };
};

export const useTestimonials = () => {
  const { data, loading } = useCollectionData(getTestimonials, dummyTestimonials);
  return { testimonials: data, loading };
};

export const useFaqs = () => {
  const { data, loading } = useCollectionData(getFaqs, dummyFaqs);
  return { faqs: data, loading };
};

export const useInquiries = () => {
  const { data, loading, setData } = useCollectionData(getInquiries, dummyInquiries);
  return { inquiries: data, loading, setInquiries: setData };
};

export const useStudents = () => {
  const { data, loading, setData } = useCollectionData(getStudents, dummyStudents);
  return { students: data, loading, setStudents: setData };
};

export const useFees = () => {
  const { data, loading, setData } = useCollectionData(getFees, dummyFees);
  return { fees: data, loading, setFees: setData };
};

export const useAttendance = () => {
  const { data, loading, setData } = useCollectionData(getAttendance, dummyAttendance);
  return { attendance: data, loading, setAttendance: setData };
};

export const useAnnouncements = () => {
  const { data, loading, setData } = useCollectionData(getAnnouncements, dummyAnnouncements);
  return { announcements: data, loading, setAnnouncements: setData };
};

export const useProgressRecords = () => {
  const { data, loading, setData } = useCollectionData(getProgressRecords, dummyProgress);
  return { progressRecords: data, loading, setProgressRecords: setData };
};

export const useOrders = () => {
  const { data, loading, setData } = useCollectionData(getOrders, dummyOrders);
  return { orders: data, loading, setOrders: setData };
};

export const useStudentProfile = () => {
  const { user } = useAuth();
  const fallback = {
    uid: user?.uid || '',
    email: user?.email || '',
    name: user?.displayName || 'Student',
    role: 'student',
    level: 'Beginner',
    enrolledCourses: [],
    workshopRegistrations: [],
    assignmentsUploaded: 0,
    certificates: 0,
    feeStatus: 'Pending',
    progressPercent: 0,
    attendanceRate: 0,
    joinedAt: '',
  };
  const { data: students, loading } = useCollectionData(getStudents, EMPTY_LIST, { useFallbackOnEmpty: false });

  return {
    student: students.find((item) => item.email === user?.email || item.uid === user?.uid) || fallback,
    loading,
  };
};

export const useStudentProgress = () => {
  const { data, loading, setData } = useStudentCollection(
    getStudentProgress,
    () => EMPTY_LIST,
    { useFallbackOnEmpty: false }
  );
  return { progress: data, loading, setProgress: setData };
};

export const useStudentOrders = () => {
  const { user } = useAuth();
  const { data, loading, setData } = useStudentCollection(
    getOrdersByStudent,
    (currentUser) => getFallbackOrders(currentUser?.email, currentUser?.displayName)
  );

  return {
    orders: data.map((order) => ({
      ...order,
      studentEmail: order.studentEmail || user?.email || 'student@example.com',
    })),
    loading,
    setOrders: setData,
  };
};

export const useStudentAttendance = () => {
  const { data, loading, setData } = useStudentCollection(
    getAttendanceByStudent,
    () => EMPTY_LIST,
    { useFallbackOnEmpty: false }
  );
  return { attendance: data, loading, setAttendance: setData };
};

export const useStudentFees = () => {
  const { data, loading, setData } = useStudentCollection(
    getFeesByStudent,
    () => EMPTY_LIST,
    { useFallbackOnEmpty: false }
  );
  return { fees: data, loading, setFees: setData };
};

export const useEnrollmentRequests = () => {
  const { data, loading, setData } = useCollectionData(getEnrollmentRequests, EMPTY_LIST, { useFallbackOnEmpty: false });
  return { enrollmentRequests: data, loading, setEnrollmentRequests: setData };
};

export const useStudentEnrollmentRequests = () => {
  const { data, loading, setData } = useStudentCollection(
    getEnrollmentRequestsByStudent,
    () => EMPTY_LIST,
    { useFallbackOnEmpty: false }
  );
  return { enrollmentRequests: data, loading, setEnrollmentRequests: setData };
};

export const useNotifications = () => {
  const { data, loading, setData } = useCollectionData(getNotifications, EMPTY_LIST, {
    useFallbackOnEmpty: false,
  });
  return { notifications: data, loading, setNotifications: setData };
};

export const useStudentNotifications = () => {
  const { user } = useAuth();
  const { notifications, loading, setNotifications } = useNotifications();

  return {
    notifications: notifications.filter(
      (item) =>
        item.studentEmail === user?.email ||
        item.studentUid === user?.uid ||
        item.audience === 'Students' ||
        item.audience === 'All Students'
    ),
    loading,
    setNotifications,
  };
};
