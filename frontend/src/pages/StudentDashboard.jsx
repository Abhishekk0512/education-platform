import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { BookOpen, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await enrollmentAPI.getMyCourses();
      
      // Ensure we have valid data
      const enrollmentsData = Array.isArray(response.data) 
        ? response.data.filter(enrollment => enrollment && enrollment._id && enrollment.course)
        : [];
      
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setError('Failed to load your courses. Please try again.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics safely
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const totalCertificates = enrollments.filter(e => e.certificateIssued).length;
  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your progress and continue learning</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{inProgressCourses}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedCourses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Progress</p>
              <p className="text-3xl font-bold text-gray-900">{averageProgress}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <Link to="/" className="btn-primary">
            Browse More Courses
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses enrolled yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start learning by enrolling in a course
            </p>
            <Link to="/" className="btn-primary">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              // Safely access course data
              const course = enrollment.course || {};
              const courseId = course._id || '';
              const courseTitle = course.title || 'Untitled Course';
              const courseThumbnail = course.thumbnail || 'https://via.placeholder.com/400x300';
              const courseCategory = course.category || 'General';
              const courseDifficulty = course.difficulty || 'Beginner';
              const instructorName = course.instructor?.name || 'Unknown';

              return (
                <Link
                  key={enrollment._id}
                  to={`/courses/${courseId}`}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <img
                    src={courseThumbnail}
                    alt={courseTitle}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded">
                      {courseCategory}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                      {courseDifficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {courseTitle}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    by {instructorName}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {enrollment.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          enrollment.progress === 100
                            ? 'bg-green-600'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Certificate Badge */}
                  {enrollment.certificateIssued && (
                    <div className="mt-4 flex items-center space-x-2 text-green-600">
                      <Award className="h-5 w-5" />
                      <span className="text-sm font-medium">Certificate Earned!</span>
                    </div>
                  )}

                  {/* Continue Learning Button */}
                  <div className="mt-4">
                    <span className="text-primary font-semibold text-sm hover:underline">
                      {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;