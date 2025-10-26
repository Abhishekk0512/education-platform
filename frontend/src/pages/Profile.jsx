import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, uploadAPI } from '../services/api';
import { User, Mail, Shield, AlertCircle, CheckCircle, Camera, X, Upload as UploadIcon } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(null);

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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploadingPhoto(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      const response = await uploadAPI.uploadProfilePhoto(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setFormData({ ...formData, photo: response.data.url });
      setMessage({ type: 'success', text: 'Photo uploaded! Click "Update Profile" to save.' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo. Please try again.' });
      setPreviewImage(null);
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo: 'https://via.placeholder.com/150' });
    setPreviewImage(null);
    setMessage({ type: 'success', text: 'Photo removed! Click "Update Profile" to save.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      setPreviewImage(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = previewImage || formData.photo || 'https://via.placeholder.com/150';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="relative inline-block mb-4">
              <img
                src={currentPhoto}
                alt={formData.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-100"
              />
              <button
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {uploadingPhoto && (
              <div className="mb-4 px-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {formData.photo && formData.photo !== 'https://via.placeholder.com/150' && !uploadingPhoto && (
              <button
                onClick={handleRemovePhoto}
                className="text-red-600 hover:text-red-800 text-sm mb-4 flex items-center space-x-1 mx-auto"
              >
                <X className="h-4 w-4" />
                <span>Remove photo</span>
              </button>
            )}

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
                <span className="flex-1">{message.text}</span>
                <button
                  onClick={() => setMessage({ type: '', text: '' })}
                  className="text-current hover:opacity-70"
                >
                  <X className="h-4 w-4" />
                </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={currentPhoto}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={handlePhotoClick}
                      disabled={uploadingPhoto}
                      className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UploadIcon className="h-4 w-4" />
                      <span>{uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                    </button>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                </div>
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

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={loading || uploadingPhoto}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                {(previewImage || formData.photo !== user?.photo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: user.name || '',
                        bio: user.bio || '',
                        photo: user.photo || ''
                      });
                      setPreviewImage(null);
                      setMessage({ type: '', text: '' });
                    }}
                    className="btn-secondary"
                  >
                    Cancel Changes
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;