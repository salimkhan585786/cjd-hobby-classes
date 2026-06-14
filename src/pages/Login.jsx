import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, requestPasswordReset } from '../firebase/authService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      console.log('User logged in:', user);
      console.log('User role:', role);
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [user, role, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError('');
      setSubmitting(true);
      await loginWithEmail(email, password);
      showToast({
        type: 'success',
        title: 'Welcome back',
        message: 'Your account has been signed in successfully.',
      });
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Login failed. Please check your credentials and try again.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError('Login failed. Please try again.');
      }
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email first, then use forgot password.');
      return;
    }

    try {
      setResetting(true);
      await requestPasswordReset(email);
      showToast({
        type: 'success',
        title: 'Reset email sent',
        message: 'Check your inbox for the password reset link.',
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Reset failed',
        message: 'The password reset email could not be sent.',
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-20 sm:px-10">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Sign in</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Welcome back to CJD HOBBY CLASSES.</h1>
        <p className="mt-4 text-slate-400">Access your classes, art orders, attendance, and progress dashboard from one place.</p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
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
          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetting}
                className="text-sm text-violet-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-violet-500"
              >
                {resetting ? 'Sending reset link...' : 'Forgot password?'}
              </button>
            </div>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            disabled={submitting}
            className="w-full rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-400">
          New here?{' '}
          <Link to="/register" className="text-violet-300 hover:text-white">
            Create a student account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
