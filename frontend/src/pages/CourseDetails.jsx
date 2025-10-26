import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, enrollmentAPI } from '../services/api';
import {
  Users,
  Clock,
  BookOpen,
  Award,
  PlayCircle,
  FileText,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetchCourse();
      if (isStudent) {
        await checkEnrollment();
      }
    };
    fetchData();
  }, [id, isStudent]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getCourse(id);
      setCourse(response.data);
      // Expand first section by default
      setExpandedSections({ 0: true });
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await enrollmentAPI.getMyCourses();
      const enrolled = response.data.find((e) => e.course._id === id);
      setEnrollment(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      alert('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      alert('Successfully enrolled in course!');
      checkEnrollment();
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections({
      ...expandedSections,
      [sectionIndex]: !expandedSections[sectionIndex]
    });
  };

  const isLectureCompleted = (sectionIndex, lectureIndex) => {
    if (!enrollment) return false;
    return enrollment.completedLectures.some(
      cl => cl.sectionIndex === sectionIndex && cl.lectureIndex === lectureIndex
    );
  };

  const handleLectureComplete = async (sectionIndex, lectureIndex) => {
    if (!enrollment) return;

    try {
      const isCompleted = isLectureCompleted(sectionIndex, lectureIndex);
      let completedLectures;

      if (isCompleted) {
        // Remove from completed
        completedLectures = enrollment.completedLectures.filter(
          cl => !(cl.sectionIndex === sectionIndex && cl.lectureIndex === lectureIndex)
        );
      } else {
        // Add to completed
        completedLectures = [
          ...enrollment.completedLectures,
          { sectionIndex, lectureIndex }
        ];
      }

      // Calculate total lectures
      const totalLectures = course.sections.reduce((total, s) => total + s.lectures.length, 0);
      
      // Calculate progress percentage
      const progress = totalLectures > 0 
        ? Math.round((completedLectures.length / totalLectures) * 100)
        : 0;

      console.log('Updating progress:', {
        completedLectures: completedLectures.length,
        totalLectures,
        progress
      });

      // Update on backend
      await enrollmentAPI.updateProgress(enrollment._id, {
        completedLectures,
        progress,
      });

      // Refresh enrollment data
      await checkEnrollment();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const canAccessLecture = (lecture) => {
    return enrollment || lecture.isPreview;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Course not found
        </h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Courses
        </button>
      </div>
    );
  }

  const totalLectures = course.sections?.reduce((total, s) => total + s.lectures.length, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded">
                {course.category}
              </span>
              <span className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded">
                {course.difficulty}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            <p className="text-lg text-gray-700 mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{course.enrollmentCount} students enrolled</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <BookOpen className="h-5 w-5" />
                <span>{totalLectures} lectures</span>
              </div>
            </div>

            {/* Instructor Info */}
            {course.instructor && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={course.instructor.photo}
                  alt={course.instructor.name}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Instructor</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {course.instructor.name}
                  </p>
                  {course.instructor.bio && (
                    <p className="text-sm text-gray-600 mt-1">
                      {course.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            {enrollment ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-2">
                    You're enrolled in this course!
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Progress</span>
                      <span className="font-semibold text-green-900">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  {enrollment.certificateIssued && (
                    <div className="flex items-center space-x-2 text-green-700 mt-3">
                      <Award className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Certificate Earned!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : isStudent ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            ) : !isAuthenticated ? (
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary"
              >
                Login to Enroll
              </button>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                Only students can enroll in courses
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedLecture.title}
              </h3>
              <button
                onClick={() => setSelectedLecture(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-4">
              {selectedLecture.videoUrl && (
                <video
                  controls
                  className="w-full rounded-lg mb-4"
                  src={selectedLecture.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {selectedLecture.description && (
                <p className="text-gray-600 mb-4">{selectedLecture.description}</p>
              )}
              {selectedLecture.content && (
                <div className="prose prose-sm max-w-none mb-4">
                  <h4 className="font-semibold text-gray-900">About this lecture:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedLecture.content}</p>
                </div>
              )}
              {selectedLecture.pdfUrls && selectedLecture.pdfUrls.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Course Materials:</h4>
                  <div className="space-y-2">
                    {selectedLecture.pdfUrls.map((pdf, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="flex-1 text-sm font-medium text-gray-900">{pdf.title}</span>
                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://docs.google.com/viewer?url=${encodeURIComponent(pdf.url)}&embedded=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={pdf.url}
                            download={pdf.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-primary hover:underline text-sm"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Course Content
            </h2>
            <div className="space-y-4">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(sectionIndex)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {expandedSections[sectionIndex] ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                      </div>
                      <span className="text-sm text-gray-600">
                        {section.lectures.length} lecture{section.lectures.length !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {expandedSections[sectionIndex] && (
                      <div className="bg-white divide-y divide-gray-200">
                        {section.lectures.map((lecture, lectureIndex) => {
                          const isCompleted = isLectureCompleted(sectionIndex, lectureIndex);
                          const hasAccess = canAccessLecture(lecture);

                          return (
                            <div
                              key={lectureIndex}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {hasAccess ? (
                                      <button
                                        onClick={() => setSelectedLecture(lecture)}
                                        className="flex items-center space-x-2 text-primary hover:underline"
                                      >
                                        <PlayCircle className="h-5 w-5" />
                                        <span className="font-medium">{lecture.title}</span>
                                      </button>
                                    ) : (
                                      <div className="flex items-center space-x-2 text-gray-500">
                                        <Lock className="h-5 w-5" />
                                        <span className="font-medium">{lecture.title}</span>
                                      </div>
                                    )}
                                    {lecture.isPreview && (
                                      <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  
                                  {lecture.description && (
                                    <p className="text-sm text-gray-600 mb-2">{lecture.description}</p>
                                  )}
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {lecture.duration && (
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{lecture.duration}</span>
                                      </span>
                                    )}
                                    {lecture.videoUrl && hasAccess && (
                                      <span className="flex items-center space-x-1">
                                        <PlayCircle className="h-4 w-4" />
                                        <span>Video</span>
                                      </span>
                                    )}
                                    {lecture.pdfUrls && lecture.pdfUrls.length > 0 && hasAccess && (
                                      <span className="flex items-center space-x-1">
                                        <FileText className="h-4 w-4" />
                                        <span>{lecture.pdfUrls.length} PDF{lecture.pdfUrls.length !== 1 ? 's' : ''}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {enrollment && hasAccess && (
                                  <button
                                    onClick={() => handleLectureComplete(sectionIndex, lectureIndex)}
                                    className={`ml-4 p-2 rounded-lg transition-colors ${
                                      isCompleted
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                    title={isCompleted ? 'Completed' : 'Mark as complete'}
                                  >
                                    <CheckCircle className="h-6 w-6" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No content available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Course Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-gray-900">
                  {course.duration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty</span>
                <span className="font-semibold text-gray-900">
                  {course.difficulty}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Students</span>
                <span className="font-semibold text-gray-900">
                  {course.enrollmentCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sections</span>
                <span className="font-semibold text-gray-900">
                  {course.sections?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lectures</span>
                <span className="font-semibold text-gray-900">
                  {totalLectures}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-semibold text-gray-900">
                  {course.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;