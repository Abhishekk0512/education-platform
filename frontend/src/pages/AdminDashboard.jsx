import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, BookOpen, Clock, CheckCircle, X, Trash2, UserCheck, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminAPI.getAnalytics();
      setAnalytics(analyticsData.data);

      if (activeTab === 'users') {
        const usersData = await adminAPI.getUsers();
        setUsers(usersData.data);
      } else if (activeTab === 'courses') {
        const coursesData = await adminAPI.getPendingCourses();
        setPendingCourses(coursesData.data);
      } else if (activeTab === 'allCourses') {
        const coursesData = await adminAPI.getAllCourses();
        setAllCourses(coursesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, isApproved) => {
    try {
      await adminAPI.updateUser(userId, { isApproved });
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminAPI.deleteUser(userId);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleApproveCourse = async (courseId, isApproved) => {
    try {
      await adminAPI.approveCourse(courseId, isApproved);
      fetchData();
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const handleViewCourse = (courseId) => {
    window.location.href = `/courses/${courseId}`;
  };

  if (loading && activeTab === 'analytics') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{analytics.totalUsers || 0}</p>
              <p className="text-xs text-blue-100 mt-1">
                {analytics.totalStudents} students, {analytics.totalTeachers} teachers
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Courses</p>
              <p className="text-3xl font-bold">{analytics.totalCourses || 0}</p>
            </div>
            <BookOpen className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold">
                {(analytics.pendingCourses || 0) + (analytics.pendingTeachers || 0)}
              </p>
              <p className="text-xs text-amber-100 mt-1">
                {analytics.pendingCourses} courses, {analytics.pendingTeachers} teachers
              </p>
            </div>
            <Clock className="h-12 w-12 text-amber-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Enrollments</p>
              <p className="text-3xl font-bold">{analytics.totalEnrollments || 0}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'courses'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Courses
          </button>
          <button
            onClick={() => setActiveTab('allCourses')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allCourses'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Courses
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold text-gray-900">{analytics.totalStudents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Teachers</span>
                  <span className="font-semibold text-gray-900">{analytics.totalTeachers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold text-primary">{analytics.totalUsers || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approved Courses</span>
                  <span className="font-semibold text-gray-900">{analytics.totalCourses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Courses</span>
                  <span className="font-semibold text-amber-600">{analytics.pendingCourses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Enrollments</span>
                  <span className="font-semibold text-primary">{analytics.totalEnrollments || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.photo}
                            alt={user.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isApproved ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!user.isApproved && (
                            <button
                              onClick={() => handleApproveUser(user._id, true)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve User"
                            >
                              <UserCheck className="h-5 w-5" />
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No users found</p>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Course Approvals</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingCourses.length > 0 ? (
            <div className="space-y-4">
              {pendingCourses.map((course) => (
                <div key={course._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewCourse(course._id)}
                      />
                      <div className="flex-1">
                        <h3 
                          className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewCourse(course._id)}
                        >
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Instructor: {course.instructor?.name} ({course.instructor?.email})
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{course.category}</span>
                          <span>•</span>
                          <span>{course.difficulty}</span>
                          <span>•</span>
                          <span>{course.lessons?.length || 0} lessons</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewCourse(course._id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="View Course Details"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleApproveCourse(course._id, true)}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveCourse(course._id, false)}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No pending courses</p>
          )}
        </div>
      )}

      {activeTab === 'allCourses' && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Courses</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allCourses.length > 0 ? (
            <div className="space-y-4">
              {allCourses.map((course) => (
                <div key={course._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewCourse(course._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleViewCourse(course._id)}
                          >
                            {course.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            course.isApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {course.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Instructor: {course.instructor?.name}
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{course.category}</span>
                          <span>•</span>
                          <span>{course.difficulty}</span>
                          <span>•</span>
                          <span>{course.enrollmentCount || 0} students</span>
                          <span>•</span>
                          <span>{course.sections?.reduce((total, s) => total + s.lectures.length, 0) || 0} lectures</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewCourse(course._id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-4"
                      title="View Course Details"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No courses found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;