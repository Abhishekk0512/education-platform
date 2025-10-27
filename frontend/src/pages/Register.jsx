// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { authAPI } from '../services/api';
// import { AlertCircle, CheckCircle } from 'lucide-react';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'student'
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     setLoading(true);

//     try {
//       const { confirmPassword, ...registrationData } = formData;
//       const response = await authAPI.register(registrationData);
//       login(response.data);
      
//       // Redirect based on role
//       if (response.data.role === 'student') {
//         navigate('/student/dashboard');
//       } else if (response.data.role === 'teacher') {
//         navigate('/teacher/dashboard');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
//       <div className="max-w-md w-full">
//         <div className="card">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
//             Create Your Account
//           </h2>

//           {error && (
//             <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
//               <AlertCircle className="h-5 w-5" />
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//                 Full Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="input-field"
//                 placeholder="John Doe"
//               />
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="input-field"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 minLength={6}
//                 className="input-field"
//                 placeholder="••••••••"
//               />
//               <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
//             </div>

//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//                 Confirm Password
//               </label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//                 className="input-field"
//                 placeholder="••••••••"
//               />
//             </div>

//             <div>
//               <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//                 I am a
//               </label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="input-field"
//               >
//                 <option value="student">Student</option>
//                 <option value="teacher">Teacher</option>
//               </select>
//               {formData.role === 'teacher' && (
//                 <p className="mt-2 text-xs text-amber-600 flex items-start space-x-1">
//                   <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                   <span>Teacher accounts require admin approval before you can create courses.</span>
//                 </p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link to="/login" className="text-primary hover:underline font-medium">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      
      console.log('Sending registration request...', { email: registrationData.email });
      
      const response = await authAPI.register(registrationData);
      
      console.log('Registration response:', response.data);
      
      // Redirect to verification page with userId and email
      navigate('/verify-email', { 
        state: { 
          userId: response.data.userId,
          email: response.data.email,
          role: formData.role
        },
        replace: true
      });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      } else if (err.request) {
        // Request made but no response
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Create Your Account
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-field"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              {formData.role === 'teacher' && (
                <p className="mt-2 text-xs text-amber-600 flex items-start space-x-1">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Teacher accounts require admin approval before you can create courses.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;