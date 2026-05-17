import { DollarSign, Wallet } from 'lucide-react';
import AdminOperationsPanel from '../components/AdminOperationsPanel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useEnrollmentRequests, useFees } from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/helpers';

function AdminFinance() {
  const { fees, loading: feesLoading } = useFees();
  const { enrollmentRequests, loading: requestsLoading } = useEnrollmentRequests();

  const totalRevenue = fees.reduce((sum, item) => sum + Number(item.paid || 0), 0);
  const totalOutstanding = fees.reduce(
    (sum, item) => sum + Math.max(Number(item.amount || 0) - Number(item.paid || 0), 0),
    0
  );
  const pendingApprovals = enrollmentRequests.filter((item) => item.requestStatus === 'Pending Approval').length;

  if (feesLoading || requestsLoading) {
    return <LoadingSkeleton className="h-[480px]" />;
  }

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Finance</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Approvals, dues, reminders, and fee records.</h2>
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Collected', value: formatCurrency(totalRevenue), icon: DollarSign },
          { label: 'Outstanding', value: formatCurrency(totalOutstanding), icon: Wallet },
          { label: 'Pending approvals', value: pendingApprovals, icon: Wallet },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
              <div className="flex items-center gap-3 text-violet-300">
                <Icon size={20} />
              </div>
              <p className="mt-5 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-2 text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Fee tracking</p>
        <div className="mt-6 grid gap-4">
          {fees.map((fee) => (
            <div key={fee.id} className="rounded-3xl bg-slate-900/80 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
                <div>
                  <p className="font-semibold text-white">{fee.studentEmail}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {fee.plan} {fee.reminderDays ? `• Reminder ${fee.reminderDays}d` : ''}
                  </p>
                </div>
                <p className="text-sm text-slate-300">{formatCurrency(fee.paid)} paid</p>
                <p className="text-sm text-slate-300">Due {formatDate(fee.dueDate)}</p>
                <StatusPill value={fee.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdminOperationsPanel mode="finance" />
    </div>
  );
}

export default AdminFinance;
