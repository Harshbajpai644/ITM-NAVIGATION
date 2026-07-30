import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import VisitorPassPage from './pages/VisitorPassPage'
import NavigatePage from './pages/NavigatePage'
import BuildingsPage from './pages/BuildingsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminBuildingsPage from './pages/AdminBuildingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="visitor-pass" element={<VisitorPassPage />} />
        <Route path="navigate" element={<NavigatePage />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/buildings"
          element={
            <ProtectedRoute>
              <AdminBuildingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}