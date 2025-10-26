import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { courseAPI } from '../services/api';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const categories = ['AI', 'Data Science', 'Web Development', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'Other'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;

      const response = await courseAPI.getAllCourses(params);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to EduPlatform
        </h1>
        <p className="text-xl text-gray-600">
          Discover thousands of courses and start learning today
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex gap-4 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Levels</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>

          {(category || difficulty || search) && (
            <button
              onClick={() => {
                setCategory('');
                setDifficulty('');
                setSearch('');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No courses found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Home;