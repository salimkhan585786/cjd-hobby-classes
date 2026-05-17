import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import AdminOperationsPanel from '../components/AdminOperationsPanel';
import { useStudents } from '../hooks/useData';

function AdminStudents() {
  const { students, loading } = useStudents();

  if (loading) {
    return <LoadingSkeleton className="h-[480px]" />;
  }

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Students</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Profiles, progress, and attendance without the clutter.</h2>
      </section>

      <section className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Student roster</p>
        <div className="mt-6 grid gap-4">
          {students.map((student) => (
            <div key={student.id} className="rounded-3xl bg-slate-900/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{student.email}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{student.level}</span>
                  <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{student.progressPercent || 0}% progress</span>
                  <StatusPill value={student.feeStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AdminOperationsPanel mode="students" />
    </div>
  );
}

export default AdminStudents;
