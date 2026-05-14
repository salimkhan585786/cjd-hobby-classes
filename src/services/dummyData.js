export const heroStats = [
  { label: 'Students enrolled', value: '1.8K+' },
  { label: 'Artworks created', value: '4.5K+' },
  { label: 'Workshops held', value: '42' },
];

export const courses = [
  {
    id: 'course-pencil-sketching',
    title: 'Pencil Sketching',
    slug: 'pencil-sketching',
    description: 'Build line confidence, proportion control, and expressive shading through guided studio practice.',
    duration: '6 weeks',
    price: 4900,
    level: 'Beginner',
    format: 'Live hybrid',
    image: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-watercolor',
    title: 'Watercolor',
    slug: 'watercolor',
    description: 'Master washes, layering, and luminous color palettes in a premium watercolor studio track.',
    duration: '8 weeks',
    price: 6200,
    level: 'Intermediate',
    format: 'Studio + online',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-oil-painting',
    title: 'Oil Painting',
    slug: 'oil-painting',
    description: 'Learn composition, glazing, and texture while creating gallery-style finished canvases.',
    duration: '10 weeks',
    price: 8400,
    level: 'Advanced',
    format: 'Studio intensive',
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-digital-art',
    title: 'Digital Art',
    slug: 'digital-art',
    description: 'Explore illustration workflows, stylized rendering, and portfolio-ready digital painting pieces.',
    duration: '5 weeks',
    price: 5600,
    level: 'All levels',
    format: 'Online live',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-kids-drawing',
    title: 'Kids Drawing',
    slug: 'kids-drawing',
    description: 'A joyful creative track for young artists built around observation, imagination, and confidence.',
    duration: '4 weeks',
    price: 3800,
    level: 'Kids',
    format: 'Weekend batches',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-portrait-drawing',
    title: 'Portrait Drawing',
    slug: 'portrait-drawing',
    description: 'Train likeness, facial structure, and value control through mentor-led portrait sessions.',
    duration: '7 weeks',
    price: 6800,
    level: 'Intermediate',
    format: 'Mentor guided',
    image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'course-anime-art',
    title: 'Anime Art',
    slug: 'anime-art',
    description: 'Create expressive characters, dynamic poses, and polished anime-inspired storytelling scenes.',
    duration: '5 weeks',
    price: 5400,
    level: 'Beginner',
    format: 'Online live',
    image: 'https://images.unsplash.com/photo-1513346940220-0bbadb48d20a?auto=format&fit=crop&w=900&q=80',
  },
];

export const galleryItems = [
  {
    id: 'gallery-portrait-poise',
    category: 'Sketch',
    title: 'Portrait Poise',
    artist: 'Ava Collins',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=90',
    medium: 'Graphite on textured paper',
    mentor: 'Rhea Sharma',
    details: 'A tonal portrait study focused on soft transitions and anatomical structure.',
  },
  {
    id: 'gallery-sunset-bloom',
    category: 'Watercolor',
    title: 'Sunset Bloom',
    artist: 'Ethan Park',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=90',
    medium: 'Watercolor and ink',
    mentor: 'Mira Joshi',
    details: 'A floral composition designed to practice layering, bloom effects, and warm harmony.',
  },
  {
    id: 'gallery-golden-dream',
    category: 'Oil',
    title: 'Golden Dream',
    artist: 'Maya Reed',
    image: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=900&q=90',
    medium: 'Oil on canvas',
    mentor: 'Liam Dsouza',
    details: 'A moody landscape with emphasis on glazing and atmospheric light.',
  },
  {
    id: 'gallery-neon-muse',
    category: 'Digital',
    title: 'Neon Muse',
    artist: 'Noah James',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=90',
    medium: 'Digital painting',
    mentor: 'Sana Verma',
    details: 'A cinematic digital portrait exploring rim lighting and stylized color blocking.',
  },
  {
    id: 'gallery-rainbow-garden',
    category: 'Kids',
    title: 'Rainbow Garden',
    artist: 'Lila Mathew',
    image: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=900&q=90',
    medium: 'Poster color',
    mentor: 'Anita Roy',
    details: 'A playful botanical piece from our kids drawing showcase.',
  },
  {
    id: 'gallery-dream-sail',
    category: 'Anime',
    title: 'Dream Sail',
    artist: 'Ravi Menon',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=90',
    medium: 'Ink and markers',
    mentor: 'Ira Nanda',
    details: 'An anime scene built around perspective, costume design, and dramatic storytelling.',
  },
];

export const workshops = [
  {
    id: 'workshop-portrait-lab',
    title: 'Weekend Portrait Lab',
    date: '2026-06-16T10:00:00+05:30',
    seats: 8,
    price: 2400,
    mode: 'In studio',
    description: 'A premium portrait workshop focused on gesture, likeness, and expressive shading.',
  },
  {
    id: 'workshop-watercolor-fundamentals',
    title: 'Watercolor Fundamentals',
    date: '2026-07-02T16:00:00+05:30',
    seats: 12,
    price: 2100,
    mode: 'Online live',
    description: 'Build watercolor confidence with layered washes, edge control, and guided feedback.',
  },
  {
    id: 'workshop-digital-character-design',
    title: 'Digital Character Design',
    date: '2026-08-08T11:00:00+05:30',
    seats: 10,
    price: 2900,
    mode: 'Hybrid',
    description: 'Create expressive characters using silhouette, color scripting, and rendering workflows.',
  },
];

export const testimonials = [
  {
    name: 'Sofia Reed',
    role: 'Student',
    feedback: 'I grew faster in my drawing skills than I ever thought possible. The classes feel personal and inspiring.',
  },
  {
    name: 'Jasper Lin',
    role: 'Parent',
    feedback: 'The kids program is beautiful, creative, and professional. My daughter looks forward to every session.',
  },
  {
    name: 'Mira Patel',
    role: 'Artist',
    feedback: 'The workshop experience is premium and engaging. I leave with new ideas and finished pieces I am proud of.',
  },
];

export const faqs = [
  {
    question: 'Can a beginner join the academy?',
    answer: 'Yes. We offer beginner-first lessons, recorded recap support, and tailored feedback in every foundation course.',
  },
  {
    question: 'Do you offer online and offline classes?',
    answer: 'Yes. Students can choose online live classes, in-studio batches, or hybrid workshop experiences.',
  },
  {
    question: 'How can I order a custom portrait?',
    answer: 'Visit the art order page, choose a style and size, upload a reference, and complete checkout to confirm your request.',
  },
  {
    question: 'How are fees tracked?',
    answer: 'Students can review fee status inside their dashboard, while admins can monitor dues, receipts, and payment milestones.',
  },
];

export const students = [
  {
    id: 'student-001',
    uid: 'demo-student-001',
    name: 'Ava Collins',
    email: 'student@example.com',
    role: 'student',
    level: 'Intermediate',
    enrolledCourses: ['Portrait Drawing', 'Watercolor', 'Digital Art'],
    workshopRegistrations: ['Weekend Portrait Lab', 'Watercolor Fundamentals'],
    assignmentsUploaded: 24,
    certificates: 3,
    feeStatus: 'Partial',
    progressPercent: 76,
    attendanceRate: 92,
    joinedAt: '2025-11-14T10:00:00+05:30',
  },
  {
    id: 'student-002',
    uid: 'demo-student-002',
    name: 'Ravi Menon',
    email: 'ravi@example.com',
    role: 'student',
    level: 'Beginner',
    enrolledCourses: ['Anime Art', 'Pencil Sketching'],
    workshopRegistrations: ['Digital Character Design'],
    assignmentsUploaded: 11,
    certificates: 1,
    feeStatus: 'Paid',
    progressPercent: 58,
    attendanceRate: 88,
    joinedAt: '2026-01-10T10:00:00+05:30',
  },
];

export const attendance = [
  { id: 'attendance-001', studentEmail: 'student@example.com', month: 'Apr 2026', attended: 11, total: 12 },
  { id: 'attendance-002', studentEmail: 'student@example.com', month: 'May 2026', attended: 10, total: 11 },
  { id: 'attendance-003', studentEmail: 'student@example.com', month: 'Jun 2026', attended: 6, total: 7 },
  { id: 'attendance-004', studentEmail: 'ravi@example.com', month: 'May 2026', attended: 7, total: 8 },
];

export const fees = [
  {
    id: 'fee-001',
    studentEmail: 'student@example.com',
    plan: 'Quarterly studio plan',
    dueDate: '2026-05-28T10:00:00+05:30',
    amount: 12500,
    paid: 8500,
    status: 'Partial',
  },
  {
    id: 'fee-002',
    studentEmail: 'student@example.com',
    plan: 'Workshop bundle',
    dueDate: '2026-06-12T10:00:00+05:30',
    amount: 3800,
    paid: 3800,
    status: 'Paid',
  },
  {
    id: 'fee-003',
    studentEmail: 'ravi@example.com',
    plan: 'Starter online plan',
    dueDate: '2026-05-21T10:00:00+05:30',
    amount: 7200,
    paid: 7200,
    status: 'Paid',
  },
];

export const announcements = [
  {
    id: 'announcement-001',
    title: 'Portfolio review week starts Monday',
    message: 'Upload your best two pieces before Monday evening for mentor review slots.',
    audience: 'Students',
    createdAt: '2026-05-12T09:00:00+05:30',
  },
  {
    id: 'announcement-002',
    title: 'New watercolor workshop seats released',
    message: 'A final batch of weekend seats has been opened for the July watercolor intensive.',
    audience: 'Public',
    createdAt: '2026-05-10T09:00:00+05:30',
  },
];

export const progress = [
  {
    id: 'progress-001',
    studentEmail: 'student@example.com',
    category: 'Pencil Sketching',
    completion: 72,
    milestone: 'Portfolio review',
    nextStep: 'Value contrast study',
    feedback: 'Your likeness work is strong. Push edge variety and highlights in the next portrait.',
  },
  {
    id: 'progress-002',
    studentEmail: 'student@example.com',
    category: 'Watercolor',
    completion: 58,
    milestone: 'Wash technique practice',
    nextStep: 'Landscape layering exercise',
    feedback: 'Your color selection is elegant. Keep practicing controlled wet-on-wet transitions.',
  },
  {
    id: 'progress-003',
    studentEmail: 'student@example.com',
    category: 'Digital Art',
    completion: 83,
    milestone: 'Character rendering',
    nextStep: 'Final showcase piece',
    feedback: 'Your rendering depth has improved. Spend more time on composition thumbnails before painting.',
  },
  {
    id: 'progress-004',
    studentEmail: 'ravi@example.com',
    category: 'Anime Art',
    completion: 61,
    milestone: 'Pose sheet review',
    nextStep: 'Turnaround character sheet',
    feedback: 'The expressions are lively. Focus on hand anatomy for the next submission.',
  },
];

export const inquiries = [
  {
    id: 'inquiry-001',
    name: 'Nina Park',
    email: 'nina.park@mail.com',
    phone: '+91 98765 43210',
    interest: 'Kids Drawing',
    message: 'I want to enroll my child in the kids drawing course for the summer batch.',
    status: 'new',
    createdAt: '2026-05-13T15:00:00+05:30',
  },
  {
    id: 'inquiry-002',
    name: 'Marco Lee',
    email: 'marco.lee@mail.com',
    phone: '+91 99887 66554',
    interest: 'Workshops',
    message: 'Do you have evening workshop slots available for working professionals?',
    status: 'contacted',
    createdAt: '2026-05-11T13:00:00+05:30',
  },
];

export const orders = [
  {
    id: 'order-001',
    studentId: 'demo-student-001',
    studentName: 'Ava Collins',
    studentEmail: 'student@example.com',
    phone: '+91 90000 11223',
    style: 'Portrait',
    size: 'A4',
    price: 6500,
    description: 'Custom portrait with soft shading and warm neutral tones.',
    referenceUrl: '',
    status: 'in-progress',
    paymentStatus: 'paid',
    deliveryStatus: 'proof shared',
    createdAt: '2026-05-08T14:00:00+05:30',
  },
  {
    id: 'order-002',
    studentId: 'demo-student-001',
    studentName: 'Ava Collins',
    studentEmail: 'student@example.com',
    phone: '+91 90000 11223',
    style: 'Sketch',
    size: 'A3',
    price: 4200,
    description: 'Charcoal family portrait commission.',
    referenceUrl: '',
    status: 'pending',
    paymentStatus: 'pending',
    deliveryStatus: 'awaiting payment',
    createdAt: '2026-05-12T11:00:00+05:30',
  },
  {
    id: 'order-003',
    studentId: 'demo-student-002',
    studentName: 'Ravi Menon',
    studentEmail: 'ravi@example.com',
    phone: '+91 90123 45678',
    style: 'Painting',
    size: 'A3',
    price: 8900,
    description: 'Landscape painting based on travel reference images.',
    referenceUrl: '',
    status: 'completed',
    paymentStatus: 'paid',
    deliveryStatus: 'delivered',
    createdAt: '2026-04-26T16:00:00+05:30',
  },
];

export const getFallbackStudent = (email, name = 'Creative Student') =>
  students.find((student) => student.email === email) || {
    id: `student-fallback-${email || 'guest'}`,
    uid: null,
    name,
    email: email || 'student@example.com',
    role: 'student',
    level: 'Beginner',
    enrolledCourses: ['Pencil Sketching', 'Digital Art'],
    workshopRegistrations: ['Watercolor Fundamentals'],
    assignmentsUploaded: 8,
    certificates: 0,
    feeStatus: 'Pending',
    progressPercent: 42,
    attendanceRate: 86,
    joinedAt: new Date().toISOString(),
  };

export const getFallbackProgress = (email) => {
  const entries = progress.filter((item) => item.studentEmail === email);
  if (entries.length > 0) return entries;

  return [
    {
      id: `progress-fallback-${email || 'guest'}`,
      studentEmail: email || 'student@example.com',
      category: 'Foundation Drawing',
      completion: 46,
      milestone: 'Shape and shading practice',
      nextStep: 'Portrait block-in exercise',
      feedback: 'You are building strong basics. Keep your sketchbook rhythm consistent this week.',
    },
  ];
};

export const getFallbackOrders = (email, name = 'Creative Student') => {
  const entries = orders.filter((item) => item.studentEmail === email);
  if (entries.length > 0) return entries;

  if (!email) return [];

  return [];
};

export const getFallbackAttendance = (email) => {
  const entries = attendance.filter((item) => item.studentEmail === email);
  if (entries.length > 0) return entries;

  return [
    { id: `attendance-fallback-${email || 'guest'}`, studentEmail: email || 'student@example.com', month: 'May 2026', attended: 7, total: 8 },
  ];
};

export const getFallbackFees = (email) => {
  const entries = fees.filter((item) => item.studentEmail === email);
  if (entries.length > 0) return entries;

  return [
    {
      id: `fee-fallback-${email || 'guest'}`,
      studentEmail: email || 'student@example.com',
      plan: 'Starter art membership',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
      amount: 5400,
      paid: 2700,
      status: 'Partial',
    },
  ];
};
