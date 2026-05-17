import { BellRing, BookOpen, ClipboardList, LayoutDashboard, ShoppingBag, Sparkles, Users, Wallet } from 'lucide-react';
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

  return (
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
  );
}

export default DashboardSidebar;
