import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, uploadAPI } from '../services/api';
import { Plus, Trash2, AlertCircle, Upload, X, FileText, Video, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const CreateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    thumbnail: '',
    duration: '',
    sections: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

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
      // Expand all sections by default when editing
      const expanded = {};
      response.data.sections?.forEach((_, index) => {
        expanded[index] = true;
      });
      setExpandedSections(expanded);
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

  // Section Management
  const addSection = () => {
    const newSection = {
      title: '',
      order: formData.sections.length + 1,
      lectures: []
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
    setExpandedSections({
      ...expandedSections,
      [formData.sections.length]: true
    });
  };

  const removeSection = (sectionIndex) => {
    const updatedSections = formData.sections.filter((_, i) => i !== sectionIndex);
    updatedSections.forEach((section, i) => {
      section.order = i + 1;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections({
      ...expandedSections,
      [sectionIndex]: !expandedSections[sectionIndex]
    });
  };

  // Lecture Management
  const addLecture = (sectionIndex) => {
    const updatedSections = [...formData.sections];
    const newLecture = {
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      pdfUrls: [],
      duration: '',
      order: updatedSections[sectionIndex].lectures.length + 1,
      isPreview: false
    };
    updatedSections[sectionIndex].lectures.push(newLecture);
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeLecture = (sectionIndex, lectureIndex) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lectures = updatedSections[sectionIndex].lectures.filter((_, i) => i !== lectureIndex);
    updatedSections[sectionIndex].lectures.forEach((lecture, i) => {
      lecture.order = i + 1;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleLectureChange = (sectionIndex, lectureIndex, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lectures[lectureIndex][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  // File Upload Handlers
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

  const handleVideoUpload = async (sectionIndex, lectureIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    try {
      const progressKey = `video_${sectionIndex}_${lectureIndex}`;
      setUploadProgress({ ...uploadProgress, [progressKey]: 0 });

      const response = await uploadAPI.uploadVideo(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress({ ...uploadProgress, [progressKey]: progress });
      });

      handleLectureChange(sectionIndex, lectureIndex, 'videoUrl', response.data.url);
      
      const newProgress = { ...uploadProgress };
      delete newProgress[progressKey];
      setUploadProgress(newProgress);
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video');
      const newProgress = { ...uploadProgress };
      delete newProgress[`video_${sectionIndex}_${lectureIndex}`];
      setUploadProgress(newProgress);
    }
  };

  const handlePDFUpload = async (sectionIndex, lectureIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    try {
      const progressKey = `pdf_${sectionIndex}_${lectureIndex}`;
      setUploadProgress({ ...uploadProgress, [progressKey]: 0 });

      const response = await uploadAPI.uploadPDF(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress({ ...uploadProgress, [progressKey]: progress });
      });

      const updatedSections = [...formData.sections];
      const pdfUrls = updatedSections[sectionIndex].lectures[lectureIndex].pdfUrls || [];
      pdfUrls.push({
        url: response.data.url,
        title: file.name
      });
      updatedSections[sectionIndex].lectures[lectureIndex].pdfUrls = pdfUrls;
      setFormData({ ...formData, sections: updatedSections });
      
      const newProgress = { ...uploadProgress };
      delete newProgress[progressKey];
      setUploadProgress(newProgress);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setError('Failed to upload PDF');
      const newProgress = { ...uploadProgress };
      delete newProgress[`pdf_${sectionIndex}_${lectureIndex}`];
      setUploadProgress(newProgress);
    }
  };

  const removePDF = (sectionIndex, lectureIndex, pdfIndex) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].lectures[lectureIndex].pdfUrls.splice(pdfIndex, 1);
    setFormData({ ...formData, sections: updatedSections });
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <p className="text-sm text-gray-600 mt-1">
                {formData.sections.length} sections • {formData.sections.reduce((total, s) => total + s.lectures.length, 0)} lectures
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Section</span>
            </button>
          </div>

          {formData.sections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No sections added yet</p>
              <button
                type="button"
                onClick={addSection}
                className="btn-primary"
              >
                Add Your First Section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => toggleSection(sectionIndex)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedSections[sectionIndex] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                          required
                          className="input-field"
                          placeholder="Section title (e.g., Introduction to HTML)"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {section.lectures.length} lecture{section.lectures.length !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => addLecture(sectionIndex)}
                            className="btn-secondary flex items-center space-x-1 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Lecture</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lectures */}
                  {expandedSections[sectionIndex] && (
                    <div className="p-4 space-y-4 bg-white">
                      {section.lectures.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 mb-3 text-sm">No lectures in this section</p>
                          <button
                            type="button"
                            onClick={() => addLecture(sectionIndex)}
                            className="btn-secondary text-sm"
                          >
                            Add Lecture
                          </button>
                        </div>
                      ) : (
                        section.lectures.map((lecture, lectureIndex) => (
                          <div key={lectureIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-md font-semibold text-gray-900">
                                Lecture {lecture.order}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeLecture(sectionIndex, lectureIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lecture Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={lecture.title}
                                    onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'title', e.target.value)}
                                    required
                                    className="input-field"
                                    placeholder="e.g., Computer File Paths"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    value={lecture.duration}
                                    onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'duration', e.target.value)}
                                    className="input-field"
                                    placeholder="e.g., 19:20"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Short Description
                                </label>
                                <textarea
                                  value={lecture.description}
                                  onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'description', e.target.value)}
                                  rows={2}
                                  className="input-field"
                                  placeholder="Brief description of this lecture..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Lecture Content *
                                </label>
                                <textarea
                                  value={lecture.content}
                                  onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'content', e.target.value)}
                                  required
                                  rows={4}
                                  className="input-field"
                                  placeholder="Detailed content and learning objectives for this lecture..."
                                />
                              </div>

                              {/* Video Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Lecture Video
                                </label>
                                {lecture.videoUrl ? (
                                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <Video className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-sm text-green-800 flex-1 truncate">
                                      Video uploaded
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleLectureChange(sectionIndex, lectureIndex, 'videoUrl', '')}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <label htmlFor={`video-${sectionIndex}-${lectureIndex}`} className="cursor-pointer">
                                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                      <span className="mt-2 block text-sm text-primary hover:underline">
                                        Upload Video
                                      </span>
                                      <input
                                        id={`video-${sectionIndex}-${lectureIndex}`}
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoUpload(sectionIndex, lectureIndex, e)}
                                        className="hidden"
                                      />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">MP4, AVI, MOV up to 100MB</p>
                                  </div>
                                )}
                                
                                {uploadProgress[`video_${sectionIndex}_${lectureIndex}`] !== undefined && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                      <span>Uploading...</span>
                                      <span>{uploadProgress[`video_${sectionIndex}_${lectureIndex}`]}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress[`video_${sectionIndex}_${lectureIndex}`]}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* PDF Upload */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  PDF Materials (Multiple)
                                </label>
                                
                                {lecture.pdfUrls && lecture.pdfUrls.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    {lecture.pdfUrls.map((pdf, pdfIndex) => (
                                      <div key={pdfIndex} className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                        <FileText className="h-4 w-4 text-blue-600 mr-2" />
                                        <span className="text-sm text-blue-800 flex-1 truncate">
                                          {pdf.title}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => removePDF(sectionIndex, lectureIndex, pdfIndex)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <label htmlFor={`pdf-${sectionIndex}-${lectureIndex}`} className="cursor-pointer">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <span className="mt-2 block text-sm text-primary hover:underline">
                                      Upload PDF
                                    </span>
                                    <input
                                      id={`pdf-${sectionIndex}-${lectureIndex}`}
                                      type="file"
                                      accept="application/pdf"
                                      onChange={(e) => handlePDFUpload(sectionIndex, lectureIndex, e)}
                                      className="hidden"
                                    />
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">PDF up to 10MB</p>
                                </div>
                                
                                {uploadProgress[`pdf_${sectionIndex}_${lectureIndex}`] !== undefined && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                      <span>Uploading...</span>
                                      <span>{uploadProgress[`pdf_${sectionIndex}_${lectureIndex}`]}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress[`pdf_${sectionIndex}_${lectureIndex}`]}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Preview Checkbox */}
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`preview-${sectionIndex}-${lectureIndex}`}
                                  checked={lecture.isPreview}
                                  onChange={(e) => handleLectureChange(sectionIndex, lectureIndex, 'isPreview', e.target.checked)}
                                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label
                                  htmlFor={`preview-${sectionIndex}-${lectureIndex}`}
                                  className="ml-2 block text-sm text-gray-700"
                                >
                                  Free Preview (Allow non-enrolled students to view this lecture)
                                </label>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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