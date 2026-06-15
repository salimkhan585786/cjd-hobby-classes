import { useState } from 'react';
import { BellRing, BookOpen, ClipboardList, ExternalLink, LayoutDashboard, Menu, ShoppingBag, Sparkles, Users, Wallet, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { classNames } from '../utils/helpers';

const itemsByRole = {
  student: [
    { label: 'Overview', to: '/student', icon: LayoutDashboard },
    { label: 'Orders', to: '/student/orders', icon: ShoppingBag },
    { label: 'Progress', to: '/student/progress', icon: Sparkles },
    { label: 'Notifications', to: '/student/notifications', icon: BellRing },
  ],
  admin: [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Catalog', to: '/admin/catalog', icon: BookOpen },
    { label: 'Students', to: '/admin/students', icon: Users },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Inquiries', to: '/admin/inquiries', icon: ClipboardList },
    { label: 'Finance', to: '/admin/finance', icon: Wallet },
  ],
};

function DashboardSidebar({ role = 'student' }) {
  const location = useLocation();
  const items = itemsByRole[role] || itemsByRole.student;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-400 xl:hidden"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        {mobileOpen ? 'Close' : 'Menu'}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={classNames(
          'fixed inset-x-0 bottom-0 z-40 rounded-t-[2rem] border-t border-white/10 bg-slate-950/98 p-6 shadow-soft transition-transform duration-300 xl:hidden',
          mobileOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="rounded-3xl bg-violet-500/10 p-4">
            <h2 className="text-sm uppercase tracking-[0.24em] text-violet-300">
              {role === 'admin' ? 'Admin control' : 'Student hub'}
            </h2>
          </div>

          <nav className="grid grid-cols-2 gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={classNames(
                    'flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition',
                    isActive ? 'bg-violet-500/15 text-violet-100' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex gap-3">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
            >
              <ExternalLink size={16} /> Website
            </Link>
          </div>
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft xl:block">
        <div className="space-y-4">
          <div className="rounded-3xl bg-violet-500/10 p-4">
            <h2 className="text-sm uppercase tracking-[0.24em] text-violet-300">
              {role === 'admin' ? 'Admin control' : 'Student hub'}
            </h2>
            <p className="mt-3 text-slate-200">
              {role === 'admin'
                ? 'Manage courses, students, fees, inquiries, and art orders from one dashboard.'
                : 'Track classes, progress, fee status, workshops, and custom art requests in one place.'}
            </p>
          </div>

          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={classNames(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                    isActive ? 'bg-violet-500/15 text-violet-100' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default DashboardSidebar;
