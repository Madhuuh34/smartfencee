/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FarmProvider } from './context/FarmContext';
import { NavPage, Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LivePrototypeDemoPage } from './pages/LivePrototypeDemoPage';
import { DashboardPage } from './pages/DashboardPage';
import { SatelliteMapPage } from './pages/SatelliteMapPage';
import { CamerasPage } from './pages/CamerasPage';
import { DeterrencePage } from './pages/DeterrencePage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EventDrawer } from './components/events/EventDrawer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('demo');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <FarmProvider>
      <div className="min-h-screen bg-[#07130e] text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* MAIN APPLICATION CONTENT WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
          <Navbar
            currentPage={currentPage}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto pb-12">
            {currentPage === 'demo' && <LivePrototypeDemoPage />}
            {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
            {currentPage === 'map' && <SatelliteMapPage />}
            {currentPage === 'cameras' && <CamerasPage />}
            {currentPage === 'deterrence' && <DeterrencePage />}
            {currentPage === 'events' && <EventsPage />}
            {currentPage === 'settings' && <SettingsPage />}
          </main>
        </div>

        {/* GLOBAL EVENT DETAILS DRAWER */}
        <EventDrawer />
      </div>
    </FarmProvider>
  );
}
