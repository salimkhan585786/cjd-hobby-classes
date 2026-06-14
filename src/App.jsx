import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import About from './pages/About';
import AdminCatalog from './pages/AdminCatalog';
import AdminDashboard from './pages/AdminDashboard';
import AdminInquiries from './pages/AdminInquiries';
import AdminStudents from './pages/AdminStudents';
import ArtOrder from './pages/ArtOrder';
import Contact from './pages/Contact';
import CourseDetails from './pages/CourseDetails';
import Courses from './pages/Courses';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Progress from './pages/Progress';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentNotifications from './pages/StudentNotifications';
import Workshops from './pages/Workshops';
import AdminFinance from './pages/AdminFinance';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <ToastProvider>
        <div
          key={location.pathname}
          className="animate-fade-in"
        >
          <Routes>
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:courseSlug" element={<CourseDetails />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="workshops" element={<Workshops />} />
                <Route path="contact" element={<Contact />} />
                <Route path="order" element={<ArtOrder />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>

              <Route
                path="/student"
                element={
                  <ProtectedRoute role="student">
                    <DashboardLayout role="student" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="orders" element={<ArtOrder />} />
                <Route path="progress" element={<Progress />} />
                <Route path="notifications" element={<StudentNotifications />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <DashboardLayout role="admin" />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="catalog" element={<AdminCatalog />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="orders" element={<ArtOrder />} />
                <Route path="progress" element={<Progress />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
