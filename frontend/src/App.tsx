import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { PotentialMatchesPage } from './pages/PotentialMatchesPage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { AdminClaimsPage } from './pages/AdminClaimsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';

// Errors
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#0B1020] text-[#F1F5F9]">
          <Navbar />
          <main className="flex-1 bg-[#0B1020]">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/items/:id/matches" element={<PotentialMatchesPage />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-lost"
                element={
                  <ProtectedRoute>
                    <ReportLostPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-found"
                element={
                  <ProtectedRoute>
                    <ReportFoundPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims"
                element={
                  <ProtectedRoute>
                    <ClaimsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <AdminRoute>
                    <AdminModerationPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/claims"
                element={
                  <AdminRoute>
                    <AdminClaimsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <AdminRoute>
                    <AdminCategoriesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <AdminRoute>
                    <AdminAuditLogsPage />
                  </AdminRoute>
                }
              />

              {/* Status / Error Pages */}
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
