import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmail } from '../firebase/authService';
import { useToast } from '../hooks/useToast';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await registerWithEmail({ name, email, password, role: 'student' });
      showToast({
        type: 'success',
        title: 'Account created',
        message: 'Your student profile is ready to use.',
      });
      navigate('/student', { replace: true });
    } catch (err) {
      setError('Registration failed. Please try again.');
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: 'Please review your details and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-20 sm:px-10">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Register</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Start your art academy membership.</h1>
        <p className="mt-4 text-slate-400">
          Create a student account to enroll in classes, book workshops, order portraits, and track progress.
        </p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm text-slate-300">Full name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-900/80 p-4 text-sm text-slate-400">
            Admin access is role-based and should be assigned in Firestore. Public registration creates student accounts only.
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-300 hover:text-white">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
