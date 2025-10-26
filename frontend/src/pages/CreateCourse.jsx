import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, uploadAPI } from '../services/api';
import { Plus, Trash2, AlertCircle, Upload, X, FileText, Video } from 'lucide-react';

const CreateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    syllabus: '',
    thumbnail: '',
    duration: '',
    lessons: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});

  const categories = ['AI', 'Data Science', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    if (isEditMode) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getCourse(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLessonChange = (index, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[index][field] = value;
    setFormData({ ...formData, lessons: updatedLessons });
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setUploadProgress({ thumbnail: 0 });
      const response = await uploadAPI.uploadThumbnail(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress({ thumbnail: progress });
      });

      setFormData({ ...formData, thumbnail: response.data.url });
      setUploadProgress({});
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setError('Failed to upload thumbnail');
      setUploadProgress({});
    }
  };

  // Handle PDF upload for lesson
  const handlePDFUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    try {
      const progressKey = `pdf_${index}`;
      setUploadProgress({ ...uploadProgress, [progressKey]: 0 });

      const response = await uploadAPI.uploadPDF(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress({ ...uploadProgress, [progressKey]: progress });
      });

      handleLessonChange(index, 'pdfUrl', response.data.url);
      
      const newProgress = { ...uploadProgress };
      delete newProgress[progressKey];
      setUploadProgress(newProgress);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('Failed to upload PDF');
      const newProgress = { ...uploadProgress };
      delete newProgress[`pdf_${index}`];
      setUploadProgress(newProgress);
    }
  };

  // Handle video upload for lesson
  const handleVideoUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    try {
      const progressKey = `video_${index}`;
      setUploadProgress({ ...uploadProgress, [progressKey]: 0 });

      const response = await uploadAPI.uploadVideo(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress({ ...uploadProgress, [progressKey]: progress });
      });

      handleLessonChange(index, 'videoUrl', response.data.url);
      
      const newProgress = { ...uploadProgress };
      delete newProgress[progressKey];
      setUploadProgress(newProgress);
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video');
      const newProgress = { ...uploadProgress };
      delete newProgress[`video_${index}`];
      setUploadProgress(newProgress);
    }
  };

  const addLesson = () => {
    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        {
          title: '',
          content: '',
          videoUrl: '',
          pdfUrl: '',
          order: formData.lessons.length + 1
        }
      ]
    });
  };

  const removeLesson = (index) => {
    const updatedLessons = formData.lessons.filter((_, i) => i !== index);
    updatedLessons.forEach((lesson, i) => {
      lesson.order = i + 1;
    });
    setFormData({ ...formData, lessons: updatedLessons });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await courseAPI.updateCourse(id, formData);
        alert('Course updated successfully! It will need admin approval again.');
      } else {
        await courseAPI.createCourse(formData);
        alert('Course created successfully! Waiting for admin approval.');
      }
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode 
            ? 'Update your course details. Changes require admin approval.'
            : 'Fill in the details to create your course. It will be submitted for admin approval.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., 6 weeks"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Thumbnail
              </label>
              
              {formData.thumbnail ? (
                <div className="relative">
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Upload a thumbnail</span>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              
              {uploadProgress.thumbnail !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress.thumbnail}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress.thumbnail}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="syllabus" className="block text-sm font-medium text-gray-700 mb-2">
                Syllabus *
              </label>
              <textarea
                id="syllabus"
                name="syllabus"
                value={formData.syllabus}
                onChange={handleChange}
                required
                rows={6}
                className="input-field"
                placeholder="Provide a detailed syllabus of what will be covered in the course..."
              />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Course Lessons</h2>
            <button
              type="button"
              onClick={addLesson}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Lesson</span>
            </button>
          </div>

          {formData.lessons.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No lessons added yet</p>
              <button
                type="button"
                onClick={addLesson}
                className="btn-primary"
              >
                Add Your First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.lessons.map((lesson, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lesson {lesson.order}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        required
                        className="input-field"
                        placeholder="e.g., Introduction to HTML"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lesson Content *
                      </label>
                      <textarea
                        value={lesson.content}
                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                        required
                        rows={3}
                        className="input-field"
                        placeholder="Describe what will be covered in this lesson..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Video Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lesson Video
                        </label>
                        {lesson.videoUrl ? (
                          <div className="relative">
                            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                              <Video className="h-5 w-5 text-green-600 mr-2" />
                              <span className="text-sm text-green-800 flex-1 truncate">
                                Video uploaded
                              </span>
                              <button
                                type="button"
                                onClick={() => handleLessonChange(index, 'videoUrl', '')}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <label htmlFor={`video-${index}`} className="cursor-pointer">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <span className="mt-2 block text-sm text-primary hover:underline">
                                Upload Video
                              </span>
                              <input
                                id={`video-${index}`}
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleVideoUpload(index, e)}
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">MP4, AVI, MOV up to 100MB</p>
                          </div>
                        )}
                        
                        {uploadProgress[`video_${index}`] !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[`video_${index}`]}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[`video_${index}`]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PDF Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lesson PDF
                        </label>
                        {lesson.pdfUrl ? (
                          <div className="relative">
                            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-sm text-blue-800 flex-1 truncate">
                                PDF uploaded
                              </span>
                              <button
                                type="button"
                                onClick={() => handleLessonChange(index, 'pdfUrl', '')}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <label htmlFor={`pdf-${index}`} className="cursor-pointer">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <span className="mt-2 block text-sm text-primary hover:underline">
                                Upload PDF
                              </span>
                              <input
                                id={`pdf-${index}`}
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handlePDFUpload(index, e)}
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PDF up to 10MB</p>
                          </div>
                        )}
                        
                        {uploadProgress[`pdf_${index}`] !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[`pdf_${index}`]}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[`pdf_${index}`]}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || Object.keys(uploadProgress).length > 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Saving...' 
              : Object.keys(uploadProgress).length > 0
              ? 'Uploading files...'
              : isEditMode 
              ? 'Update Course' 
              : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;