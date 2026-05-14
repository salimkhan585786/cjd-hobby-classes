import { motion } from 'framer-motion';
import { Menu, Moon, Palette, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Workshops', to: '/workshops' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('canvascraft-theme') || 'dark');
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('canvascraft-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  const dashboardPath = role === 'admin' ? '/admin' : '/student';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-violet-500/15 text-violet-200 shadow-glow">
            <Palette size={18} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-violet-300">CanvasCraft</p>
            <p className="text-base text-slate-100">Art Academy</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? 'bg-violet-500/15 text-violet-100' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-white/10 bg-slate-900/70 p-3 text-slate-200 transition hover:border-violet-400/30"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/order"
            className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-100 transition hover:bg-white/10"
          >
            Order Portrait
          </Link>
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-full bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/5"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Join Classes
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-white/10 bg-slate-900/70 p-3 text-slate-200 transition hover:border-violet-400/30"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/70 text-slate-200"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden border-t border-white/10 bg-slate-950/95 px-6 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-slate-200 transition hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/order"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-slate-900/70 px-4 py-3 text-slate-100"
            >
              Order Portrait
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-violet-500 px-4 py-3 text-center text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-slate-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-violet-500 px-4 py-3 text-center text-white"
                >
                  Join Classes
                </Link>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}

export default Navbar;
