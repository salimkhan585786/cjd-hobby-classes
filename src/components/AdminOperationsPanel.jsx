import { useMemo, useState } from 'react';
import { useAttendance, useEnrollmentRequests, useFees, useProgressRecords, useStudents } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import {
  approveEnrollmentRequest,
  finalizeEnrollmentRequest,
  rejectEnrollmentRequest,
  saveAttendanceRecord,
  saveFeeRecord,
  saveProgressRecord,
  saveStudentRecord,
} from '../services/dataService';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSkeleton from './LoadingSkeleton';
import StatusPill from './StatusPill';

const createEmptyFeeForm = () => ({
  studentEmail: '',
  plan: '',
  amount: '',
  paid: '',
  dueDate: '',
  status: 'Pending',
});

const createEmptyAttendanceForm = () => ({
  studentEmail: '',
  month: '',
  attended: '',
  total: '',
});

const createEmptyProgressForm = () => ({
  studentEmail: '',
  category: '',
  milestone: '',
  nextStep: '',
  feedback: '',
  completion: '',
});

function StudentEditor({ student, onSave }) {
  const [form, setForm] = useState({
    level: student.level || 'Beginner',
    feeStatus: student.feeStatus || 'Pending',
    assignmentsUploaded: String(student.assignmentsUploaded || 0),
    certificates: String(student.certificates || 0),
    progressPercent: String(student.progressPercent || 0),
    attendanceRate: String(student.attendanceRate || 0),
  });

  return (
    <div className="rounded-3xl bg-slate-900/80 p-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{student.name}</p>
          <p className="text-sm text-slate-400">{student.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill value={form.feeStatus} />
          <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300">{form.level}</span>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor={`student-level-${student.id}`} className="block text-xs text-slate-400">Level</label>
          <select
            id={`student-level-${student.id}`}
            value={form.level}
            onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          >
            {['Beginner', 'Intermediate', 'Advanced', 'Elementary', 'Kids'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`student-fee-${student.id}`} className="block text-xs text-slate-400">Fee status</label>
          <select
            id={`student-fee-${student.id}`}
            value={form.feeStatus}
            onChange={(event) => setForm((current) => ({ ...current, feeStatus: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          >
            {['Pending', 'Partial', 'Paid'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`student-progress-${student.id}`} className="block text-xs text-slate-400">Progress %</label>
          <input
            id={`student-progress-${student.id}`}
            type="number"
            min="0"
            max="100"
            value={form.progressPercent}
            onChange={(event) => setForm((current) => ({ ...current, progressPercent: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor={`student-attendance-${student.id}`} className="block text-xs text-slate-400">Attendance %</label>
          <input
            id={`student-attendance-${student.id}`}
            type="number"
            min="0"
            max="100"
            value={form.attendanceRate}
            onChange={(event) => setForm((current) => ({ ...current, attendanceRate: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor={`student-assignments-${student.id}`} className="block text-xs text-slate-400">Assignments uploaded</label>
          <input
            id={`student-assignments-${student.id}`}
            type="number"
            min="0"
            value={form.assignmentsUploaded}
            onChange={(event) => setForm((current) => ({ ...current, assignmentsUploaded: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          />
        </div>
        <div>
          <label htmlFor={`student-certificates-${student.id}`} className="block text-xs text-slate-400">Certificates</label>
          <input
            id={`student-certificates-${student.id}`}
            type="number"
            min="0"
            value={form.certificates}
            onChange={(event) => setForm((current) => ({ ...current, certificates: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onSave(student, form)}
        className="mt-4 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
      >
        Save student updates
      </button>
    </div>
  );
}

function AdminOperationsPanel({ mode = 'all' }) {
  const { students, loading: studentsLoading, setStudents } = useStudents();
  const { fees, loading: feesLoading, setFees } = useFees();
  const {
    enrollmentRequests,
    loading: requestsLoading,
    setEnrollmentRequests,
  } = useEnrollmentRequests();
  const { attendance, loading: attendanceLoading, setAttendance } = useAttendance();
  const { progressRecords, loading: progressLoading, setProgressRecords } = useProgressRecords();
  const { showToast } = useToast();

  const [feeForm, setFeeForm] = useState(createEmptyFeeForm());
  const [attendanceForm, setAttendanceForm] = useState(createEmptyAttendanceForm());
  const [progressForm, setProgressForm] = useState(createEmptyProgressForm());
  const [requestForms, setRequestForms] = useState({});

  const studentEmails = useMemo(
    () => students.map((student) => student.email).filter(Boolean),
    [students]
  );
  const showFinance = mode === 'all' || mode === 'finance';
  const showStudents = mode === 'all' || mode === 'students';

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
      [requestId]: {
        ...(current[requestId] || {}),
        [field]: value,
      },
    }));
  };

  const syncLocalRequestState = (requestId, nextData) => {
    setEnrollmentRequests((current) =>
      current.map((item) =>
        item.id === requestId
          ? {
              ...item,
              ...nextData,
            }
          : item
      )
    );
  };

  const syncLocalFeeState = (requestId, request, nextData) => {
    const amount = Number(nextData.amount ?? request.amount ?? 0);
    const paid = Number(nextData.paidAmount ?? request.paidAmount ?? 0);
    const status = paid >= amount ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

    setFees((current) => {
      const existing = current.find((item) => item.requestId === requestId);

      if (existing) {
        return current.map((item) =>
          item.requestId === requestId
            ? {
                ...item,
                amount,
                paid,
                dueDate: nextData.dueDate || request.dueDate || item.dueDate,
                status,
                reminderDays: Number(nextData.reminderDays ?? request.reminderDays ?? item.reminderDays ?? 7),
                remindersEnabled: Boolean(
                  nextData.remindersEnabled ?? request.remindersEnabled ?? item.remindersEnabled ?? true
                ),
              }
            : item
        );
      }

      return [
        {
          id: `local-fee-${requestId}`,
          requestId,
          studentEmail: request.studentEmail,
          studentUid: request.studentUid,
          plan: request.itemTitle,
          amount,
          paid,
          dueDate: nextData.dueDate || request.dueDate || new Date().toISOString(),
          status,
          reminderDays: Number(nextData.reminderDays ?? request.reminderDays ?? 7),
          remindersEnabled: Boolean(nextData.remindersEnabled ?? request.remindersEnabled ?? true),
        },
        ...current,
      ];
    });
  };

  const syncLocalStudentEnrollment = (request) => {
    setStudents((current) =>
      current.map((item) =>
        item.uid === request.studentUid || item.email === request.studentEmail
          ? {
              ...item,
              enrolledCourses: Array.from(new Set([...(item.enrolledCourses || []), request.itemTitle])),
            }
          : item
      )
    );
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
        syncLocalRequestState(request.id, {
          ...payload,
          outstandingAmount: Math.max(payload.amount - payload.paidAmount, 0),
          requestStatus: 'Approved',
          paymentStatus: payload.paidAmount >= payload.amount ? 'Paid' : payload.paidAmount > 0 ? 'Partial' : 'Unpaid',
        });
        syncLocalFeeState(request.id, request, payload);
        if (payload.paidAmount > 0) {
          syncLocalStudentEnrollment(request);
        }
        showToast({
          type: 'success',
          title: 'Request approved',
          message: `${request.itemTitle} is now ready for payment.`,
        });
        return;
      }

      if (action === 'reject') {
        await rejectEnrollmentRequest(request.id);
        syncLocalRequestState(request.id, {
          requestStatus: 'Rejected',
          paymentStatus: 'Locked',
        });
        showToast({
          type: 'success',
          title: 'Request rejected',
          message: `${request.itemTitle} was marked as rejected.`,
        });
        return;
      }

      await finalizeEnrollmentRequest(request.id, payload);
      syncLocalRequestState(request.id, {
        ...payload,
        outstandingAmount: Math.max(payload.amount - payload.paidAmount, 0),
        requestStatus: request.requestStatus === 'Rejected' ? 'Approved' : request.requestStatus || 'Approved',
        paymentStatus: payload.paidAmount >= payload.amount ? 'Paid' : payload.paidAmount > 0 ? 'Partial' : 'Unpaid',
        enrolled: true,
      });
      syncLocalFeeState(request.id, request, payload);
      syncLocalStudentEnrollment(request);
      showToast({
        type: 'success',
        title: 'Student enrolled',
        message: `${request.studentName || request.studentEmail} has been enrolled in ${request.itemTitle}.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Request update failed',
        message: error.message || 'The enrollment request could not be updated.',
      });
    }
  };

  const handleStudentSave = async (student, form) => {
    const payload = {
      ...student,
      ...form,
    };

    try {
      const targetId = student.uid || student.id;
      await saveStudentRecord(targetId, payload);
      setStudents((current) =>
        current.map((item) =>
          item.id === student.id || item.uid === student.uid ? { ...item, ...payload } : item
        )
      );
      showToast({
        type: 'success',
        title: 'Student updated',
        message: `${student.name} now has updated dashboard stats.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Student update failed',
        message: 'The student record could not be saved.',
      });
    }
  };

  const handleFeeSave = async (event) => {
    event.preventDefault();

    try {
      const id = await saveFeeRecord('', feeForm);
      setFees((current) => [{ id, ...feeForm }, ...current]);
      setFeeForm(createEmptyFeeForm());
      showToast({
        type: 'success',
        title: 'Fee record added',
        message: 'The fee entry is now available in finance tracking.',
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Fee record failed',
        message: 'The fee record could not be saved.',
      });
    }
  };

  const handleAttendanceSave = async (event) => {
    event.preventDefault();

    try {
      const id = await saveAttendanceRecord('', attendanceForm);
      setAttendance((current) => [{ id, ...attendanceForm }, ...current]);
      setAttendanceForm(createEmptyAttendanceForm());
      showToast({
        type: 'success',
        title: 'Attendance saved',
        message: 'The monthly attendance record has been created.',
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Attendance failed',
        message: 'The attendance record could not be saved.',
      });
    }
  };

  const handleProgressSave = async (event) => {
    event.preventDefault();

    try {
      const id = await saveProgressRecord('', progressForm);
      setProgressRecords((current) => [{ id, ...progressForm }, ...current]);
      setProgressForm(createEmptyProgressForm());
      showToast({
        type: 'success',
        title: 'Progress milestone added',
        message: 'The student progress record has been updated.',
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Progress save failed',
        message: 'The progress entry could not be stored.',
      });
    }
  };

  if (studentsLoading || feesLoading || requestsLoading || attendanceLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-64" />
        <LoadingSkeleton className="h-64" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {showFinance ? (
      <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Enrollment request control</p>
        <p className="mt-3 max-w-2xl text-slate-400">
          Approve student requests, unlock payments, enroll manually, and manage fee reminders from one place.
        </p>
        <div className="mt-8 space-y-4">
          {enrollmentRequests.length === 0 ? (
            <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">No enrollment requests yet.</div>
          ) : (
            enrollmentRequests
              .filter((request) => request.itemType === 'course')
              .map((request) => {
                const form = getRequestForm(request);

                return (
                  <div key={request.id} className="rounded-3xl bg-slate-900/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{request.itemTitle}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {request.studentName || request.studentEmail} • Requested {formatDate(request.createdAt)}
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
                        <label htmlFor={`req-amount-${request.id}`} className="block text-xs text-slate-400">Total amount</label>
                        <input
                          id={`req-amount-${request.id}`}
                          value={form.amount}
                          onChange={(event) => updateRequestForm(request.id, 'amount', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor={`req-paid-${request.id}`} className="block text-xs text-slate-400">Paid amount</label>
                        <input
                          id={`req-paid-${request.id}`}
                          value={form.paidAmount}
                          onChange={(event) => updateRequestForm(request.id, 'paidAmount', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor={`req-due-${request.id}`} className="block text-xs text-slate-400">Due date</label>
                        <input
                          id={`req-due-${request.id}`}
                          type="date"
                          value={form.dueDate}
                          onChange={(event) => updateRequestForm(request.id, 'dueDate', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor={`req-reminder-${request.id}`} className="block text-xs text-slate-400">Reminder days</label>
                        <input
                          id={`req-reminder-${request.id}`}
                          type="number"
                          min="1"
                          value={form.reminderDays}
                          onChange={(event) => updateRequestForm(request.id, 'reminderDays', event.target.value)}
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-slate-100"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={Boolean(form.remindersEnabled)}
                          onChange={(event) => updateRequestForm(request.id, 'remindersEnabled', event.target.checked)}
                        />
                        Reminders enabled
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'approve')}
                        className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                      >
                        Approve request
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'enroll')}
                        className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                      >
                        Enroll student
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
      ) : null}

      {showStudents ? (
      <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student operations</p>
        <p className="mt-3 max-w-2xl text-slate-400">
          Update level, attendance, progress percentage, certificates, and fee status for each student directly from the admin area.
        </p>
        <div className="mt-8 space-y-4">
          {students.map((student) => (
            <StudentEditor key={student.id} student={student} onSave={handleStudentSave} />
          ))}
        </div>
      </section>
      ) : null}

      {showStudents ? (
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Add fee record</p>
          <form onSubmit={handleFeeSave} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="fee-record-email" className="block text-sm text-slate-300">Student email</label>
              <select
                id="fee-record-email"
                value={feeForm.studentEmail}
                onChange={(event) => setFeeForm((current) => ({ ...current, studentEmail: event.target.value }))}
                required
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                <option value="">Select student email</option>
                {studentEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fee-record-plan" className="block text-sm text-slate-300">Plan name</label>
              <input
                id="fee-record-plan"
                value={feeForm.plan}
                onChange={(event) => setFeeForm((current) => ({ ...current, plan: event.target.value }))}
                required
                placeholder="e.g. Quarterly studio plan"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="fee-record-amount" className="block text-sm text-slate-300">Total amount</label>
                <input
                  id="fee-record-amount"
                  type="number"
                  min="0"
                  value={feeForm.amount}
                  onChange={(event) => setFeeForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="fee-record-paid" className="block text-sm text-slate-300">Paid amount</label>
                <input
                  id="fee-record-paid"
                  type="number"
                  min="0"
                  value={feeForm.paid}
                  onChange={(event) => setFeeForm((current) => ({ ...current, paid: event.target.value }))}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="fee-record-due" className="block text-sm text-slate-300">Due date</label>
              <input
                id="fee-record-due"
                type="date"
                value={feeForm.dueDate}
                onChange={(event) => setFeeForm((current) => ({ ...current, dueDate: event.target.value }))}
                required
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="fee-record-status" className="block text-sm text-slate-300">Status</label>
              <select
                id="fee-record-status"
                value={feeForm.status}
                onChange={(event) => setFeeForm((current) => ({ ...current, status: event.target.value }))}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                {['Pending', 'Partial', 'Paid'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Save fee entry</button>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Add attendance</p>
          <form onSubmit={handleAttendanceSave} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="att-student-email" className="block text-sm text-slate-300">Student email</label>
              <select
                id="att-student-email"
                value={attendanceForm.studentEmail}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, studentEmail: event.target.value }))}
                required
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                <option value="">Select student email</option>
                {studentEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="att-month" className="block text-sm text-slate-300">Month</label>
              <input
                id="att-month"
                value={attendanceForm.month}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, month: event.target.value }))}
                required
                placeholder="e.g. Jun 2026"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="att-attended" className="block text-sm text-slate-300">Attended sessions</label>
                <input
                  id="att-attended"
                  type="number"
                  min="0"
                  value={attendanceForm.attended}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, attended: event.target.value }))}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="att-total" className="block text-sm text-slate-300">Total sessions</label>
                <input
                  id="att-total"
                  type="number"
                  min="1"
                  value={attendanceForm.total}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, total: event.target.value }))}
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
                />
              </div>
            </div>
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Save attendance</button>
          </form>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Add progress milestone</p>
          <form onSubmit={handleProgressSave} className="mt-6 grid gap-4">
            <div>
              <label htmlFor="prog-student-email" className="block text-sm text-slate-300">Student email</label>
              <select
                id="prog-student-email"
                value={progressForm.studentEmail}
                onChange={(event) => setProgressForm((current) => ({ ...current, studentEmail: event.target.value }))}
                required
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              >
                <option value="">Select student email</option>
                {studentEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="prog-category" className="block text-sm text-slate-300">Course category</label>
              <input
                id="prog-category"
                value={progressForm.category}
                onChange={(event) => setProgressForm((current) => ({ ...current, category: event.target.value }))}
                required
                placeholder="e.g. Intermediate"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prog-milestone" className="block text-sm text-slate-300">Milestone</label>
              <input
                id="prog-milestone"
                value={progressForm.milestone}
                onChange={(event) => setProgressForm((current) => ({ ...current, milestone: event.target.value }))}
                required
                placeholder="e.g. Portfolio review"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prog-next-step" className="block text-sm text-slate-300">Next step</label>
              <input
                id="prog-next-step"
                value={progressForm.nextStep}
                onChange={(event) => setProgressForm((current) => ({ ...current, nextStep: event.target.value }))}
                required
                placeholder="e.g. Value contrast study"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prog-completion" className="block text-sm text-slate-300">Completion %</label>
              <input
                id="prog-completion"
                type="number"
                min="0"
                max="100"
                value={progressForm.completion}
                onChange={(event) => setProgressForm((current) => ({ ...current, completion: event.target.value }))}
                required
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="prog-feedback" className="block text-sm text-slate-300">Mentor feedback</label>
              <textarea
                id="prog-feedback"
                value={progressForm.feedback}
                onChange={(event) => setProgressForm((current) => ({ ...current, feedback: event.target.value }))}
                rows="4"
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100"
              />
            </div>
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Save progress</button>
          </form>
        </div>
      </section>
      ) : null}

      {showFinance ? (
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent fee entries</p>
          <div className="mt-6 space-y-4">
            {fees.slice(0, 5).map((fee) => (
              <div key={fee.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="font-semibold text-white">{fee.plan}</p>
                <p className="mt-1 text-sm text-slate-400">{fee.studentEmail}</p>
                <p className="mt-3 text-sm text-slate-300">
                  {formatCurrency(fee.paid)} paid of {formatCurrency(fee.amount)}
                </p>
                <p className="mt-1 text-sm text-slate-400">Due {formatDate(fee.dueDate)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent attendance</p>
          <div className="mt-6 space-y-4">
            {attendance.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="font-semibold text-white">{item.studentEmail}</p>
                <p className="mt-1 text-sm text-slate-400">{item.month}</p>
                <p className="mt-3 text-sm text-slate-300">
                  {item.attended}/{item.total} sessions attended
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent progress</p>
          <div className="mt-6 space-y-4">
            {progressRecords.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="font-semibold text-white">{item.studentEmail}</p>
                <p className="mt-1 text-sm text-slate-400">{item.category}</p>
                <p className="mt-3 text-sm text-slate-300">{item.milestone}</p>
                <p className="mt-2 text-sm text-slate-400">{item.completion}% complete</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      ) : null}
    </div>
  );
}

export default AdminOperationsPanel;
