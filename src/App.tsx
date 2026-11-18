import React, { useState } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { FlockGrowthView } from './components/FlockGrowthView';
import { HealthVeterinaryView } from './components/HealthVeterinaryView';
import { FlocksHousesView } from './components/FlocksHousesView';
import { FeedWaterView } from './components/FeedWaterView';
import { FinancesView } from './components/FinancesView';
import { AIAssistantView } from './components/AIAssistantView';

// Modals
import { AddWeightModal } from './components/Modals/AddWeightModal';
import { AddHealthModal } from './components/Modals/AddHealthModal';
import { AddVaccineModal } from './components/Modals/AddVaccineModal';
import { AddTreatmentModal } from './components/Modals/AddTreatmentModal';
import { AddFeedModal } from './components/Modals/AddFeedModal';
import { AddFlockModal } from './components/Modals/AddFlockModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { activeSanitaryAlertsCount } = useFarm();

  // Modal display states
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isFlockModalOpen, setIsFlockModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3D4035] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased selection:bg-[#4A6741] selection:text-white">
      {/* App Header */}
      <Header onOpenAIAssistant={() => setActiveTab('ai_advisor')} />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertsCount={activeSanitaryAlertsCount}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddWeight={() => setIsWeightModalOpen(true)}
            onOpenAddHealth={() => setIsHealthModalOpen(true)}
            onOpenAddFeed={() => setIsFeedModalOpen(true)}
            onOpenAIAssistant={() => setActiveTab('ai_advisor')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'flocks' && (
          <FlocksHousesView onOpenAddFlock={() => setIsFlockModalOpen(true)} />
        )}

        {activeTab === 'growth' && (
          <FlockGrowthView onOpenAddWeight={() => setIsWeightModalOpen(true)} />
        )}

        {activeTab === 'health' && (
          <HealthVeterinaryView
            onOpenAddHealth={() => setIsHealthModalOpen(true)}
            onOpenAddVaccine={() => setIsVaccineModalOpen(true)}
            onOpenAddTreatment={() => setIsTreatmentModalOpen(true)}
          />
        )}

        {activeTab === 'feed' && (
          <FeedWaterView onOpenAddFeed={() => setIsFeedModalOpen(true)} />
        )}

        {activeTab === 'finances' && <FinancesView />}

        {activeTab === 'ai_advisor' && <AIAssistantView />}
      </main>

      {/* Global Data Entry Modals */}
      <AddWeightModal isOpen={isWeightModalOpen} onClose={() => setIsWeightModalOpen(false)} />
      <AddHealthModal isOpen={isHealthModalOpen} onClose={() => setIsHealthModalOpen(false)} />
      <AddVaccineModal isOpen={isVaccineModalOpen} onClose={() => setIsVaccineModalOpen(false)} />
      <AddTreatmentModal isOpen={isTreatmentModalOpen} onClose={() => setIsTreatmentModalOpen(false)} />
      <AddFeedModal isOpen={isFeedModalOpen} onClose={() => setIsFeedModalOpen(false)} />
      <AddFlockModal isOpen={isFlockModalOpen} onClose={() => setIsFlockModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <FarmProvider>
        <AppContent />
      </FarmProvider>
    </ErrorBoundary>
  );
}
