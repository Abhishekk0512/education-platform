import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Course API
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  getMyCourses: () => api.get('/courses/teacher/my-courses')
};

// Enrollment API
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMyCourses: () => api.get('/enrollments/my-courses'),
  updateProgress: (id, data) => api.put(`/enrollments/${id}/progress`, data),
  getCourseStudents: (courseId) => api.get(`/enrollments/course/${courseId}/students`)
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingCourses: () => api.get('/admin/courses/pending'),
  approveCourse: (id, isApproved) => api.put(`/admin/courses/${id}/approve`, { isApproved }),
  getAnalytics: () => api.get('/admin/analytics')
};

// Quiz API
export const quizAPI = {
  createQuiz: (data) => api.post('/quiz', data),
  getQuiz: (courseId) => api.get(`/quiz/course/${courseId}`),
  submitQuiz: (id, answers) => api.post(`/quiz/${id}/submit`, { answers })
};

// Upload API
export const uploadAPI = {
  uploadPDF: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    return api.post('/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  
  uploadVideo: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    
    return api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  
  uploadThumbnail: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    return api.post('/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  uploadProfilePhoto: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    return api.post('/upload/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  }
};

export default api;