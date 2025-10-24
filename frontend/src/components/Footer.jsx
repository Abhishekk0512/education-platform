import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">EduPlatform</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2024 EduPlatform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;