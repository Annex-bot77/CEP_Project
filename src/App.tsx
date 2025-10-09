import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { LaborMarketplace } from './components/LaborMarketplace';
import { TractorMarketplace } from './components/TractorMarketplace';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onAuthClick={() => setShowAuthModal(true)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {currentPage === 'home' && (
        <HomePage
          onNavigate={setCurrentPage}
          onAuthClick={() => setShowAuthModal(true)}
        />
      )}

      {currentPage === 'labor' && (
        <LaborMarketplace onAuthClick={() => setShowAuthModal(true)} />
      )}

      {currentPage === 'tractors' && (
        <TractorMarketplace onAuthClick={() => setShowAuthModal(true)} />
      )}

      {currentPage === 'dashboard' && <Dashboard />}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
