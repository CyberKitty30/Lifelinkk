import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DonorsPage } from './pages/DonorsPage';
import { DonationsPage } from './pages/DonationsPage';
import { InventoryPage } from './pages/InventoryPage';
import { RequestsPage } from './pages/RequestsPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { PatientsPage } from './pages/PatientsPage';
import { StaffPage } from './pages/StaffPage';
import { SQLAnalyticsPage } from './pages/SQLAnalyticsPage';
import { getDashboardStats, getCurrentUserSession, logoutUser } from './services/api';
import { AuthUser } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState<{ isUsingPgMem: boolean; status: string }>({
    isUsingPgMem: false,
    status: 'Connected'
  });

  useEffect(() => {
    // Load persisted user session or default to null
    const session = getCurrentUserSession();
    if (session) {
      setCurrentUser(session);
    }

    getDashboardStats()
      .then((stats) => {
        if (stats.db_status) setDbStatus(stats.db_status);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'System Dashboard', subtitle: 'Overview of blood stock matrix, donor counts, emergency alerts & active requests' };
      case 'donors':
        return { title: 'Donor Management', subtitle: 'Register, edit, filter, and review donor profile history' };
      case 'donations':
        return { title: 'Blood Donations', subtitle: 'Record blood donations and auto-generate inventory units' };
      case 'inventory':
        return { title: 'Blood Inventory Stock', subtitle: 'Track blood group components, volume, expiry warnings & unit statuses' };
      case 'requests':
        return { title: 'Hospital Blood Requests', subtitle: 'Review hospital blood requests and execute blood issue workflows' };
      case 'hospitals':
        return { title: 'Hospital Directory', subtitle: 'Manage healthcare institutions, emergency hotlines, and admitted patients' };
      case 'patients':
        return { title: 'Patient Records', subtitle: 'Admitted patients requiring blood transfusions and medical notes' };
      case 'staff':
        return { title: 'Staff Directory', subtitle: 'Donation center medical officers, phlebotomists, and lab technicians' };
      case 'analytics':
        return { title: 'SQL Analytics & DBMS Workbench', subtitle: '15 Live relational SQL queries demonstrating JOINs, subqueries, HAVING, and aggregate functions' };
      default:
        return { title: 'LifeLink System', subtitle: 'Blood Donation & Blood Bank Management System' };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={header.title}
          subtitle={header.subtitle}
          dbStatus={dbStatus}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'donors' && <DonorsPage />}
          {activeTab === 'donations' && <DonationsPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'requests' && <RequestsPage />}
          {activeTab === 'hospitals' && <HospitalsPage />}
          {activeTab === 'patients' && <PatientsPage />}
          {activeTab === 'staff' && <StaffPage />}
          {activeTab === 'analytics' && <SQLAnalyticsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
