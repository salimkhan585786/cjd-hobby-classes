import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
      <div className="max-w-2xl rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Page not found</p>
        <h1 className="mt-5 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">404</h1>
        <p className="mt-6 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">Oops, the page you're looking for doesn't exist. Return to the homepage or explore our classes.</p>
        <Link to="/" className="mt-8 sm:mt-10 inline-flex rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 sm:px-8 sm:py-4">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
