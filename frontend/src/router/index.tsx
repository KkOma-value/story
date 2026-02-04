import { createBrowserRouter, Navigate } from 'react-router-dom';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { RequireAuth } from '../components/RequireAuth';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { NovelDetailPage } from '../pages/NovelDetailPage';
import { CategoryPage } from '../pages/CategoryPage';
import { RankingPage } from '../pages/RankingPage';
import { BookshelfPage } from '../pages/BookshelfPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ReaderPage } from '../pages/ReaderPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminNovels } from '../pages/admin/AdminNovels';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { ProfilePage } from '../pages/ProfilePage';

export const router = createBrowserRouter([
  // ========== Public routes ==========
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ResetPasswordPage /> },

  // ========== Reader Route (Immersive) ==========
  {
    path: '/read/:id',
    element: <ReaderPage />,
  },

  // ========== Public browsing routes (no auth required) ==========
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'novels/:id', element: <NovelDetailPage /> },
      { path: 'category', element: <CategoryPage /> },
      { path: 'ranking', element: <RankingPage /> },
    ],
  },

  // ========== Protected user routes ==========
  {
    path: '/',
    element: (
      <RequireAuth>
        <UserLayout />
      </RequireAuth>
    ),
    children: [
      { path: 'bookshelf', element: <BookshelfPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  // ========== Admin routes ==========
  {
    path: '/admin',
    element: (
      <RequireAuth requiredRole="admin">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'novels', element: <AdminNovels /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'analytics', element: <AdminAnalytics /> },
    ],
  },

  // ========== Fallback ==========
  { path: '*', element: <Navigate to="/" replace /> },
]);
