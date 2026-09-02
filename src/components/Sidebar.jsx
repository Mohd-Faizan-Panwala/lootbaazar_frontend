import React from 'react';
import logo from "../assets/logo.png";
import minilogo from "../assets/minilogo.png";

import { 
  LayoutDashboard,
  Users, 
  Grid, 
  ShoppingBag, 
  Ticket,
  MessageSquare,
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  onLogout, 
  isCollapsed, 
  setIsCollapsed 
}) {
  // Ordered directly according to target specifications (skipping Islamic tab)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'category', label: 'Categories', icon: Grid },
    { id: 'product', label: 'Products', icon: ShoppingBag },
    { id: 'coupon', label: 'Coupons', icon: Ticket },
    { id: 'otp-junction', label: 'WhatsApp OTP Junction', icon: MessageSquare },
    { id: 'setting', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '12px' }}>
        {isCollapsed ? (
          /* 1. When COLLAPSED: Show the mini brand logo cleanly sized without layout bugs */
          <div className="relative flex items-center justify-center" style={{ width: '40px', height: '40px' }}>
            <img
              src={minilogo}
              alt="Loot Bazaar Mini"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
          </div>
        ) : (
          /* 2. When NOT COLLAPSED: Show the full typography brand logo asset */
          <div className="relative flex items-center">
            <img
              src={logo}
              alt="Loot Bazaar"
              style={{ width: '150px', height: '40px', objectFit: 'contain' }}
            />
          </div>
        )}
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} style={{ flexShrink: 0 }} />
              <span className="menu-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={onLogout} 
          className="logout-button"
          title={isCollapsed ? 'Log Out' : ''}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          <span className="logout-text">Log Out</span>
        </button>
      </div>
    </aside>
  );
}