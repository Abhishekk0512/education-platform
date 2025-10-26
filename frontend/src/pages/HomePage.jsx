import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Video, 
  MessageSquare, 
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Target,
  Clock
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Lectures",
      description: "High-quality video content with interactive lessons and materials"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Course Materials",
      description: "PDF documents, assignments, and comprehensive study resources"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Discussion Forums",
      description: "Engage with peers and instructors in course discussions"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Certificates",
      description: "Earn certificates upon successful course completion"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Instructors",
      description: "Learn from industry professionals and experienced teachers"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Expert Teachers" },
    { number: "1,000+", label: "Courses Available" },
    { number: "95%", label: "Success Rate" }
  ];

  const benefits = [
    "Learn at your own pace with flexible scheduling",
    "Access courses from anywhere, anytime",
    "Interactive content with real-world applications",
    "Community support and peer learning",
    "Affordable pricing with quality education",
    "Regular updates and new course additions"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">Welcome to the Future of Learning</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Future with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  Online Education
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Join thousands of learners worldwide. Access expert-led courses, 
                interactive content, and earn recognized certificates.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
                >
                  Browse Courses
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>Free trial available</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100">Current Course</div>
                      <div className="font-semibold">Web Development</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white/10 rounded-xl">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">75%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/10 rounded-xl text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                      <div className="text-2xl font-bold">12</div>
                      <div className="text-xs text-blue-100">Completed</div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-xl text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-green-300" />
                      <div className="text-2xl font-bold">48h</div>
                      <div className="text-xs text-blue-100">Learning Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides all the tools and resources you need for an 
              exceptional learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're committed to providing the best online learning experience 
                with features designed around your success.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Popular Courses</h3>
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
                
                <div className="space-y-4">
                  {['Web Development', 'Data Science', 'Digital Marketing', 'UI/UX Design'].map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {course.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{course}</div>
                          <div className="text-sm text-gray-500">{Math.floor(Math.random() * 50 + 20)} lessons</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;