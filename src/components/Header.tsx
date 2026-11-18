import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { RefreshCw, Download, Sparkles, Building2, Database, LogIn, LogOut, Check } from 'lucide-react';

interface HeaderProps {
  onOpenAIAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIAssistant }) => {
  const {
    flocks,
    houses,
    selectedFlockId,
    setSelectedFlockId,
    resetAllData,
    user,
    isAuthLoading,
    cloudSyncStatus,
    lastSyncTime,
    signInWithGoogle,
    signOutUser,
  } = useFarm();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportCSV = () => {
    if (flocks.length === 0) return;

    const headers = [
      'Code Lot',
      'Désignation',
      'Souche',
      'Bâtiment',
      'Âge (sem.)',
      'Effectif Initial',
      'Effectif Actuel',
      'Survie (%)',
      'Poids Moyen (g)',
      'Objectif (g)',
      'Statut',
    ];
    const rows = flocks.map((f) => {
      const house = houses.find((h) => h.id === f.houseId);
      const survival = f.initialCount > 0 ? ((f.currentCount / f.initialCount) * 100).toFixed(1) : '100.0';
      return [
        f.code,
        f.name,
        f.breed,
        house?.code || f.houseId,
        f.ageWeeks,
        f.initialCount,
        f.currentCount,
        survival,
        f.currentWeightGrams || 0,
        f.targetWeightGrams || 0,
        f.status,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suivi_lots_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    resetAllData();
  };

  return (
    <header className="h-16 md:h-20 bg-[#4A6741] text-[#FDFCF8] flex items-center justify-between px-4 md:px-8 border-b border-[#3D5235] shadow-sm shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-9 h-9 md:w-10 md:h-10 bg-[#D4A373] rounded-xl flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-[#FDFCF8]/20">
          <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold tracking-tight uppercase font-['Outfit',sans-serif] whitespace-nowrap">
              Ferme Éco-Avenir
            </h1>
          </div>
          <p className="text-[11px] text-[#FDFCF8]/80 hidden md:block">
            Système Intégré de Suivi des Lots Avicoles, Croissance & Santé
          </p>
        </div>
      </div>

      {/* Center Flock Filter */}
      <div className="hidden lg:flex items-center gap-2 bg-[#3D5235]/70 border border-[#FDFCF8]/15 px-3 py-1.5 rounded-2xl">
        <Building2 className="w-4 h-4 text-[#D4A373]" />
        <span className="text-xs text-[#FDFCF8]/80 font-medium">Vue Lot :</span>
        <select
          value={selectedFlockId}
          onChange={(e) => setSelectedFlockId(e.target.value)}
          className="bg-transparent text-xs font-bold text-[#FDFCF8] focus:outline-none cursor-pointer pr-2"
        >
          <option value="all" className="bg-[#3D5235] text-white">Tous les Lots (Global)</option>
          {flocks.map((flock) => (
            <option key={flock.id} value={flock.id} className="bg-[#3D5235] text-white">
              {flock.name} ({flock.breed} - {flock.ageWeeks} sem.)
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Firebase Cloud Sync / Google Auth */}
        {user ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#3D5235] border border-[#FDFCF8]/15 text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#D4A373]" />
            <span
              className="font-semibold text-white/90 max-w-[110px] truncate"
              title={
                cloudSyncStatus === 'synced'
                  ? `Synchronisé (${user.email || 'Google'}) · ${lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'En direct'}`
                  : cloudSyncStatus === 'syncing'
                  ? 'Synchronisation Firebase en cours...'
                  : 'Mode hors-ligne / Cache local actif'
              }
            >
              {user.displayName?.split(' ')[0] || 'Cloud'}
            </span>
            {cloudSyncStatus === 'synced' && <span className="w-2 h-2 rounded-full bg-[#27AE60]" />}
            {cloudSyncStatus === 'syncing' && <span className="w-2 h-2 rounded-full bg-[#F39C12] animate-ping" />}
            {(cloudSyncStatus === 'offline' || cloudSyncStatus === 'error') && (
              <span className="w-2 h-2 rounded-full bg-stone-400" />
            )}
            <button
              onClick={signOutUser}
              disabled={isAuthLoading}
              className="ml-1 text-[#FDFCF8]/70 hover:text-white transition-colors cursor-pointer"
              title="Se déconnecter de Google Cloud"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            disabled={isAuthLoading}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#3D5235] hover:bg-[#32432b] border border-[#FDFCF8]/15 text-[11px] font-semibold text-white/90 transition-all cursor-pointer disabled:opacity-60"
            title="Connecter votre compte Google pour sauvegarder dans Firebase Firestore"
          >
            <LogIn className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>{isAuthLoading ? 'Connexion...' : 'Sync Google'}</span>
          </button>
        )}

        {/* Gemini AI button */}
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-[#D4A373] hover:bg-[#9E7C5A] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          title="Assistant Vétérinaire & Conseil Avicole Gemini"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Conseiller IA</span>
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-[#3D5235] hover:bg-[#32432b] text-[#FDFCF8] border border-[#D4A373]/30 text-xs font-medium rounded-xl transition-all cursor-pointer"
          title="Exporter le registre d'élevage (CSV)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Status System Badge */}
        <div className="text-right hidden md:block border-l border-[#3D5235] pl-4">
          <p className="text-[10px] opacity-75 uppercase font-semibold text-[#E9E5D8]">Statut Élevage</p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></span>
            <p className="text-xs font-bold text-[#FDFCF8]">Opérationnel</p>
          </div>
        </div>

        {/* Reset / Demo seed button */}
        <button
          onClick={handleResetClick}
          className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
            confirmReset
              ? 'bg-[#FF4B2B] text-white px-2.5'
              : 'text-[#FDFCF8]/70 hover:text-white hover:bg-[#3D5235]'
          }`}
          title={confirmReset ? 'Cliquer à nouveau pour confirmer la réinitialisation' : 'Réinitialiser les données de démonstration'}
        >
          {confirmReset ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Confirmer</span>
            </>
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
