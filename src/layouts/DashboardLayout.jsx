import { Bell, LogOut } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function DashboardLayout({ role }) {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast({
      type: 'success',
      title: 'Signed out',
      message: 'You have been logged out safely.',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl gap-6 xl:gap-8">
        <DashboardSidebar role={role} />
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Welcome back</p>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  {role === 'admin' ? 'Admin Portal' : 'Student Hub'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <Bell size={16} /> Notifications
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-3 text-sm text-white transition hover:bg-violet-400"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-300">
              <span className="rounded-2xl bg-white/5 px-4 py-3">Signed in as {user?.email || 'guest'}</span>
              <span className="rounded-2xl bg-white/5 px-4 py-3 capitalize">Role: {role}</span>
              <Link
                to={role === 'admin' ? '/admin/orders' : '/student/orders'}
                className="rounded-2xl bg-violet-500 px-4 py-3 text-white transition hover:bg-violet-400"
              >
                {role === 'admin' ? 'Manage orders' : 'My orders'}
              </Link>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
