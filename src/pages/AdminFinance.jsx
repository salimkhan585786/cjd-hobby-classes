import { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useEnrollmentRequests, useFees, useOrders, useStudents } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import {
  approveEnrollmentRequest,
  finalizeEnrollmentRequest,
  recordEnrollmentRequestPayment,
  rejectEnrollmentRequest,
  saveFeeRecord,
} from '../services/dataService';
import { formatCurrency, formatDate } from '../utils/helpers';

function AdminFinance() {
  const { fees, loading: feesLoading, setFees } = useFees();
  const { orders, loading: ordersLoading } = useOrders();
  const { students, loading: studentsLoading } = useStudents();
  const {
    enrollmentRequests,
    loading: requestsLoading,
    setEnrollmentRequests,
  } = useEnrollmentRequests();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [requestForms, setRequestForms] = useState({});
  const [feeForm, setFeeForm] = useState({
    studentEmail: '',
    plan: '',
    amount: '',
    paid: '',
    dueDate: '',
    status: 'Pending',
  });

  const studentEmails = useMemo(
    () => students.map((s) => s.email).filter(Boolean),
    [students]
  );

  const totalRevenue = fees.reduce((sum, f) => sum + Number(f.paid || 0), 0);
  const totalOutstanding = fees.reduce(
    (sum, f) => sum + Math.max(Number(f.amount || 0) - Number(f.paid || 0), 0),
    0
  );
  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const orderRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.price || 0), 0);
  const pendingOrders = orders.filter((o) => o.status !== 'completed').length;
  const pendingRequests = enrollmentRequests.filter(
    (r) => r.requestStatus === 'Pending Approval'
  ).length;
  const overdueFees = fees.filter(
    (f) => f.status !== 'Paid' && new Date(f.dueDate) < new Date()
  ).length;

  const getRequestForm = (request) =>
    requestForms[request.id] || {
      amount: String(request.amount || 0),
      paidAmount: String(request.paidAmount || 0),
      dueDate: request.dueDate ? String(request.dueDate).slice(0, 10) : '',
      reminderDays: String(request.reminderDays || 7),
      remindersEnabled: request.remindersEnabled !== false,
    };

  const updateRequestForm = (requestId, field, value) => {
    setRequestForms((current) => ({
      ...current,
      [requestId]: { ...(current[requestId] || {}), [field]: value },
    }));
  };

  const handleRequestAction = async (request, action) => {
    const form = getRequestForm(request);
    const payload = {
      amount: Number(form.amount || request.amount || 0),
      paidAmount: Number(form.paidAmount || request.paidAmount || 0),
      dueDate: form.dueDate || request.dueDate || new Date().toISOString(),
      reminderDays: Number(form.reminderDays || request.reminderDays || 7),
      remindersEnabled: Boolean(form.remindersEnabled),
    };

    try {
      if (action === 'approve') {
        await approveEnrollmentRequest(request.id, payload);
        setEnrollmentRequests((current) =>
          current.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  ...payload,
                  outstandingAmount: Math.max(payload.amount - payload.paidAmount, 0),
                  requestStatus: 'Approved',
                  paymentStatus:
                    payload.paidAmount >= payload.amount
                      ? 'Paid'
                      : payload.paidAmount > 0
                        ? 'Partial'
                        : 'Unpaid',
                }
              : item
          )
        );
        showToast({ type: 'success', title: 'Request approved', message: `${request.itemTitle} is ready for payment.` });
        return;
      }

      if (action === 'reject') {
        await rejectEnrollmentRequest(request.id);
        setEnrollmentRequests((current) =>
          current.map((item) =>
            item.id === request.id
              ? { ...item, requestStatus: 'Rejected', paymentStatus: 'Locked' }
              : item
          )
        );
        showToast({ type: 'success', title: 'Request rejected', message: `${request.itemTitle} was rejected.` });
        return;
      }

      if (action === 'record-payment') {
        const payAmount = payload.paidAmount;
        if (payAmount <= 0) {
          showToast({ type: 'info', title: 'No amount', message: 'Enter a payment amount first.' });
          return;
        }
        await recordEnrollmentRequestPayment(request.id, payAmount, {
          dueDate: request.dueDate,
          reminderDays: request.reminderDays,
          remindersEnabled: request.remindersEnabled,
        });
        const newPaid = Math.min(Number(request.paidAmount || 0) + payAmount, payload.amount);
        setEnrollmentRequests((current) =>
          current.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  paidAmount: newPaid,
                  outstandingAmount: Math.max(payload.amount - newPaid, 0),
                  paymentStatus:
                    newPaid >= payload.amount ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid',
                  lastPaymentAt: new Date().toISOString(),
                }
              : item
          )
        );
        setFees((current) => {
          const existing = current.find((item) => item.requestId === request.id);
          if (existing) {
            return current.map((item) =>
              item.requestId === request.id
                ? { ...item, paid: newPaid, status: newPaid >= payload.amount ? 'Paid' : 'Partial' }
                : item
            );
          }
          return [
            {
              id: `local-fee-${request.id}`,
              requestId: request.id,
              studentEmail: request.studentEmail,
              plan: request.itemTitle,
              amount: payload.amount,
              paid: newPaid,
              dueDate: request.dueDate || new Date().toISOString(),
              status: newPaid >= payload.amount ? 'Paid' : 'Partial',
            },
            ...current,
          ];
        });
        showToast({ type: 'success', title: 'Payment recorded', message: `${formatCurrency(payAmount)} recorded for ${request.itemTitle}.` });
        return;
      }

      await finalizeEnrollmentRequest(request.id, payload);
      setEnrollmentRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? {
                ...item,
                ...payload,
                outstandingAmount: Math.max(payload.amount - payload.paidAmount, 0),
                requestStatus: 'Approved',
                enrolled: true,
              }
            : item
        )
      );
      showToast({ type: 'success', title: 'Student enrolled', message: `${request.studentName || request.studentEmail} enrolled in ${request.itemTitle}.` });
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Action failed', message: error.message || 'Could not complete the action.' });
    }
  };

  const handleFeeSave = async (event) => {
    event.preventDefault();
    try {
      const id = await saveFeeRecord('', feeForm);
      setFees((current) => [{ id, ...feeForm }, ...current]);
      setFeeForm({ studentEmail: '', plan: '', amount: '', paid: '', dueDate: '', status: 'Pending' });
      showToast({ type: 'success', title: 'Fee record added', message: 'New fee entry is now tracked.' });
    } catch (error) {
      console.error(error);
      showToast({ type: 'error', title: 'Fee save failed', message: 'Could not save fee record.' });
    }
  };

  if (feesLoading || ordersLoading || studentsLoading || requestsLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-40" />
        <div className="grid gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
        <LoadingSkeleton className="h-80" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'enrollment', label: 'Enrollment Requests' },
    { key: 'fees', label: 'Fee Records' },
    { key: 'orders', label: 'Art Orders' },
  ];

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Finance</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Revenue, fees, orders, and enrollment payments.</h2>
      </section>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-5 py-3 text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-violet-500 text-white'
                : 'bg-slate-900/80 text-slate-300 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: 'Revenue collected', value: formatCurrency(totalRevenue + orderRevenue), icon: DollarSign },
              { title: 'Total outstanding', value: formatCurrency(totalOutstanding), icon: AlertCircle },
              { title: 'Pending requests', value: pendingRequests, icon: Clock },
              { title: 'Pending orders', value: pendingOrders, icon: TrendingUp },
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

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Fee summary</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Total plan value</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalFees)}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Collected</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Outstanding</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalOutstanding)}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Overdue fees</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{overdueFees}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent fee entries</p>
              <div className="mt-6 space-y-4">
                {fees.length === 0 ? (
                  <EmptyState title="No fee records" description="Fee entries will appear as students enroll." />
                ) : (
                  fees.slice(0, 5).map((fee) => (
                    <div key={fee.id} className="rounded-3xl bg-slate-900/80 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{fee.plan}</p>
                          <p className="mt-1 text-sm text-slate-400">{fee.studentEmail}</p>
                        </div>
                        <StatusPill value={fee.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        {formatCurrency(fee.paid)} paid of {formatCurrency(fee.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">Due {formatDate(fee.dueDate)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'enrollment' && (
        <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Enrollment requests</p>
          <p className="mt-3 max-w-2xl text-slate-400">
            Approve requests, record payments, and enroll students from one place.
          </p>
          <div className="mt-8 space-y-4">
            {enrollmentRequests.filter((r) => r.itemType === 'course').length === 0 ? (
              <EmptyState title="No enrollment requests" description="Student enrollment requests will appear here." />
            ) : (
              enrollmentRequests
                .filter((r) => r.itemType === 'course')
                .map((request) => {
                  const form = getRequestForm(request);
                  return (
                    <div key={request.id} className="rounded-3xl bg-slate-900/80 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{request.itemTitle}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {request.studentName || request.studentEmail} - Requested {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <StatusPill value={request.requestStatus} />
                          <StatusPill value={request.paymentStatus} />
                          {request.enrolled ? <StatusPill value="Enrolled" /> : null}
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <label className="block text-xs text-slate-400">Total amount</label>
                          <input
                            value={form.amount}
                            onChange={(e) => updateRequestForm(request.id, 'amount', e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400">Paid amount</label>
                          <input
                            value={form.paidAmount}
                            onChange={(e) => updateRequestForm(request.id, 'paidAmount', e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400">Due date</label>
                          <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => updateRequestForm(request.id, 'dueDate', e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400">Reminder days</label>
                          <input
                            value={form.reminderDays}
                            onChange={(e) => updateRequestForm(request.id, 'reminderDays', e.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                          />
                        </div>
                        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(form.remindersEnabled)}
                            onChange={(e) => updateRequestForm(request.id, 'remindersEnabled', e.target.checked)}
                          />
                          Reminders
                        </label>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request, 'approve')}
                          className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request, 'enroll')}
                          className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                        >
                          Enroll
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request, 'record-payment')}
                          className="rounded-full border border-violet-400 px-5 py-3 text-sm text-violet-200 transition hover:bg-violet-500"
                        >
                          Record payment
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request, 'reject')}
                          className="rounded-full bg-rose-500/20 px-5 py-3 text-sm text-rose-200 transition hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>
      )}

      {activeTab === 'fees' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">All fee records</p>
            <div className="mt-6 space-y-4">
              {fees.length === 0 ? (
                <EmptyState title="No fee records" description="Fee entries will appear here." />
              ) : (
                fees.map((fee) => (
                  <div key={fee.id} className="rounded-3xl bg-slate-900/80 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{fee.plan}</p>
                        <p className="mt-1 text-sm text-slate-400">{fee.studentEmail}</p>
                      </div>
                      <StatusPill value={fee.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {formatCurrency(fee.paid)} paid of {formatCurrency(fee.amount)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">Due {formatDate(fee.dueDate)}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Add fee record</p>
            <form onSubmit={handleFeeSave} className="mt-6 grid gap-4">
              <div>
                <label htmlFor="fee-student-email" className="block text-sm text-slate-300">Student email</label>
                <select
                  id="fee-student-email"
                  value={feeForm.studentEmail}
                  onChange={(e) => setFeeForm((c) => ({ ...c, studentEmail: e.target.value }))}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                >
                  <option value="">Select student</option>
                  {studentEmails.map((email) => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fee-plan" className="block text-sm text-slate-300">Plan name</label>
                <input
                  id="fee-plan"
                  value={feeForm.plan}
                  onChange={(e) => setFeeForm((c) => ({ ...c, plan: e.target.value }))}
                  required
                  placeholder="e.g. Quarterly studio plan"
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="fee-amount" className="block text-sm text-slate-300">Total amount</label>
                  <input
                    id="fee-amount"
                    type="number"
                    min="0"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm((c) => ({ ...c, amount: e.target.value }))}
                    required
                    placeholder="e.g. 12500"
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="fee-paid" className="block text-sm text-slate-300">Paid amount</label>
                  <input
                    id="fee-paid"
                    type="number"
                    min="0"
                    value={feeForm.paid}
                    onChange={(e) => setFeeForm((c) => ({ ...c, paid: e.target.value }))}
                    required
                    placeholder="e.g. 8500"
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="fee-due-date" className="block text-sm text-slate-300">Due date</label>
                  <input
                    id="fee-due-date"
                    type="date"
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm((c) => ({ ...c, dueDate: e.target.value }))}
                    required
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="fee-status" className="block text-sm text-slate-300">Status</label>
                  <select
                    id="fee-status"
                    value={feeForm.status}
                    onChange={(e) => setFeeForm((c) => ({ ...c, status: e.target.value }))}
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                  >
                    {['Pending', 'Partial', 'Paid'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                Save fee record
              </button>
            </form>
          </section>
        </div>
      )}

      {activeTab === 'orders' && (
        <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Art orders revenue</p>
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <EmptyState title="No art orders" description="Art order payments will appear here." />
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{order.studentName || order.studentEmail}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {order.style} - {order.size} - {formatCurrency(order.price)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <StatusPill value={order.status} />
                      <StatusPill value={order.paymentStatus} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Ordered {formatDate(order.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminFinance;
