import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { LoadingScreen } from './components/shared/Skeleton'
import { ToastContainer } from './components/shared/Toast'

// Layouts
import { StudentLayout } from './components/layouts/StudentLayout'
import { CounselorLayout } from './components/layouts/CounselorLayout'
import { AdminLayout } from './components/layouts/AdminLayout'

// Auth pages
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import SetPassword from './pages/SetPassword'
import ForgotPassword from './pages/ForgotPassword'
import Unauthorized from './pages/Unauthorized'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentDocuments from './pages/student/Documents'
import StudentPrefList from './pages/student/PrefList'
import StudentSessions from './pages/student/Sessions'
import StudentProfile from './pages/student/Profile'
import StudentNotices from './pages/student/Notices'
import StudentTimeline from './pages/student/Timeline'

// Counselor pages
import CounselorDashboard from './pages/counselor/Dashboard'
import CounselorStudents from './pages/counselor/Students'
import CounselorStudentDetail from './pages/counselor/StudentDetail'
import CounselorSessions from './pages/counselor/Sessions'
import CounselorPrefLists from './pages/counselor/PrefLists'
import CounselorNotifications from './pages/counselor/Notifications'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminCounselors from './pages/admin/Counselors'
import AdminCounselorDetail from './pages/admin/CounselorDetail'
import AdminPrefLists from './pages/admin/PrefLists'
import AdminCAPTimeline from './pages/admin/CAPTimeline'
import AdminNotifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/Settings'

function AuthGuard({ children, allowedRoles }) {
  const { user, hydrated } = useAuthStore()
  if (!hydrated) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

export default function App() {
  const { user, hydrated } = useAuthStore()

  if (!hydrated) return <LoadingScreen />

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={`/${user.role === 'student' ? 'student/home' : 'counselor/dashboard'}`} replace /> : <Login />} />
        <Route path="/admin-login" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
        <Route path="/setup-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Student portal */}
        <Route path="/student" element={
          <AuthGuard allowedRoles={['student']}>
            <StudentLayout />
          </AuthGuard>
        }>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<StudentDashboard />} />
          <Route path="documents" element={<StudentDocuments />} />
          <Route path="pref-list" element={<StudentPrefList />} />
          <Route path="sessions" element={<StudentSessions />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="notices" element={<StudentNotices />} />
          <Route path="timeline" element={<StudentTimeline />} />
        </Route>

        {/* Counselor portal */}
        <Route path="/counselor" element={
          <AuthGuard allowedRoles={['counselor']}>
            <CounselorLayout />
          </AuthGuard>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CounselorDashboard />} />
          <Route path="students" element={<CounselorStudents />} />
          <Route path="students/:id" element={<CounselorStudentDetail />} />
          <Route path="sessions" element={<CounselorSessions />} />
          <Route path="pref-lists" element={<CounselorPrefLists />} />
          <Route path="notifications" element={<CounselorNotifications />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin" element={
          <AuthGuard allowedRoles={['admin']}>
            <AdminLayout />
          </AuthGuard>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id" element={<CounselorStudentDetail />} />
          <Route path="counselors" element={<AdminCounselors />} />
          <Route path="counselors/:id" element={<AdminCounselorDetail />} />
          <Route path="pref-lists" element={<AdminPrefLists />} />
          <Route path="cap-timeline" element={<AdminCAPTimeline />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
