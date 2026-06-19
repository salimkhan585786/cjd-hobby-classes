import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useWorkshops } from '../hooks/useData';
import { calculateCountdown, formatDate } from '../utils/helpers';
import { FadeInView, ParallaxSection, StaggerContainer, StaggerItem, FloatingElement, ZoomParallax, TiltCard } from '../components/Animation';

function Events() {
  const { workshops, loading } = useWorkshops();
  const navigate = useNavigate();
  const now = Date.now();

  const upcomingEvents = useMemo(
    () =>
      [...workshops]
        .filter((e) => new Date(e.date).getTime() > now)
        .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()),
    [workshops, now]
  );

  const pastEvents = useMemo(
    () =>
      [...workshops]
        .filter((e) => new Date(e.date).getTime() <= now)
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
    [workshops, now]
  );

  const nextEvent = upcomingEvents[0] || null;

  const [countdown, setCountdown] = useState(() =>
    nextEvent ? calculateCountdown(nextEvent.date) : calculateCountdown(Date.now())
  );

  useEffect(() => {
    if (!nextEvent) return undefined;

    const updateCountdown = () => {
      setCountdown(calculateCountdown(nextEvent.date));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextEvent]);

  const handleEventAction = () => {
    navigate('/contact?topic=event');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <div className="mb-6 sm:mb-10 grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FadeInView direction="left" className="space-y-3 sm:space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Upcoming events</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">Offline events for every creative learner.</h1>
          <p className="max-w-xl text-sm text-slate-400 sm:text-base">
            From portrait labs to studio craft sessions, these limited events help students practice with expert guidance and community energy.
          </p>
        </FadeInView>
        <FadeInView direction="right">
          <div className="glass-card relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-5 sm:p-6 md:p-8 shadow-soft">
            <FloatingElement className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl sm:-right-8 sm:-top-8 sm:h-32 sm:w-32" duration={5} />
            <p className="relative text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Next event will be held</p>
            <h2 className="relative mt-3 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">{nextEvent?.title || 'Event update coming soon'}</h2>
            <p className="relative mt-3 text-sm text-slate-400 sm:text-base">
              {nextEvent
                ? `Reserve your seat for ${formatDate(nextEvent.date)} and unlock premium step-by-step instruction with expert feedback.`
                : 'New events will appear here as soon as the next batch is published.'}
            </p>
            <div className="relative mt-6 grid grid-cols-4 gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-slate-900/80 p-3 sm:p-4 text-center text-white">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Mins', value: countdown.minutes },
                { label: 'Secs', value: countdown.seconds },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl sm:rounded-2xl bg-slate-950/80 px-2 py-3 sm:px-3 sm:py-4"
                >
                  <p className="text-xl font-semibold sm:text-2xl">{String(item.value).padStart(2, '0')}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:text-xs">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInView>
      </div>

      {loading ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-72" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState title="No events scheduled yet" description="Check back soon or contact the academy to request a private event." />
      ) : (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <ParallaxSection speed={0.1}>
              <section className="mb-12">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-300 sm:text-sm">Upcoming</p>
                  <h2 className="text-2xl font-semibold text-white sm:text-3xl">Coming soon</h2>
                </div>
                <StaggerContainer className="grid gap-8 lg:grid-cols-3" staggerDelay={0.12}>
                  {upcomingEvents.map((event, idx) => (
                    <StaggerItem key={event.id}>
                      <ZoomParallax scaleRange={[0.96, 1.02]}>
                        <TiltCard tiltAmount={6}>
                          <EventCard
                            event={event}
                            onAction={handleEventAction}
                            actionLabel="Enquiry"
                            variant={['violet', 'fuchsia', 'pink'][idx % 3]}
                          />
                        </TiltCard>
                      </ZoomParallax>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            </ParallaxSection>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 sm:text-sm">Past</p>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">Last events</h2>
              </div>
              <StaggerContainer className="grid gap-8 lg:grid-cols-3" staggerDelay={0.12}>
                {pastEvents.map((event, idx) => (
                  <StaggerItem key={event.id}>
                    <ZoomParallax scaleRange={[0.96, 1.02]}>
                      <TiltCard tiltAmount={6}>
                        <EventCard
                          event={event}
                          onAction={handleEventAction}
                          actionLabel="Enquiry"
                          variant={['violet', 'fuchsia', 'pink'][idx % 3]}
                        />
                      </TiltCard>
                    </ZoomParallax>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Events;
