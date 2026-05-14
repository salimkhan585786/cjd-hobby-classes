import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Workshops', to: '/workshops' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Order Portrait', to: '/order' },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95 py-14 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:justify-between">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">CanvasCraft Art Academy</p>
          <p className="max-w-md leading-7 text-slate-400">
            A premium drawing academy experience with class management, workshops, custom art orders, and student showcase support.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <Phone size={18} /> <span>+91 98765 12000</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Mail size={18} /> <span>hello@canvascraft.art</span>
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
            <div className="flex items-center gap-3 text-slate-400">
              <Instagram size={18} /> <span>@canvascraft.studio</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <MapPin size={18} /> <span>Mumbai studio + online classes</span>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              Follow our gallery updates, workshop releases, and student milestones across every batch.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
