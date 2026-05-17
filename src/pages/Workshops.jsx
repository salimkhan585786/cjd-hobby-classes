import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import WorkshopCard from '../components/WorkshopCard';
import { useAuth } from '../hooks/useAuth';
import { useStudentProfile, useWorkshops } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { registerStudentForWorkshop } from '../services/dataService';
import { calculateCountdown, formatDate } from '../utils/helpers';

function Workshops() {
  const { workshops, loading } = useWorkshops();
  const { user, role } = useAuth();
  const { student } = useStudentProfile();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const upcomingWorkshop = useMemo(
    () =>
      [...workshops]
        .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
        .find((workshop) => new Date(workshop.date).getTime() > Date.now()) || workshops[0],
    [workshops]
  );
  const [countdown, setCountdown] = useState(() =>
    upcomingWorkshop ? calculateCountdown(upcomingWorkshop.date) : calculateCountdown(Date.now())
  );
  const [processingWorkshop, setProcessingWorkshop] = useState('');

  useEffect(() => {
    if (!upcomingWorkshop) return undefined;

    const updateCountdown = () => {
      setCountdown(calculateCountdown(upcomingWorkshop.date));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [upcomingWorkshop]);

  const handleWorkshopAction = async (workshop) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (role !== 'student') {
      navigate('/admin');
      return;
    }

    try {
      setProcessingWorkshop(workshop.id);
      await registerStudentForWorkshop({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        workshop,
      });
      showToast({
        type: 'success',
        title: 'Workshop reserved',
        message: `${workshop.title} has been added to your student dashboard.`,
      });
      navigate('/student');
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: error.message || 'This workshop could not be reserved.',
      });
    } finally {
      setProcessingWorkshop('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-14">
      <div className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Upcoming events</p>
          <h1 className="text-5xl font-semibold text-white">Offline workshops for every creative learner.</h1>
          <p className="max-w-xl text-slate-400">
            From portrait labs to studio craft sessions, these limited events help students practice with expert guidance and community energy.
          </p>
        </div>
        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Next studio registration</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">{upcomingWorkshop?.title || 'Workshop update coming soon'}</h2>
          <p className="mt-4 text-slate-400">
            {upcomingWorkshop
              ? `Reserve your seat for ${formatDate(upcomingWorkshop.date)} and unlock premium step-by-step instruction with expert feedback.`
              : 'New studio events will appear here as soon as the next workshop batch is published.'}
          </p>
          <div className="mt-8 grid grid-cols-4 gap-3 rounded-3xl bg-slate-900/80 p-4 text-center text-white">
            {[
              { label: 'Days', value: countdown.days },
              { label: 'Hours', value: countdown.hours },
              { label: 'Mins', value: countdown.minutes },
              { label: 'Secs', value: countdown.seconds },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-950/80 px-3 py-4">
                <p className="text-2xl font-semibold">{String(item.value).padStart(2, '0')}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-72" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState title="No workshops scheduled yet" description="Check back soon or contact the academy to request a private group workshop." />
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {workshops.map((workshop) => {
            const alreadyRegistered = student?.workshopRegistrations?.includes(workshop.title);
            const actionLabel = !user
              ? 'Join now'
              : role !== 'student'
                ? 'Admin view'
                : alreadyRegistered
                  ? 'Registered'
                  : Number(workshop.seats || 0) <= 0
                    ? 'Full'
                    : 'Register';

            return (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                onAction={handleWorkshopAction}
                actionLabel={actionLabel}
                actionDisabled={Boolean(processingWorkshop) || alreadyRegistered || Number(workshop.seats || 0) <= 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Workshops;
