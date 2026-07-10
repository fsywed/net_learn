import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import TargetList from './pages/TargetList'
import TargetDetail from './pages/TargetDetail'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

// 应用路由：AuthProvider 包裹全局，受保护页用 ProtectedRoute 守卫
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          {/* 公开页面 */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* 需登录 */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/targets"
            element={
              <ProtectedRoute>
                <TargetList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/targets/:templateId"
            element={
              <ProtectedRoute>
                <TargetDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* 仅管理员 */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
