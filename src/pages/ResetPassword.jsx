import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { findUserByEmail, verifySecurityAnswer, resetPasswordViaSecurity } from '../firebase/authService';
import { useToast } from '../hooks/useToast';

function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleLookupEmail = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await findUserByEmail(email);
      if (!user) {
        setError('No account found with this email.');
        setLoading(false);
        return;
      }
      if (!user.securityQuestion) {
        setError('No security question set for this account. Please contact admin to reset your password.');
        setLoading(false);
        return;
      }
      setSecurityQuestion(user.securityQuestion);
      setStep(2);
    } catch (err) {
      setError('Failed to look up account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifySecurityAnswer(email, securityAnswer);
      if (!result.found) {
        setError('No account found.');
        setLoading(false);
        return;
      }
      if (!result.hasQuestion) {
        setError('No security question set. Please contact admin.');
        setLoading(false);
        return;
      }
      if (!result.match) {
        setError('Incorrect answer. Please try again.');
        setLoading(false);
        return;
      }
      setStep(3);
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');

    if (newPin.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordViaSecurity(email, newPin);
      setSuccess(true);
      showToast({
        type: 'success',
        title: 'PIN reset successful',
        message: 'You can now sign in with your new PIN.',
      });
    } catch (err) {
      setError('Failed to reset PIN. Please try again.');
      showToast({
        type: 'error',
        title: 'Reset failed',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">PIN Reset</p>
          <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">All Set!</h1>
          <p className="mt-4 text-slate-400">
            Your PIN has been updated. You can now sign in with your new PIN.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <div className="rounded-full bg-green-500/20 p-4 text-green-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">
            Redirecting to login in 3 seconds...{' '}
            <button onClick={() => navigate('/login', { replace: true })} className="text-violet-300 hover:text-white">
              Login now
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-6 sm:p-8 lg:p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Reset Password</p>
        <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
          {step === 1 && 'Find Your Account'}
          {step === 2 && 'Answer Security Question'}
          {step === 3 && 'Set New PIN'}
        </h1>
        <p className="mt-4 text-slate-400">
          {step === 1 && 'Enter your email to look up your account.'}
          {step === 2 && `Question: ${securityQuestion}`}
          {step === 3 && 'Choose a new 4-digit PIN to recover your account.'}
        </p>

        {/* Step progress */}
        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-violet-500' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleLookupEmail} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm text-slate-300">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              disabled={loading}
              className="w-full rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
            >
              {loading ? 'Looking up...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAnswer} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm text-slate-300">Your answer</label>
              <input
                value={securityAnswer}
                onChange={(event) => setSecurityAnswer(event.target.value)}
                required
                className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
              />
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSecurityAnswer(''); }}
                className="rounded-full border border-white/10 px-6 py-4 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Back
              </button>
              <button
                disabled={loading}
                className="flex-1 rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
              >
                {loading ? 'Verifying...' : 'Verify Answer'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-300">New 4-digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ''))}
                  required
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ''))}
                  required
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-5 py-4 text-slate-100"
                />
              </div>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(2); setError(''); }}
                className="rounded-full border border-white/10 px-6 py-4 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Back
              </button>
              <button
                disabled={loading}
                className="flex-1 rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-700"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
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
