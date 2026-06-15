import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { addInquiry } from '../services/dataService';
import { sendInquiryEmail } from '../services/emailService';
import { FadeInView, ParallaxSection, StaggerContainer, StaggerItem } from '../components/Animation';

const whatsappNumber = '919167289892';

function Contact() {
  const [searchParams] = useSearchParams();
  const defaultTopic = searchParams.get('topic') || 'General inquiry';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(`Hello CJD HOBBY CLASSES, I would like help with ${topic || 'an art inquiry'}.`);
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  }, [topic]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('Sending inquiry...');

    const inquiry = {
      name,
      email,
      phone,
      interest: topic,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      await addInquiry(inquiry);
      await sendInquiryEmail({
        from_name: name,
        from_email: email,
        phone,
        topic,
        message,
      });

      setStatus('Inquiry submitted successfully. We will get back to you shortly.');
      showToast({
        type: 'success',
        title: 'Inquiry sent',
        message: 'Your message has been saved successfully.',
      });

      setName('');
      setEmail('');
      setPhone('');
      setTopic('General inquiry');
      setMessage('');
    } catch (error) {
      console.error(error);
      setStatus('Unable to submit inquiry. Please try again later.');
      showToast({
        type: 'error',
        title: 'Inquiry failed',
        message: 'The message could not be sent right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr]">
        <FadeInView direction="left" className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Contact</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">Questions, inquiries, or booking requests?</h1>
          <p className="max-w-2xl text-slate-400">
            Send us a message, request a free consultation, or ask about a custom art order. Our team responds quickly to every creative inquiry.
          </p>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2" staggerDelay={0.1}>
            <StaggerItem>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
                <div className="flex items-center gap-3 text-violet-300">
                  <Phone size={18} />
                  <span>Call us</span>
                </div>
                <p className="mt-4 text-white">+91 91672 89892</p>
              </motion.div>
            </StaggerItem>
            <StaggerItem>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
                <div className="flex items-center gap-3 text-violet-300">
                  <Mail size={18} />
                  <span>Email</span>
                </div>
                <p className="mt-4 text-white">hello@cjdhobbyclasses.art</p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </FadeInView>

        <FadeInView direction="right">
          <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Send inquiry</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Name</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Phone</label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91"
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Topic</label>
                  <select
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
                  >
                    {['General inquiry', 'Course enrollment', 'Workshop booking', 'Custom portrait order', 'Kids batch'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Message</label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  placeholder="Tell us about your art goals"
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {status ? <p className="text-sm text-slate-300">{status}</p> : null}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
              >
                <Send size={16} /> {submitting ? 'Sending...' : 'Send message'}
              </motion.button>
            </form>
          </div>
        </FadeInView>
      </div>

      <ParallaxSection speed={0.1}>
        <StaggerContainer className="mt-16 grid gap-10 lg:grid-cols-3" staggerDelay={0.12}>
          <StaggerItem>
            <motion.div whileHover={{ y: -6, transition: { duration: 0.25 } }} className="glass-card rounded-[3rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:p-10 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">WhatsApp</p>
              <div className="mt-6 flex items-center gap-3 text-white">
                <MessageCircle size={22} />
                <div>
                  <p className="font-semibold">WhatsApp support</p>
                  <p className="text-slate-400">Chat with our academy team for quick booking support.</p>
                </div>
              </div>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-full bg-green-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-green-400"
              >
                Start WhatsApp chat
              </a>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -6, transition: { duration: 0.25 } }} className="glass-card rounded-[3rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:p-10 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Studio location</p>
              <div className="mt-6 space-y-4 text-slate-300">
                <div className="flex items-center gap-3 text-violet-300">
                  <MapPin size={18} />
                  <span>Mumbai offline art academy with Hemali D. Mehta</span>
                </div>
                <p className="text-sm leading-7">Use the map link to preview directions, neighborhood access, and studio timing details.</p>
                <a
                  href="https://maps.google.com/?q=Mumbai+Art+Studio"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm text-slate-100 transition hover:bg-white/5"
                >
                  Open Google Maps
                </a>
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div whileHover={{ y: -6, transition: { duration: 0.25 } }} className="glass-card rounded-[3rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:p-10 shadow-soft">
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Social links</p>
              <div className="mt-6 grid gap-4 text-slate-300">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-3xl bg-slate-950/70 p-4 transition hover:bg-white/5">
                  <Instagram size={18} /> <span>@CJD_HOBBY_CLASSES.studio</span>
                </a>
                <a href="mailto:hello@cjdhobbyclasses.art" className="flex items-center gap-3 rounded-3xl bg-slate-950/70 p-4 transition hover:bg-white/5">
                  <Mail size={18} /> <span>hello@cjdhobbyclasses.art</span>
                </a>
                <a href="tel:+919167289892" className="flex items-center gap-3 rounded-3xl bg-slate-950/70 p-4 transition hover:bg-white/5">
                  <Phone size={18} /> <span>+91 91672 89892</span>
                </a>
              </div>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </ParallaxSection>
    </div>
  );
}

export default Contact;
