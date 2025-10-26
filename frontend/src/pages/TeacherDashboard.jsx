import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, enrollmentAPI } from '../services/api';
import { BookOpen, Users, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    approvedCourses: 0,
    pendingCourses: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getMyCourses();
      setCourses(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (courses) => {
    const total = courses.length;
    const approved = courses.filter(c => c.isApproved).length;
    const pending = total - approved;
    const totalStudents = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);

    setStats({
      totalCourses: total,
      approvedCourses: approved,
      pendingCourses: pending,
      totalStudents
    });
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await courseAPI.deleteCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <Link to="/teacher/create-course" className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create New Course</span>
        </Link>
      </div>

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

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Approved</p>
              <p className="text-3xl font-bold">{stats.approvedCourses}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold">{stats.pendingCourses}</p>
            </div>
            <Clock className="h-12 w-12 text-amber-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <Users className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>

        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.title}
                        </h3>
                        {course.isApproved ? (
                          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollmentCount} students</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lessons?.length || 0} lessons</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/teacher/edit-course/${course._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first course and start teaching</p>
            <Link to="/teacher/create-course" className="btn-primary">
              Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;