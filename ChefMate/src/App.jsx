import { Toaster } from "./components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from './lib/AuthContext';
import UserNotRegisteredError from './components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
// Add page imports here
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import Recommendation from './pages/Recommendation';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import RecipeManagement from './pages/admin/RecipeManagement';
import IngredientManagement from './pages/admin/IngredientManagement';
import VideoManagement from './pages/admin/VideoManagement';
import AIModelComparison from './pages/admin/AIModelComparison';
import Login from './pages/Login'; 
import Register from './pages/Register'; 


// Admin route guard — only allows admin role
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/recommendation" element={<Recommendation />} />

        {/* Protected user routes */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute />}>
        {/* ใช้ ProtectedRoute ตัวเดิมที่เราทำไว้ครอบทุกอัน */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/recipes" element={<ProtectedRoute requireAdmin={true}><RecipeManagement /></ProtectedRoute>} />
        <Route path="/admin/ingredients" element={<ProtectedRoute requireAdmin={true}><IngredientManagement /></ProtectedRoute>} />
        <Route path="/admin/videos" element={<ProtectedRoute requireAdmin={true}><VideoManagement /></ProtectedRoute>} />
        <Route path="/admin/ai-models" element={<ProtectedRoute requireAdmin={true}><AIModelComparison /></ProtectedRoute>} />
      </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App