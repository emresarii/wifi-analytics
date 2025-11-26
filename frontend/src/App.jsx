import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, Title, NavLink, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, Home, Settings } from 'lucide-react';

// OLUŞTURDUĞUMUZ SAYFALAR
import DashboardPage from './pages/DashboardPage';
import HouseListPage from './pages/HouseListPage';
import HouseDetailPage from './pages/HouseDetailPage';

// --- Yardımcı Bileşen: Navigasyon Linki ---
// Aktif sayfanın linkini mavi renkte göstermek için
const NavItem = ({ to, label, icon: Icon, onClick }) => {
  const location = useLocation();
  // Eğer şu anki yol bu linke eşitse veya bu linkle başlıyorsa (alt sayfalar için) aktif yap
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <NavLink
      component={Link}
      to={to}
      label={label}
      leftSection={<Icon size={18} />}
      active={active}
      onClick={onClick}
      variant="light"
      color="blue"
      className="rounded-md mb-1 font-medium"
    />
  );
};

// --- App İçeriği ---
// Router Hook'larını (useLocation vb.) kullanabilmek için Router içinde olmalı
const AppContent = () => {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      className="bg-gray-50 min-h-screen"
    >
      {/* --- ÜST BAŞLIK (HEADER) --- */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div className="flex items-center gap-3 select-none">
              <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                <Home size={20} />
              </ThemeIcon>
              <Title order={3} className="text-gray-800 font-bold hidden xs:block">
                Wifi Analytics
              </Title>
            </div>
          </Group>
        </Group>
      </AppShell.Header>

      {/* --- SOL MENÜ (NAVBAR) --- */}
      <AppShell.Navbar p="md">
        <div className="flex flex-col gap-1">
          <div className="mb-4 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Ana Menü
          </div>
          
          <NavItem 
            to="/" 
            label="Genel Bakış (Dashboard)" 
            icon={LayoutDashboard} 
            onClick={close} 
          />
          
          <NavItem 
            to="/houses" 
            label="Ev Listesi & Raporlar" 
            icon={Home} 
            onClick={close} 
          />
          
          {/* Ayarlar sayfası henüz yok ama menüde yerini hazırladık */}
          <div className="mt-4 mb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Sistem
          </div>
          <NavItem 
            to="/settings" 
            label="Ayarlar" 
            icon={Settings} 
            onClick={close} 
          />
        </div>
      </AppShell.Navbar>

      {/* --- ANA İÇERİK ALANI --- */}
      <AppShell.Main>
        <Routes>
          {/* 1. Dashboard (Ana Sayfa) */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* 2. Ev Listesi */}
          <Route path="/houses" element={<HouseListPage />} />
          
          {/* 3. Ev Detay Sayfası (Parametrik URL: houseId) */}
          <Route path="/houses/:houseId" element={<HouseDetailPage />} />
          
          {/* 404 Sayfası */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p>Aradığınız sayfa bulunamadı.</p>
            </div>
          } />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

// --- ANA UYGULAMA ---
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;