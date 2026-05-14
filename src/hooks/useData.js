import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getAnnouncements,
  getAttendance,
  getAttendanceByStudent,
  getCourses,
  getFaqs,
  getFees,
  getFeesByStudent,
  getGallery,
  getInquiries,
  getOrders,
  getOrdersByStudent,
  getStudentProgress,
  getStudents,
  getTestimonials,
  getWorkshops,
} from '../services/dataService';
import {
  announcements as dummyAnnouncements,
  attendance as dummyAttendance,
  courses as dummyCourses,
  faqs as dummyFaqs,
  fees as dummyFees,
  galleryItems as dummyGallery,
  getFallbackAttendance,
  getFallbackFees,
  getFallbackOrders,
  getFallbackProgress,
  getFallbackStudent,
  inquiries as dummyInquiries,
  orders as dummyOrders,
  students as dummyStudents,
  testimonials as dummyTestimonials,
  workshops as dummyWorkshops,
} from '../services/dummyData';

const useCollectionData = (getter, fallback) => {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const results = await getter();
        if (!active) return;
        setData(results.length > 0 ? results : fallback);
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
  }, [getter, fallback]);

  return { data, loading, setData };
};

const useStudentCollection = (getter, createFallback) => {
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
        setData(results.length > 0 ? results : createFallback(user));
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
  }, [getter, user]);

  return { data, loading, setData };
};

export const useCourses = () => {
  const { data, loading, setData } = useCollectionData(getCourses, dummyCourses);
  return { courses: data, loading, setCourses: setData };
};

export const useWorkshops = () => {
  const { data, loading, setData } = useCollectionData(getWorkshops, dummyWorkshops);
  return { workshops: data, loading, setWorkshops: setData };
};

export const useGallery = () => {
  const { data, loading, setData } = useCollectionData(getGallery, dummyGallery);
  return { gallery: data, loading, setGallery: setData };
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

export const useOrders = () => {
  const { data, loading, setData } = useCollectionData(getOrders, dummyOrders);
  return { orders: data, loading, setOrders: setData };
};

export const useStudentProfile = () => {
  const { user } = useAuth();
  const fallback = getFallbackStudent(user?.email, user?.displayName);
  const { students, loading } = useStudents();

  return {
    student: students.find((item) => item.email === user?.email || item.uid === user?.uid) || fallback,
    loading,
  };
};

export const useStudentProgress = () => {
  const { data, loading, setData } = useStudentCollection(
    getStudentProgress,
    (user) => getFallbackProgress(user?.email)
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
    (user) => getFallbackAttendance(user?.email)
  );
  return { attendance: data, loading, setAttendance: setData };
};

export const useStudentFees = () => {
  const { data, loading, setData } = useStudentCollection(
    getFeesByStudent,
    (user) => getFallbackFees(user?.email)
  );
  return { fees: data, loading, setFees: setData };
};
