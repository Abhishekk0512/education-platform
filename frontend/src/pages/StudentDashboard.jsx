import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    inProgress: 0,
    completed: 0,
    avgProgress: 0
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyCourses();
      setEnrollments(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (enrollments) => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.progress === 100).length;
    const inProgress = total - completed;
    const avgProgress = total > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / total 
      : 0;

    setStats({
      totalCourses: total,
      inProgress,
      completed,
      avgProgress: Math.round(avgProgress)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Courses</p>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
            </div>
            <BookOpen className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
            </div>
            <Clock className="h-12 w-12 text-amber-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <Award className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Avg Progress</p>
              <p className="text-3xl font-bold">{stats.avgProgress}%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-200" />
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

        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment._id}
                to={`/courses/${enrollment.course._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={enrollment.course.thumbnail}
                    alt={enrollment.course.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Instructor: {enrollment.course.instructor?.name}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-semibold text-primary">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      {enrollment.certificateIssued && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Award className="h-5 w-5" />
                          <span className="text-sm font-medium">Certified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
            <Link to="/" className="btn-primary">
              Explore Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;