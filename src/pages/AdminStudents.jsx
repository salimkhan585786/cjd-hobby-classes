import { useState } from 'react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import AdminOperationsPanel from '../components/AdminOperationsPanel';
import { useStudents } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { resetLoginPin } from '../firebase/authService';

function AdminStudents() {
  const { students, loading } = useStudents();
  const { showToast } = useToast();
  const [resettingId, setResettingId] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(null);

  const handleResetPin = async (student) => {
    if (newPin.length !== 4) {
      showToast({ type: 'error', title: 'Invalid PIN', message: 'PIN must be exactly 4 digits.' });
      return;
    }

    setResettingId(student.id);
    try {
      const uid = student.uid || student.id;
      await resetLoginPin(uid, newPin);
      setNewPin('');
      setShowPinModal(null);
      showToast({
        type: 'success',
        title: 'PIN reset successful',
        message: `New PIN for ${student.name} is ${newPin}. Share it with the student.`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'PIN reset failed',
        message: err.message || 'Could not reset PIN.',
      });
    } finally {
      setResettingId(null);
    }
  };

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
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{student.level}</span>
                  <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">{student.progressPercent || 0}% progress</span>
                  <StatusPill value={student.feeStatus} />
                  <button
                    type="button"
                    onClick={() => setShowPinModal(student)}
                    className="rounded-full bg-violet-500/20 px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-500/30"
                  >
                    Reset PIN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PIN Reset Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setShowPinModal(null); setNewPin(''); }}>
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Reset PIN</p>
            <h3 className="mt-3 text-lg font-semibold text-white">Set new PIN for {showPinModal.name}</h3>
            <p className="mt-2 text-sm text-slate-400">Share the new PIN with the student via WhatsApp or call.</p>
            <div className="mt-6">
              <label className="block text-sm text-slate-300">New 4-digit PIN</label>
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                value={newPin}
                onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ''))}
                autoFocus
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowPinModal(null); setNewPin(''); }}
                className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResetPin(showPinModal)}
                disabled={resettingId === showPinModal.id || newPin.length !== 4}
                className="flex-1 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
              >
                {resettingId === showPinModal.id ? 'Saving...' : 'Save PIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminOperationsPanel mode="students" />
    </div>
  );
}

export default AdminStudents;
