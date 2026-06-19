import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1.png';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Events', to: '/events' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Order Portrait', to: '/order' },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 py-14 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:justify-between">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2" aria-label="CJD Hobby Classes Home">
            <img src={logo} alt="CJD Hobby Classes" className="h-10 w-auto rounded-full" />
            <span className="text-sm uppercase tracking-[0.24em] text-violet-300">CJD HOBBY Art Academy</span>
          </Link>
          <p className="max-w-md leading-7 text-slate-400">
            A premium drawing academy experience with class management, events, custom art orders, and student showcase support.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <Phone size={18} /> <span>+91 91672 89892</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Mail size={18} /> <span>cjdhobbyclasses18@gmail.com</span>
          </div>
          <div className="flex items-start gap-3 text-slate-400">
            <MapPin size={18} className="mt-0.5 shrink-0" />
            <span>Madhav kunj, B/102, Aacharya Shanti Sagar Chawk, Himmat Nagar, Borivali, Mumbai, Maharashtra 400092</span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Explore</h3>
            <ul className="grid gap-3 text-slate-400">
              {links.map((item) => (
                <li key={item.to}>
                  <Link className="transition hover:text-white" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">Connect</h3>
            <a
              href="https://www.instagram.com/cjd_hobbyclasses/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-slate-400 transition hover:text-white"
            >
              <Instagram size={18} /> <span>@cjd_hobbyclasses</span>
            </a>
            <div className="flex items-center gap-3 text-slate-400">
              <MapPin size={18} /> <span>Borivali, Mumbai</span>
            </div>
            <a
              href="https://maps.google.com/?q=19.233980,72.854713"
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
