import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppQRModal from './components/WhatsAppQRModal';
import LeadCapturePage from './views/LeadCapturePage';

// Core views
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import CategoryView from './views/CategoryView';
import ProductsView from './views/ProductsView';
import CouponView from './views/CouponView';
import OrdersView from './views/OrdersView';
import SettingView from './views/SettingView';
import OtpJunctionView from './views/OtpJunctionView';

export default function App() {
  const isLeadCaptureRoute = window.location.pathname === '/lead-capture';

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLeadCaptureRoute) {
    return <LeadCapturePage />;
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('isAdminLoggedIn', 'true');
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminUser');
      setActiveTab('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'users': return <UsersView />;
      case 'category': return <CategoryView />;
      case 'product': return <ProductsView />;
      case 'coupon': return <CouponView />;
      case 'orders': return <OrdersView />;
      case 'setting': return <SettingView />;
      case 'otp-junction': return <OtpJunctionView />;
      default: return <DashboardView />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="main-wrapper">
        <Header activeTab={activeTab} user={user} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="content-area">{renderActiveView()}</main>
        <Footer />
      </div>

      <WhatsAppQRModal />
    </div>
  );
}