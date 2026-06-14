import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, ClipboardList, DollarSign, ShoppingBag, Users2, Wallet } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  useAnnouncements,
  useEnrollmentRequests,
  useFees,
  useInquiries,
  useOrders,
  useStudents,
} from '../hooks/useData';
import { formatCurrency } from '../utils/helpers';

const adminLinks = [
  {
    title: 'Catalog',
    description: 'Courses, workshops, and gallery items are managed here.',
    to: '/admin/catalog',
    icon: BookOpen,
  },
  {
    title: 'Students',
    description: 'Manage student profiles, progress, and attendance.',
    to: '/admin/students',
    icon: Users2,
  },
  {
    title: 'Orders',
    description: 'Track art orders and payment progress.',
    to: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Inquiries',
    description: 'Reply to leads and publish announcements.',
    to: '/admin/inquiries',
    icon: ClipboardList,
  },
  {
    title: 'Finance',
    description: 'Approve requests, track dues, and manage reminders.',
    to: '/admin/finance',
    icon: Wallet,
  },
];

function AdminDashboard() {
  const { students, loading: studentsLoading } = useStudents();
  const { inquiries, loading: inquiriesLoading } = useInquiries();
  const { orders, loading: ordersLoading } = useOrders();
  const { fees, loading: feesLoading } = useFees();
  const { enrollmentRequests, loading: requestsLoading } = useEnrollmentRequests();
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  const totalRevenue = fees.reduce((sum, item) => sum + Number(item.paid || 0), 0);
  const totalOutstanding = fees.reduce(
    (sum, item) => sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0),
    0
  );
  const openOrders = orders.filter((item) => item.status !== 'completed').length;
  const pendingRequests = enrollmentRequests.filter((item) => item.requestStatus === 'Pending Approval').length;

  if (
    studentsLoading ||
    inquiriesLoading ||
    ordersLoading ||
    feesLoading ||
    requestsLoading ||
    announcementsLoading
  ) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-40" />
        <div className="grid gap-6 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-32" />
          ))}
        </div>
        <LoadingSkeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Overview</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">A cleaner admin home for quick decisions.</h2>
          </div>
          <p className="max-w-2xl text-slate-400">
            Each control area now has its own page, so this overview stays focused on health, workload, and what needs attention next.
          </p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active students', value: students.length, icon: Users2 },
          { title: 'Open inquiries', value: inquiries.filter((item) => item.status === 'new').length, icon: ClipboardList },
          { title: 'Revenue collected', value: formatCurrency(totalRevenue), icon: DollarSign },
          { title: 'Open orders', value: openOrders, icon: BarChart3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
              <div className="flex items-center gap-3 text-violet-300">
                <Icon size={22} />
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-slate-400">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Admin Sections</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 transition hover:border-violet-400 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-3 text-violet-300">
                    <Icon size={20} />
                    <p className="font-semibold text-white">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Needs Attention</p>
          <div className="mt-6 space-y-4">
            {[
              `${pendingRequests} enrollment requests waiting for approval`,
              `${formatCurrency(totalOutstanding)} still outstanding in fee tracking`,
              `${announcements.length} active announcements are published`,
            ].map((note) => (
              <div key={note} className="rounded-3xl bg-slate-900/80 p-5 text-slate-300">
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
