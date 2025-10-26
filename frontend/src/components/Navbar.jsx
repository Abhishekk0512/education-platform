import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">EduPlatform</span>
            </Link>
          </div>
          

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-primary transition-colors">
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;