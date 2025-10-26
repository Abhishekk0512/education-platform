import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await authAPI.verifyEmail({ userId, code });
      login(response.data); // store token & user
if (response.data.user.role === 'student') {
  navigate('/student/dashboard');
} else if (response.data.user.role === 'teacher') {
  navigate('/teacher/dashboard');
}
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full card">
        <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-300 rounded flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 bg-green-50 border border-green-300 rounded flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            className="input-field"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
