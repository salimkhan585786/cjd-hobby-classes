import { BellRing, CircleAlert, CreditCard, Megaphone } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useAnnouncements, useStudentEnrollmentRequests, useStudentFees, useStudentNotifications } from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/helpers';

const iconByType = {
  approval: BellRing,
  'payment-confirmation': CreditCard,
  'admin-announcement': Megaphone,
  reminder: CircleAlert,
};

function NotificationCard({ title, message, createdAt, status, type }) {
  const Icon = iconByType[type] || BellRing;

  return (
    <div className="rounded-3xl bg-slate-900/80 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="mt-1 rounded-2xl bg-violet-500/10 p-3 text-violet-300">
            <Icon size={18} />
          </div>
          <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm text-slate-300">{message}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              {formatDate(createdAt)} 
            </p>
          </div>
        </div>
        {status ? <StatusPill value={status} /> : null}
      </div>
    </div>
  );
}

function StudentNotifications() {
  const { notifications, loading: notificationsLoading } = useStudentNotifications();
  const { announcements, loading: announcementsLoading } = useAnnouncements();
  const { fees, loading: feesLoading } = useStudentFees();
  const { enrollmentRequests, loading: requestsLoading } = useStudentEnrollmentRequests();

  if (notificationsLoading || announcementsLoading || feesLoading || requestsLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-80" />
      </div>
    );
  }

  const reminderNotifications = enrollmentRequests
    .filter((item) => item.requestStatus === 'Approved' && Number(item.outstandingAmount || 0) > 0)
    .map((item) => {
      const matchingFee = fees.find((fee) => fee.requestId === item.id);
      return {
        id: `reminder-${item.id}`,
        type: 'reminder',
        title: `Payment reminder for ${item.itemTitle}`,
        message: `Outstanding ${formatCurrency(item.outstandingAmount)}. Due ${formatDate(
          matchingFee?.dueDate || item.dueDate
        )}. Reminder every ${item.reminderDays || 7} day(s).`,
        createdAt: matchingFee?.updatedAt || item.updatedAt || item.createdAt,
        status: matchingFee?.status || item.paymentStatus,
      };
    });

  const existingAnnouncementKeys = new Set(
    notifications
      .filter((item) => item.type === 'admin-announcement')
      .map((item) => `${item.title}::${item.message}`)
  );

  const announcementNotifications = announcements
    .filter((item) => !existingAnnouncementKeys.has(`${item.title}::${item.message}`))
    .map((item) => ({
      id: `announcement-${item.id}`,
      type: 'admin-announcement',
      title: item.title,
      message: item.message,
      createdAt: item.createdAt,
      status: item.audience,
    }));

  const mergedNotifications = [...notifications, ...announcementNotifications, ...reminderNotifications]
    .filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index
    )
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex items-center gap-3 text-violet-300">
          <BellRing size={20} />
          <p className="text-sm uppercase tracking-[0.24em]">Notifications</p>
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Admin updates, payment reminders, and confirmations.</h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          These notifications stay available here, so important announcements and payment updates do not disappear from the student panel.
        </p>
      </section>

      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="space-y-4">
          {mergedNotifications.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">NO DATA</div>
          ) : (
            mergedNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                title={item.title}
                message={item.message}
                createdAt={item.createdAt}
                status={item.status}
                type={item.type}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentNotifications;
