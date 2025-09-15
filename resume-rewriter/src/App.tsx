import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/auth-context';
import { queryClient } from '@/lib/query-client';

// 布局组件
import { NavBar } from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';

// 页面
import { HomePage } from '@/pages/home-page';
import { FeaturesPage } from '@/pages/features-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { OptimizeResumePage } from '@/pages/resume/optimize-resume-page';
import { MyResumesPage } from '@/pages/resume/my-resumes-page';
import { PricingPage } from '@/pages/subscription/pricing-page';
import { TemplatesPage } from '@/pages/templates-page';

// 保护路由组件
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* 受保护路由 */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/optimize/:id" element={
                  <ProtectedRoute>
                    <OptimizeResumePage />
                  </ProtectedRoute>
                } />
                <Route path="/my-resumes" element={
                  <ProtectedRoute>
                    <MyResumesPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
