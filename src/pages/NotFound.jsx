import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center px-6 py-20 text-center sm:px-10">
      <div className="max-w-2xl rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Page not found</p>
        <h1 className="mt-5 text-6xl font-semibold text-white">404</h1>
        <p className="mt-6 text-lg leading-8 text-slate-400">Oops, the page you’re looking for doesn’t exist. Return to the homepage or explore our classes.</p>
        <Link to="/" className="mt-10 inline-flex rounded-full bg-violet-500 px-8 py-4 text-sm font-semibold text-white transition hover:bg-violet-400">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
