import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function PublicLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_18%)]" />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
