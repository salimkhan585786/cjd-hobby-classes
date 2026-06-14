import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { resendEmailVerification } from '../firebase/authService';
import { useToast } from '../hooks/useToast';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    if (!oobCode) {
      if (!loading && user) {
        sendVerification();
      } else {
        setStatus('error');
        setMessage('Invalid or missing verification link.');
        showToast({
          type: 'error',
          title: 'Invalid link',
          message: 'The verification link is missing or malformed.',
        });
      }
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        showToast({
          type: 'success',
          title: 'Email verified',
          message: 'You can now sign in to your account.',
        });
      } catch (err) {
        console.error(err);
        setStatus('error');
        if (err.code === 'auth/expired-action-code') {
          setMessage('This verification link has expired. Please request a new one.');
        } else if (err.code === 'auth/invalid-action-code') {
          setMessage('This verification link is invalid or has already been used.');
        } else {
          setMessage('Verification failed. Please request a new verification email.');
        }
        showToast({
          type: 'error',
          title: 'Verification failed',
          message: err.message,
        });
      }
    };

    verify();
  }, [searchParams, showToast, user, loading]);

  const sendVerification = async () => {
    setStatus('verifying');
    setMessage('Sending verification email...');
    try {
      await resendEmailVerification();
      showToast({
        type: 'success',
        title: 'Email sent',
        message: 'A new verification email has been sent to your inbox.',
      });
      setStatus('info');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Failed to send',
        message: err.message,
      });
      setStatus('error');
      setMessage('Failed to send verification email. Please try again.');
    }
  };

  const handleResend = () => {
    sendVerification();
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-20 sm:px-10">
      <div className="glass-card rounded-[3rem] border border-white/10 bg-slate-950/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Email Verification</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">
          {status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying...'}
        </h1>
        <p className="mt-4 text-slate-400">{message}</p>

        {status === 'verifying' && (
          <div className="mt-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={handleResend}
            className="mt-8 rounded-full bg-violet-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-violet-400"
          >
            Resend Verification Email
          </button>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          {status === 'success'
            ? 'Redirecting to login...'
            : 'Already verified? '}
          <Link to="/login" className="text-violet-300 hover:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;