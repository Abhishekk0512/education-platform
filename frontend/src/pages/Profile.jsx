import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        photo: user.photo || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <img
              src={formData.photo || 'https://via.placeholder.com/150'}
              alt={formData.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{user?.name}</h2>
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h3>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{message.text}</span>
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
                />
              </div>

              <div>
                <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  id="photo"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="input-field bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;