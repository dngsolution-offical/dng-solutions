import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import AppToaster from './components/ui/AppToaster';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Services from './pages/Services';
import Packages from './pages/Packages';
import About from './pages/About';
import Contact from './pages/Contact';
import Report from './pages/Report';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AIAutomation from './pages/AIAutomation';
import Admin from './pages/Admin';
import AdminPayments from './pages/AdminPayments';
import AdminLogin from './pages/AdminLogin';
import AdminAgents from './pages/AdminAgents';
import AgentHistory from './pages/AgentHistory';
import Schedules from './pages/Schedules';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Diagnostic from './pages/Diagnostic';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Agents from './pages/Agents';
import Dashboard from './pages/Dashboard';
import Telegram from './pages/Telegram';
import SiteAssistant from './components/assistant/SiteAssistant';

const FULLSCREEN_ROUTES = ['/agents', '/agents/history', '/agents/schedules'];

function AppContent() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + '/')
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-16 sm:pt-[72px]">
      {!isFullscreen && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/report" element={<Report />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ai" element={<AIAutomation />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/agents" element={<AdminAgents />} />
          <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
          <Route path="/agents/history" element={<AgentHistory />} />
          <Route path="/agents/schedules" element={<Schedules />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/:packageId" element={<Checkout />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/telegram" element={<ProtectedRoute><Telegram /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {!isFullscreen && <Footer />}
      <SiteAssistant />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="never">
      <Router>
        <AppContent />
        <AppToaster />
      </Router>
    </MotionConfig>
  );
}
