import { Link } from 'react-router-dom';
import { Users, Clock, Star } from 'lucide-react';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course._id}`} className="card hover:shadow-lg transition-shadow">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
            {course.category}
          </span>
          <span className="text-xs text-gray-600">{course.difficulty}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollmentCount} students</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {course.instructor && (
          <div className="flex items-center space-x-2 pt-2 border-t">
            <img
              src={course.instructor.photo}
              alt={course.instructor.name}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-sm text-gray-700">{course.instructor.name}</span>
          </div>
        )}
      </div>
    </Link>
  );
};
export default CourseCard;