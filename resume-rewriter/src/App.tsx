import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/auth-context';
import { queryClient } from '@/lib/query-client';

// 布局组件
import { NavBar } from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';
import { SiteRouterEffects } from '@/components/site/site-router-effects';

// 页面
import { HomePage } from '@/pages/home-page';
import { OnboardingPage } from '@/pages/onboarding-page';
import { FeaturesPage } from '@/pages/features-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { GoogleCallbackPage } from '@/pages/auth/google-callback-page';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { OptimizeResumePage } from '@/pages/resume/optimize-resume-page';
import { MyResumesPage } from '@/pages/resume/my-resumes-page';
import { PricingPage } from '@/pages/subscription/pricing-page';
import { TemplatesPage } from '@/pages/templates-page';
import { ProfilePage } from '@/pages/profile-page';
import { SubscriptionPage } from '@/pages/subscription/subscription-page';
import { ResumeHistoryPage } from '@/pages/history-page';
import { PrivacyPage } from '@/pages/legal/privacy-page';
import { TermsPage } from '@/pages/legal/terms-page';
import { NotFoundPage } from '@/pages/not-found-page';

// 保护路由组件
import { ProtectedRoute } from '@/components/auth/protected-route';

// The router is injectable so scripts/prerender.mjs can render pages with a StaticRouter.
type AppProps = {
  Router?: (props: { children: ReactNode }) => JSX.Element;
};

export default function App({ Router = BrowserRouter }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SiteRouterEffects />
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow flex flex-col min-h-[calc(100svh-65px)]">
              <Routes>
                <Route path="/" element={<OnboardingPage />} />
                <Route path="/about" element={<HomePage />} />
                <Route path="/home" element={<Navigate to="/about" replace />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
                
                {/* Dashboard is accessible without login (users can upload and process, but need login to download) */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/history" element={<ResumeHistoryPage />} />
                
                {/* 受保护路由 */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/subscription" element={
                  <ProtectedRoute>
                    <SubscriptionPage />
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

                <Route path="*" element={<NotFoundPage />} />
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
