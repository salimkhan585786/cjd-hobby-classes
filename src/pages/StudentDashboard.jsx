import { Award, BellRing, CalendarClock, CheckCircle2, Clock3, GraduationCap, ReceiptText, Trophy } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import {
  useAnnouncements,
  useCourses,
  useStudentAttendance,
  useStudentFees,
  useStudentProfile,
  useStudentProgress,
  useWorkshops,
} from '../hooks/useData';
import { formatCurrency, formatDate } from '../utils/helpers';

function StudentDashboard() {
  const { student, loading: studentLoading } = useStudentProfile();
  const { courses, loading: coursesLoading } = useCourses();
  const { workshops } = useWorkshops();
  const { progress, loading: progressLoading } = useStudentProgress();
  const { attendance, loading: attendanceLoading } = useStudentAttendance();
  const { fees, loading: feesLoading } = useStudentFees();
  const { announcements, loading: announcementsLoading } = useAnnouncements();

  const overallAttendance = attendance.reduce((total, item) => total + item.attended, 0);
  const overallSessions = attendance.reduce((total, item) => total + item.total, 0);
  const attendanceRate = overallSessions > 0 ? Math.round((overallAttendance / overallSessions) * 100) : student.attendanceRate;
  const totalFeeAmount = fees.reduce((total, item) => total + Number(item.amount || 0), 0);
  const totalFeePaid = fees.reduce((total, item) => total + Number(item.paid || 0), 0);
  const dueAmount = Math.max(totalFeeAmount - totalFeePaid, 0);
  const enrolledCourseCards = courses.filter((course) => student.enrolledCourses.includes(course.title));

  if (studentLoading || coursesLoading || progressLoading || attendanceLoading || feesLoading) {
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

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Enrolled classes', value: student.enrolledCourses.length, icon: GraduationCap },
          { title: 'Attendance', value: `${attendanceRate}%`, icon: CheckCircle2 },
          { title: 'Assignments uploaded', value: student.assignmentsUploaded, icon: Clock3 },
          { title: 'Certificates', value: student.certificates, icon: Trophy },
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
        <div id="classes" className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Enrolled classes</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Your active learning plan</h2>
            </div>
            <span className="rounded-full bg-violet-500/15 px-4 py-3 text-sm text-violet-200">{student.level}</span>
          </div>
          <div className="mt-8 grid gap-4">
            {enrolledCourseCards.map((course) => (
              <div key={course.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{course.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {course.duration} • {course.format}
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 lg:max-w-48">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${student.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Fee status</p>
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
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Teacher feedback</p>
          <div className="mt-8 space-y-4 text-slate-300">
            {progress.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="text-lg font-semibold text-white">{item.category}</p>
                <p className="mt-3 text-slate-300">{item.feedback}</p>
                <p className="mt-3 text-sm text-slate-400">Next step: {item.nextStep}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Progress timeline</p>
          <div className="mt-8 space-y-6">
            {progress.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.milestone}</h3>
                    <p className="text-sm text-slate-400">{item.category}</p>
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-3 py-2 text-sm text-violet-200">{item.completion}%</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${item.completion}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div id="fees" className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <ReceiptText size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Upcoming fee records</p>
          </div>
          <div className="mt-6 space-y-4">
            {fees.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{item.plan}</p>
                    <p className="text-sm text-slate-400">Due {formatDate(item.dueDate)}</p>
                  </div>
                  <StatusPill value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <CalendarClock size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Workshop registrations</p>
          </div>
          <div className="mt-6 space-y-4">
            {student.workshopRegistrations.map((title) => {
              const workshop = workshops.find((item) => item.title === title);
              return (
                <div key={title} className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-slate-400">
                    {workshop ? `${formatDate(workshop.date)} • ${workshop.mode}` : 'Confirmed seat booked'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <BellRing size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Notifications</p>
          </div>
          <div className="mt-6 space-y-4">
            {(announcementsLoading ? [] : announcements.slice(0, 3)).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex items-center gap-3 text-violet-300">
          <Award size={20} />
          <p className="text-sm uppercase tracking-[0.24em]">Attendance history</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {attendance.map((item) => {
            const monthlyRate = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0;
            return (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <p className="font-semibold text-white">{item.month}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {item.attended}/{item.total} sessions attended
                </p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${monthlyRate}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
