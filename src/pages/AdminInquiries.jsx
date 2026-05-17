import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusPill from '../components/StatusPill';
import { useAnnouncements, useInquiries } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { addAnnouncement, addStudentNotification, updateInquiry } from '../services/dataService';
import { sendReplyEmail } from '../services/emailService';

const createLocalId = (prefix) => `local-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const isLocalId = (value) => String(value || '').startsWith('local-');

function AdminInquiries() {
  const { inquiries, loading: inquiriesLoading, setInquiries } = useInquiries();
  const { announcements, loading: announcementsLoading, setAnnouncements } = useAnnouncements();
  const { showToast } = useToast();
  const [replyDrafts, setReplyDrafts] = useState({});
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    audience: 'Students',
  });

  const handleInquiryStatus = async (inquiryId, status) => {
    setInquiries((current) => current.map((item) => (item.id === inquiryId ? { ...item, status } : item)));
    if (!isLocalId(inquiryId)) {
      try {
        await updateInquiry(inquiryId, { status });
      } catch (error) {
        console.error(error);
      }
    }
    showToast({ type: 'success', title: 'Inquiry updated', message: `Marked as ${status}.` });
  };

  const handleReplyEmail = async (inquiry) => {
    const message = replyDrafts[inquiry.id]?.trim();

    if (!message) {
      showToast({
        type: 'info',
        title: 'Reply message missing',
        message: 'Write a short reply before sending the email.',
      });
      return;
    }

    try {
      await sendReplyEmail({
        to_email: inquiry.email,
        to_name: inquiry.name,
        reply_message: message,
        topic: inquiry.interest,
      });
      await handleInquiryStatus(inquiry.id, 'contacted');
      setReplyDrafts((current) => ({ ...current, [inquiry.id]: '' }));
      showToast({
        type: 'success',
        title: 'Reply sent',
        message: `A reply has been sent to ${inquiry.email}.`,
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: 'error',
        title: 'Reply failed',
        message: 'The EmailJS reply could not be sent.',
      });
    }
  };

  const handleAnnouncement = async (event) => {
    event.preventDefault();
    const payload = {
      ...announcementForm,
      createdAt: new Date().toISOString(),
    };

    try {
      const id = await addAnnouncement(payload);
      setAnnouncements((current) => [{ id, ...payload }, ...current]);
    } catch (error) {
      console.error(error);
      setAnnouncements((current) => [{ id: createLocalId('announcement'), ...payload }, ...current]);
    }

    setAnnouncementForm({
      title: '',
      message: '',
      audience: 'Students',
    });

    if (payload.audience === 'Students') {
      try {
        await addStudentNotification({
          audience: 'Students',
          type: 'admin-announcement',
          title: payload.title,
          message: payload.message,
          source: 'announcement',
        });
      } catch (error) {
        console.error(error);
      }
    }

    showToast({ type: 'success', title: 'Announcement sent', message: 'The dashboard announcement has been saved.' });
  };

  if (inquiriesLoading || announcementsLoading) {
    return <LoadingSkeleton className="h-[480px]" />;
  }

  return (
    <div className="space-y-10">
      <section className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Inquiries</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Reply to new leads and keep announcements tidy.</h2>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Inquiry inbox</p>
          <div className="mt-6 space-y-4">
            {inquiries.length === 0 ? (
              <EmptyState title="No inquiries" description="Fresh leads from the contact page will appear here." />
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-3xl bg-slate-900/80 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-white">{inquiry.name}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {inquiry.email} • {inquiry.interest}
                      </p>
                      <p className="mt-3 text-slate-300">{inquiry.message}</p>
                    </div>
                    <div className="space-y-3">
                      <StatusPill value={inquiry.status} />
                      <textarea
                        value={replyDrafts[inquiry.id] || ''}
                        onChange={(event) =>
                          setReplyDrafts((current) => ({
                            ...current,
                            [inquiry.id]: event.target.value,
                          }))
                        }
                        placeholder="Write a quick reply"
                        rows="3"
                        className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleInquiryStatus(inquiry.id, 'contacted')} className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/5">Contacted</button>
                        <button type="button" onClick={() => handleReplyEmail(inquiry)} className="rounded-full border border-violet-400/30 px-3 py-2 text-xs text-violet-200 transition hover:bg-violet-500/10">Send reply</button>
                        <button type="button" onClick={() => handleInquiryStatus(inquiry.id, 'closed')} className="rounded-full bg-violet-500 px-3 py-2 text-xs text-white transition hover:bg-violet-400">Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] border border-white/10 p-8 shadow-soft">
          <div className="flex items-center gap-3 text-violet-300">
            <Megaphone size={20} />
            <p className="text-sm uppercase tracking-[0.24em]">Announcements</p>
          </div>
          <form onSubmit={handleAnnouncement} className="mt-6 grid gap-4">
            <input value={announcementForm.title} onChange={(event) => setAnnouncementForm((current) => ({ ...current, title: event.target.value }))} placeholder="Announcement title" className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            <select value={announcementForm.audience} onChange={(event) => setAnnouncementForm((current) => ({ ...current, audience: event.target.value }))} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100">
              {['Students', 'Public', 'Parents'].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <textarea value={announcementForm.message} onChange={(event) => setAnnouncementForm((current) => ({ ...current, message: event.target.value }))} placeholder="Announcement message" rows="4" className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100" />
            <button type="submit" className="rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Save announcement</button>
          </form>
          <div className="mt-8 space-y-4">
            {announcements.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">{item.audience}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminInquiries;
