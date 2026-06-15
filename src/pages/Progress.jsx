import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../hooks/useAuth';
import { useStudentProfile, useStudentProgress, useStudents } from '../hooks/useData';

function StudentProgressView() {
  const { progress, loading } = useStudentProgress();
  const { student, loading: studentLoading } = useStudentProfile();

  if (loading || studentLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-32" />
        <div className="grid gap-6 md:grid-cols-3">
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
          <LoadingSkeleton className="h-32" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Progress</p>
            <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Student learning progress and milestones.</h1>
          </div>
          <p className="max-w-xl text-slate-400">
            Track course completion, teacher feedback, certificates, and portfolio milestones through one polished progress view.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Overall progress', value: `${student.progressPercent || 0}%` },
          { label: 'Attendance', value: `${student.attendanceRate || 0}%` },
          { label: 'Certificates', value: student.certificates || 0 },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.18em] text-violet-300">{item.label}</p>
            <p className="mt-4 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">{item.value}</p>
          </div>
        ))}
      </div>

      {progress.length === 0 ? (
        <EmptyState
          title="No milestone records yet"
          description="Your overall progress summary is up to date. Detailed mentor milestones will appear here after the next review entry."
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">Skill growth</h2>
            <div className="mt-8 grid gap-4">
              {progress.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{item.category}</p>
                    <span className="rounded-full bg-violet-500/10 px-3 py-2 text-sm text-violet-200">{item.completion}%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${item.completion}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Next step: {item.nextStep}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">Achievement timeline</h2>
            <div className="mt-8 space-y-6">
              {progress.map((item) => (
                <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white sm:text-lg">{item.milestone}</p>
                      <p className="text-sm text-slate-400">{item.feedback}</p>
                    </div>
                    <StatusPill value={item.completion >= 80 ? 'completed' : 'in-progress'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminProgressView() {
  const { students, loading } = useStudents();

  if (loading) {
    return <LoadingSkeleton className="h-80" />;
  }

  return (
    <div className="space-y-10">
      <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student showcase progress</p>
            <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">Track how each learner is moving across the academy.</h1>
          </div>
          <p className="max-w-xl text-slate-400">
            Use this view to monitor attendance, course completion, fee status, and readiness for the next showcase cycle.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {students.map((student) => (
          <div key={student.id} className="glass-card rounded-[2rem] border border-white/10 p-6 shadow-soft">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
              <div>
                <p className="text-xl font-semibold text-white">{student.name}</p>
                <p className="mt-1 text-sm text-slate-400">{student.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                Attendance {student.attendanceRate}%
              </div>
              <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                Certificates {student.certificates}
              </div>
              <StatusPill value={student.feeStatus} />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-violet-500" style={{ width: `${student.progressPercent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Progress() {
  const { role } = useAuth();

  return role === 'admin' ? <AdminProgressView /> : <StudentProgressView />;
}

export default Progress;
