# 🎓 Education Platform

A full-stack education platform with role-based authentication, course management, and progress tracking.  
[🌐 **Live Demo**](https://education-platform-phi-five.vercel.app/) • [📘 **Documentation**](https://docs.google.com/document/d/1rtkEmjCM_3JLfbPUaT1NdvKZ47hwxp2EIg0DmKA3VBA/edit?usp=sharing)

---

## 📖 About The Project

**Education Platform** is a comprehensive learning management system built with the **MERN stack**.  
It enables **students** to enroll in courses, track progress, and earn certificates — while **teachers** can create and manage courses.  
**Administrators** have full control over user management and content moderation.

> Developed for: **PPStack.ai Web Developer Internship Assignment**  
> *(Doc No: PP00132124)*

---

## ✨ Key Features

- 🔐 **JWT Authentication** — Secure token-based authentication  
- 👥 **Role-Based Access** — Student, Teacher, and Admin roles  
- 📚 **Course Management** — Create, edit, and manage courses  
- 📊 **Progress Tracking** — Visual progress indicators  
- 🎓 **Certificates** — Auto-generated upon course completion  
- 📱 **Responsive Design** — Works seamlessly on all devices  
- 🔍 **Advanced Search** — Filter by category, difficulty, or keywords  
- 📈 **Analytics Dashboard** — Track platform statistics  

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React 18.2** — UI Library  
- **Vite 5.0** — Build Tool  
- **Tailwind CSS 3.3** — Styling  
- **React Router 6.20** — Routing  
- **Axios** — HTTP Client  
- **Lucide React** — Icons  

### ⚙️ Backend
- **Node.js 14+** — Runtime Environment  
- **Express.js 4.18** — Web Framework  
- **MongoDB 6+** — Database  
- **Mongoose 8.0** — ODM  
- **JWT** — Authentication  
- **bcryptjs** — Password Hashing  

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js (v14 or higher)](https://nodejs.org/)  
- [MongoDB (v6 or higher)](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  
- [Git](https://git-scm.com/)  
- npm or yarn  

---

## 🚀 Deployment

### 🔹 Frontend (Vercel)

1. Push code to **GitHub**
2. Visit [Vercel](https://vercel.com) and import your repository  
3. Configure:
   - **Framework:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:  
   - `VITE_API_URL` = your backend URL  
5. Deploy 🎉

---

### 🔹 Backend (Render)

1. Visit [Render](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository  
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables from your `.env` file  
5. Deploy 🚀

---

### 🔹 Database (MongoDB Atlas)

1. Create a **cluster** on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  
2. Copy your **connection string**  
3. Update `MONGODB_URI` in backend environment variables  

---

⭐ **Star this repo** if you find it helpful!  
