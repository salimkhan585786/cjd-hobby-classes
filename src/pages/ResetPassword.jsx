import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from '../firebase/authService';
import { useToast } from '../hooks/useToast';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid or expired reset link. Please request a new password reset.');
      return;
    }

    try {
      setSubmitting(true);
      await confirmPasswordReset(oobCode, password);
      setSuccess(true);
      showToast({
        type: 'success',
        title: 'Password reset successful',
        message: 'Your password has been updated. You can now sign in.',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to reset password. The link may have expired or been used already.');
      showToast({
        type: 'error',
        title: 'Reset failed',
        message: 'Please request a new password reset email.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="mx-auto max-w-xl px-6 py-20 sm:px-10">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Reset Password</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          {success ? 'Password Updated' : 'Set New Password'}
        </h1>
        <p className="mt-4 text-slate-400">
          {success
            ? 'Your password has been successfully reset. Redirecting to login...'
            : 'Enter your new password below. The reset link expires in 1 hour.'}
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm text-slate-300">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              disabled={submitting}
              className="w-full rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="mt-10 flex items-center justify-center">
            <div className="rounded-full bg-green-500/20 p-4 text-green-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-violet-300 hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;