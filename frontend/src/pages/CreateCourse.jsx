import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

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
    // Update order numbers
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

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide a URL to a course thumbnail image (optional)
              </p>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video URL
                        </label>
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => handleLessonChange(index, 'videoUrl', e.target.value)}
                          className="input-field"
                          placeholder="https://youtube.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PDF URL
                        </label>
                        <input
                          type="url"
                          value={lesson.pdfUrl}
                          onChange={(e) => handleLessonChange(index, 'pdfUrl', e.target.value)}
                          className="input-field"
                          placeholder="https://example.com/material.pdf"
                        />
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
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? 'Saving...' 
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