// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { authAPI } from '../services/api';
// import { AlertCircle, CheckCircle } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';


// const VerifyEmail = () => {
//   const [code, setCode] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const userId = state?.userId;
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     setMessage('');

//     try {
//       const res = await authAPI.verifyEmail({ userId, code });
//       login(res.data); // store token & user
// if (res.data.user.role === 'student') {
//   navigate('/student/dashboard');
// } else if (res.data.user.role === 'teacher') {
//   navigate('/teacher/dashboard');
// }
//       setMessage(res.data.message);
//     //   setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Verification failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
//       <div className="max-w-md w-full card">
//         <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>

//         {error && (
//           <div className="p-3 mb-4 bg-red-50 border border-red-300 rounded flex items-center text-red-700">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             {error}
//           </div>
//         )}

//         {message && (
//           <div className="p-3 mb-4 bg-green-50 border border-green-300 rounded flex items-center text-green-700">
//             <CheckCircle className="h-5 w-5 mr-2" />
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             placeholder="Enter verification code"
//             className="input-field"
//             required
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full btn-primary disabled:opacity-50"
//           >
//             {loading ? 'Verifying...' : 'Verify'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();

  const userId = state?.userId;
  const email = state?.email;
  const role = state?.role;

  useEffect(() => {
    if (!userId || !email) {
      navigate('/register');
    }
  }, [userId, email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authAPI.verifyEmail({ userId, code });
      
      // Store token and user data
      login(res.data);
      
      setMessage(res.data.message);
      
      // Redirect based on role after short delay
      setTimeout(() => {
        if (role === 'student') {
          navigate('/student/dashboard');
        } else if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.resendVerification({ email });
      setMessage('Verification code sent! Please check your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to <span className="font-medium">{email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-300 rounded flex items-start text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 bg-green-50 border border-green-300 rounded flex items-start text-green-700">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="input-field text-center text-lg tracking-widest"
              required
              maxLength={6}
              pattern="[0-9]{6}"
            />
            <p className="mt-1 text-xs text-gray-500 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;