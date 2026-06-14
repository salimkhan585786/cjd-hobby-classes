import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ReceiptText,
  Trophy,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import {
  useAnnouncements,
  useCourses,
  useNotifications,
  useStudentAttendance,
  useStudentEnrollmentRequests,
  useStudentFees,
  useStudentProfile,
  useStudentProgress,
  useWorkshops,
} from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { initiateSecurePayment } from '../services/paymentService';
import { recordEnrollmentRequestPayment } from '../services/dataService';
import { formatCurrency, formatDate } from '../utils/helpers';

const scrollToHashTarget = (hash) => {
  if (!hash) return;

  window.requestAnimationFrame(() => {
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

function StudentDashboard() {
  const location = useLocation();
  const { showToast } = useToast();
  const { student, loading: studentLoading } = useStudentProfile();
  const { courses, loading: coursesLoading } = useCourses();
  const { workshops } = useWorkshops();
  const { progress, loading: progressLoading } = useStudentProgress();
  const { attendance, loading: attendanceLoading } = useStudentAttendance();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const { fees, loading: feesLoading, setFees } = useStudentFees();
  const {
    enrollmentRequests,
    loading: requestsLoading,
    setEnrollmentRequests,
  } = useStudentEnrollmentRequests();
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [processingPaymentId, setProcessingPaymentId] = useState('');

  useEffect(() => {
    scrollToHashTarget(location.hash);
  }, [location.hash]);

  const overallAttendance = attendance.reduce((total, item) => total + Number(item.attended || 0), 0);
  const overallSessions = attendance.reduce((total, item) => total + Number(item.total || 0), 0);
  const attendanceRate =
    overallSessions > 0 ? Math.round((overallAttendance / overallSessions) * 100) : Number(student.attendanceRate || 0);
  const totalFeeAmount = fees.reduce((total, item) => total + Number(item.amount || 0), 0);
  const totalFeePaid = fees.reduce((total, item) => total + Number(item.paid || 0), 0);
  const dueAmount = Math.max(totalFeeAmount - totalFeePaid, 0);

  const enrolledCourseCards = useMemo(
    () => courses.filter((course) => (student.enrolledCourses || []).includes(course.title)),
    [courses, student.enrolledCourses]
  );

  const courseRequests = useMemo(
    () => enrollmentRequests.filter((item) => item.itemType === 'course'),
    [enrollmentRequests]
  );
  const approvedRequests = useMemo(
    () => courseRequests.filter((item) => item.requestStatus === 'Approved'),
    [courseRequests]
  );
  const pendingRequests = useMemo(
    () => courseRequests.filter((item) => item.requestStatus === 'Pending Approval'),
    [courseRequests]
  );

  const handlePaymentChange = (requestId, value) => {
    setPaymentAmounts((current) => ({ ...current, [requestId]: value }));
  };

  const handlePayNow = async (request) => {
    const outstanding = Math.max(Number(request.outstandingAmount ?? request.amount ?? 0), 0);
    const enteredAmount = Number(paymentAmounts[request.id] || outstanding);
    const amountToPay = Math.min(Math.max(enteredAmount, 0), outstanding);

    if (amountToPay <= 0) {
      showToast({
        type: 'info',
        title: 'Enter payment amount',
        message: 'Choose a valid amount before opening checkout.',
      });
      return;
    }

    try {
      setProcessingPaymentId(request.id);
      await initiateSecurePayment({
        amount: amountToPay,
        email: student.email,
        name: student.name,
        orderId: request.id,
        notes: {
          requestId: request.id,
          course: request.itemTitle,
          itemType: request.itemType,
        },
        onSuccess: async (paymentResponse) => {
          await recordEnrollmentRequestPayment(request.id, amountToPay, {
            dueDate: request.dueDate,
            reminderDays: request.reminderDays,
            remindersEnabled: request.remindersEnabled,
          });

          const nextPaid = Math.min(Number(request.paidAmount || 0) + amountToPay, Number(request.amount || 0));
          const nextOutstanding = Math.max(Number(request.amount || 0) - nextPaid, 0);
          const nextPaymentStatus = nextPaid >= Number(request.amount || 0) ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Unpaid';
          const nextFeeStatus = nextPaid >= Number(request.amount || 0) ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Pending';

          setEnrollmentRequests((current) =>
            current.map((item) =>
              item.id === request.id
                ? {
                    ...item,
                    paidAmount: nextPaid,
                    outstandingAmount: nextOutstanding,
                    paymentStatus: nextPaymentStatus,
                    enrolled: nextPaid > 0 ? true : item.enrolled,
                    lastPaymentAt: new Date().toISOString(),
                    paymentId: paymentResponse.razorpay_payment_id,
                  }
                : item
            )
          );

          setFees((current) => {
            const existing = current.find((item) => item.requestId === request.id);

            if (existing) {
              return current.map((item) =>
                item.requestId === request.id
                  ? {
                      ...item,
                      paid: nextPaid,
                      status: nextFeeStatus,
                    }
                  : item
              );
            }

            return [
              {
                id: `local-fee-${request.id}`,
                requestId: request.id,
                studentEmail: request.studentEmail,
                studentUid: request.studentUid,
                plan: request.itemTitle,
                amount: Number(request.amount || 0),
                paid: nextPaid,
                dueDate: request.dueDate || new Date().toISOString(),
                status: nextFeeStatus,
              },
              ...current,
            ];
          });

          setPaymentAmounts((current) => ({ ...current, [request.id]: '' }));
        },
        onDismiss: () => {
          showToast({
            type: 'info',
            title: 'Payment cancelled',
            message: 'You can try again anytime from the fees page.',
          });
        },
      });

      showToast({
        type: 'success',
        title: 'Payment captured',
        message: 'Your course payment was saved successfully.',
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Payment failed',
        message: error?.message || 'The payment could not be completed right now.',
      });
    } finally {
      setProcessingPaymentId('');
    }
  };

  if (
    studentLoading ||
    coursesLoading ||
    progressLoading ||
    attendanceLoading ||
    feesLoading ||
    requestsLoading ||
    notificationsLoading
  ) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-32" />
        <div className="grid gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <LoadingSkeleton className="h-80" />
          <LoadingSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  const recentStudentNotifications = notifications
    .filter(
      (item) =>
        item.studentEmail === student.email ||
        item.studentUid === student.uid ||
        item.audience === 'Students' ||
        item.audience === 'All Students'
    )
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 3);
  const announcementKeys = new Set(
    recentStudentNotifications
      .filter((item) => item.type === 'admin-announcement')
      .map((item) => `${item.title}::${item.message}`)
  );
  const previewNotifications = [
    ...recentStudentNotifications,
    ...announcements.filter((item) => !announcementKeys.has(`${item.title}::${item.message}`)),
  ]
    .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Enrolled classes', value: student.enrolledCourses?.length || 0, icon: GraduationCap },
          { title: 'Attendance', value: `${attendanceRate}%`, icon: CheckCircle2 },
          { title: 'Assignments uploaded', value: student.assignmentsUploaded || 0, icon: Clock3 },
          { title: 'Certificates', value: student.certificates || 0, icon: Trophy },
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section id="classes" className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Classes page</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Your classes and enrollment requests</h2>
            </div>
            <span className="rounded-full bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{student.level || 'Beginner'}</span>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Active enrolled classes</p>
              <div className="mt-4 grid gap-4">
                {enrolledCourseCards.length === 0 ? (
                  <EmptyState
                    title="No enrolled classes"
                    description="Approved requests with payment activity will appear here once enrollment starts."
                    action={
                      <Link to="/courses" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                        Browse courses
                      </Link>
                    }
                  />
                ) : (
                  enrolledCourseCards.map((course) => (
                    <div key={course.id} className="rounded-3xl bg-slate-900/80 p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{course.title}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            {course.duration} • {course.format}
                          </p>
                        </div>
                        <StatusPill value="Enrolled" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Requested classes</p>
              <div className="mt-4 grid gap-4">
                {courseRequests.length === 0 ? (
                  <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">No requests yet.</div>
                ) : (
                  courseRequests.map((request) => (
                    <div key={request.id} className="rounded-3xl bg-slate-900/80 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{request.itemTitle}</p>
                          <p className="mt-1 text-sm text-slate-400">
                            Requested on {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <StatusPill value={request.requestStatus} />
                          <StatusPill value={request.paymentStatus} />
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-300">
                        {request.requestStatus === 'Pending Approval'
                          ? 'Payment will unlock after the admin approves this request.'
                          : request.enrolled
                            ? 'You are enrolled in this class.'
                            : 'This request is approved and ready for payment.'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Fee snapshot</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Payments and receipts</h2>
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Total plan amount</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalFeeAmount)}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Paid so far</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(totalFeePaid)}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Balance due</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(dueAmount)}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Pending approvals</p>
              <p className="mt-2 text-2xl font-semibold text-white">{pendingRequests.length}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Teacher feedback</p>
          <div className="mt-8 space-y-4 text-slate-300">
            {progress.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">NO DATA</div>
            ) : (
              progress.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-lg font-semibold text-white">{item.category}</p>
                  <p className="mt-3 text-slate-300">{item.feedback || 'NO DATA'}</p>
                  <p className="mt-3 text-sm text-slate-400">Next step: {item.nextStep || 'NO DATA'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Progress timeline</p>
          <div className="mt-8 space-y-6">
            {progress.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">NO DATA</div>
            ) : (
              progress.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.milestone || 'NO DATA'}</h3>
                      <p className="text-sm text-slate-400">{item.category || 'NO DATA'}</p>
                    </div>
                    <span className="rounded-full bg-violet-500/10 px-3 py-2 text-sm text-violet-200">{Number(item.completion || 0)}%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${Number(item.completion || 0)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section id="fees" className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft lg:col-span-2">
          <div className="flex items-center gap-3 text-violet-300">
            <ReceiptText size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Fees page</p>
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-white">Approved payments, pending dues, and reminders</h2>
          <div className="mt-6 space-y-4">
            {approvedRequests.length === 0 ? (
              <EmptyState
                title="No approved fee records"
                description="Once the admin approves a request, your payment plan and reminder details will appear here."
              />
            ) : (
              approvedRequests.map((request) => {
                const outstanding = Math.max(Number(request.outstandingAmount ?? request.amount ?? 0), 0);
                const suggestedAmount = paymentAmounts[request.id] || (outstanding > 0 ? String(outstanding) : '');

                return (
                  <div key={request.id} className="rounded-3xl bg-slate-900/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{request.itemTitle}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Total {formatCurrency(request.amount)} • Paid {formatCurrency(request.paidAmount)} • Outstanding {formatCurrency(outstanding)}
                        </p>
                        <p className="mt-3 text-sm text-slate-400">
                          Due {formatDate(request.dueDate)} • Reminder every {request.reminderDays || 7} day(s)
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <StatusPill value={request.requestStatus} />
                        <StatusPill value={request.paymentStatus} />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                      <div>
                        <label htmlFor={`payment-${request.id}`} className="block text-xs text-slate-400">Payment amount</label>
                        <input
                          id={`payment-${request.id}`}
                          type="number"
                          min="1"
                          max={outstanding || undefined}
                          value={suggestedAmount}
                          onChange={(event) => handlePaymentChange(request.id, event.target.value)}
                          disabled={outstanding <= 0 || request.paymentStatus === 'Locked'}
                          placeholder="Enter amount"
                          className="mt-1 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePayNow(request)}
                        disabled={processingPaymentId === request.id || outstanding <= 0 || request.paymentStatus === 'Locked'}
                        className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
                      >
                        {outstanding <= 0 ? 'Fully paid' : processingPaymentId === request.id ? 'Opening checkout...' : 'Pay now'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <div className="flex items-center gap-3 text-violet-300">
              <CalendarClock size={20} />
              <p className="text-sm uppercase tracking-[0.24em]">Workshop registrations</p>
            </div>
            <div className="mt-6 space-y-4">
              {(student.workshopRegistrations || []).length === 0 ? (
                <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">NO DATA</div>
              ) : (
                student.workshopRegistrations.map((title) => {
                  const workshop = workshops.find((item) => item.title === title);
                  return (
                    <div key={title} className="rounded-3xl bg-slate-900/80 p-5">
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-sm text-slate-400">
                        {workshop ? `${formatDate(workshop.date)} • ${workshop.mode}` : 'Confirmed seat booked'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <div className="flex items-center gap-3 text-violet-300">
              <BellRing size={20} />
              <p className="text-sm uppercase tracking-[0.24em]">Notifications</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-400">Latest admin updates and payment activity</p>
              <Link to="/student/notifications" className="text-sm font-semibold text-violet-200 transition hover:text-violet-100">
                View all
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {(announcementsLoading ? [] : previewNotifications).length === 0 ? (
                <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">NO DATA</div>
              ) : (
                previewNotifications.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex items-center gap-3 text-violet-300">
          <Award size={20} />
          <p className="text-sm uppercase tracking-[0.24em]">Attendance history</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {attendance.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="font-semibold text-white">Current summary</p>
              <p className="mt-2 text-sm text-slate-400">{attendanceRate}% attendance recorded on your profile.</p>
            </div>
          ) : (
            attendance.map((item) => {
              const monthlyRate = Number(item.total || 0) > 0 ? Math.round((Number(item.attended || 0) / Number(item.total || 0)) * 100) : 0;
              return (
                <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="font-semibold text-white">{item.month || 'NO DATA'}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {Number(item.attended || 0)}/{Number(item.total || 0)} sessions attended
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${monthlyRate}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
