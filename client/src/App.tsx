import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { DonorsPage } from './pages/DonorsPage';
import { DonationsPage } from './pages/DonationsPage';
import { InventoryPage } from './pages/InventoryPage';
import { RequestsPage } from './pages/RequestsPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { PatientsPage } from './pages/PatientsPage';
import { StaffPage } from './pages/StaffPage';
import { SQLAnalyticsPage } from './pages/SQLAnalyticsPage';
import { getDashboardStats } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState<{ isUsingPgMem: boolean; status: string }>({
    isUsingPgMem: false,
    status: 'Connected'
  });

  useEffect(() => {
    getDashboardStats()
      .then((stats) => {
        if (stats.db_status) setDbStatus(stats.db_status);
      })
      .catch(() => {});
  }, []);

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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={header.title} subtitle={header.subtitle} dbStatus={dbStatus} />

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
