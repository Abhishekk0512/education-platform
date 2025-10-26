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
  ExternalLink
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

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

  const handleLessonComplete = async (lessonOrder) => {
    if (!enrollment) return;

    try {
      const completedLessons = enrollment.completedLessons.includes(lessonOrder)
        ? enrollment.completedLessons
        : [...enrollment.completedLessons, lessonOrder];

      const progress = Math.round(
        (completedLessons.length / course.lessons.length) * 100
      );

      await enrollmentAPI.updateProgress(enrollment._id, {
        completedLessons,
        progress,
      });

      checkEnrollment();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
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
                <span>{course.lessons?.length || 0} lessons</span>
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

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Syllabus</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {course.syllabus}
            </div>
          </div>

          {/* Video Player Modal */}
          {selectedLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Lesson {selectedLesson.order}: {selectedLesson.title}
                  </h3>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <div className="p-4">
                  {selectedLesson.videoUrl && (
                    <video
                      controls
                      className="w-full rounded-lg mb-4"
                      src={selectedLesson.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <p className="text-gray-700 mb-4">{selectedLesson.content}</p>
                  {selectedLesson.pdfUrl && (
                    <a
                      href={selectedLesson.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF Materials</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lessons */}
          {enrollment && course.lessons && course.lessons.length > 0 && (
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Lessons
              </h2>
              <div className="space-y-3">
                {course.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <div
                      key={lesson.order}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {lesson.order}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {lesson.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {lesson.content}
                          </p>
                          <div className="flex items-center space-x-4 flex-wrap gap-2">
                            {lesson.videoUrl && (
                              <button
                                onClick={() => setSelectedLesson(lesson)}
                                className="flex items-center space-x-1 text-sm text-primary hover:underline"
                              >
                                <PlayCircle className="h-4 w-4" />
                                <span>Watch Video</span>
                              </button>
                            )}
                            {lesson.pdfUrl && (
                              <a
                                href={lesson.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-sm text-primary hover:underline"
                              >
                                <FileText className="h-4 w-4" />
                                <span>View PDF</span>
                              </a>
                            )}
                            {lesson.pdfUrl && (
                              <a
                                href={lesson.pdfUrl}
                                download
                                className="flex items-center space-x-1 text-sm text-green-600 hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleLessonComplete(lesson.order)}
                          className={`ml-4 p-2 rounded-lg transition-colors ${
                            enrollment.completedLessons.includes(lesson.order)
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={
                            enrollment.completedLessons.includes(lesson.order)
                              ? 'Completed'
                              : 'Mark as complete'
                          }
                        >
                          <CheckCircle className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
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
                <span className="text-gray-600">Lessons</span>
                <span className="font-semibold text-gray-900">
                  {course.lessons?.length || 0}
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