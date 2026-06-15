import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithPin } from '../firebase/authService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import logo from '../assets/logo1.png';

function Login() {
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [user, role, navigate]);

  const handlePasswordLogin = async (event) => {
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

  const handlePinLogin = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    try {
      setError('');
      setSubmitting(true);
      await loginWithPin(email, pin);
      showToast({
        type: 'success',
        title: 'Welcome back',
        message: 'Signed in with PIN successfully.',
      });
    } catch (err) {
      setError(err.message || 'PIN login failed. Please try again.');
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <div className="flex items-center justify-center mb-6">
          <img src={logo} alt="CJD Hobby Classes" className="h-16 w-auto rounded-full" />
        </div>
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300 text-center">Sign in</p>
        <h1 className="mt-4 text-2xl font-semibold text-white text-center sm:text-3xl lg:text-4xl">Welcome back to CJD HOBBY CLASSES.</h1>
        <p className="mt-4 text-slate-400">Access your classes, art orders, attendance, and progress dashboard from one place.</p>

        {/* Login method tabs */}
        <div className="mt-8 flex rounded-full border border-white/10 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
              loginMethod === 'password'
                ? 'bg-violet-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('pin'); setError(''); }}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
              loginMethod === 'pin'
                ? 'bg-violet-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login with PIN
          </button>
        </div>

        {loginMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="mt-8 space-y-6">
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
                <Link
                  to="/reset-password"
                  className="text-sm text-violet-300 transition hover:text-white"
                >
                  Forgot password?
                </Link>
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
        ) : (
          <form onSubmit={handlePinLogin} className="mt-8 space-y-6">
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
              <label className="block text-sm text-slate-300">4-digit PIN</label>
              <input
                type="password"
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
                required
                placeholder="Enter your 4-digit PIN"
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
              <div className="mt-3 flex justify-end">
                <Link
                  to="/reset-password"
                  className="text-sm text-violet-300 transition hover:text-white"
                >
                  Forgot PIN?
                </Link>
              </div>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              disabled={submitting}
              className="w-full rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
            >
              {submitting ? 'Signing in...' : 'Login with PIN'}
            </button>
          </form>
        )}

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
