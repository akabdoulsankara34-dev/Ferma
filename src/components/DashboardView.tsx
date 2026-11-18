import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Scale,
  HeartPulse,
  Wheat,
  Thermometer,
  ShieldCheck,
  Plus,
  Sparkles,
  ArrowRight,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  onOpenAddWeight: () => void;
  onOpenAddHealth: () => void;
  onOpenAddFeed: () => void;
  onOpenAIAssistant: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddWeight,
  onOpenAddHealth,
  onOpenAddFeed,
  onOpenAIAssistant,
  onNavigateTab,
}) => {
  const {
    flocks,
    houses,
    weightRecords,
    healthRecords,
    feedInventory,
    feedRecords,
    vaccinations,
    totalBirds,
    activeFlocksCount,
    avgSurvivalRate,
    avgUniformityPercent,
    avgFCR,
    latestAvgDailyGain,
    feedDaysRemaining,
    activeSanitaryAlertsCount,
    toggleVaccinationStatus,
    selectedFlockId,
  } = useFarm();

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d');

  // Filter weight records for chart (default to first active flock if 'all' is selected so growth curve is meaningful)
  const targetChartFlockId = selectedFlockId === 'all' ? flocks[0]?.id : selectedFlockId;
  const chartFlock = flocks.find((f) => f.id === targetChartFlockId);

  const chartData = [...weightRecords]
    .filter((r) => !targetChartFlockId || r.flockId === targetChartFlockId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(timeRange === '7d' ? -4 : -12)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      poids: r.avgWeightGrams,
      objectif: r.targetWeightGrams,
    }));

  const totalStockKg = feedInventory.reduce((acc, i) => acc + i.currentStockKg, 0);
  const maxCapacityKg = 15000;
  const stockPercentage = Math.min(100, Math.round((totalStockKg / maxCapacityKg) * 100));

  const avgTemp =
    houses.length > 0
      ? (houses.reduce((acc, h) => acc + h.temperature, 0) / houses.length).toFixed(1)
      : '23.0';

  const latestFeedWater = feedRecords.slice(0, 3).reduce((acc, r) => acc + r.waterIntakeLiters, 0);
  const avgRationGrams =
    feedRecords.length > 0
      ? Math.round(feedRecords.slice(0, 3).reduce((acc, r) => acc + r.feedPerBirdGrams, 0) / Math.min(3, feedRecords.length))
      : 105;

  const pendingVaccines = vaccinations.filter((v) => v.status === 'pending');
  const latestHealth = healthRecords[0];
  const latestHealthFlock = flocks.find((f) => f.id === latestHealth?.flockId);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5D8]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Tableau de Bord — Suivi des Lots
          </h2>
          <p className="text-xs md:text-sm text-[#8A8D7C] tabular-nums">
            {activeFlocksCount} lot(s) actif(s) · {totalBirds.toLocaleString()} sujets en élevage · {houses.length} bâtiments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAddWeight}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-xs md:text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Pesée de Lot</span>
          </button>

          <button
            onClick={onOpenAddHealth}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FFF4F2] hover:bg-[#ffece8] text-[#FF4B2B] border border-[#FFD0CA] rounded-2xl font-bold text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Contrôle Sanitaire</span>
          </button>

          <button
            onClick={onOpenAddFeed}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#F9F7F2] text-[#3D4035] border border-[#E9E5D8] rounded-2xl font-semibold text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Wheat className="w-4 h-4 text-[#D4A373]" />
            <span>Alimentation</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key Flock KPIs */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          {/* Card 1: Total Birds & Survival */}
          <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8A8D7C]">Cheptel Actif & Survie</p>
              <Users className="w-4 h-4 text-[#4A6741]" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <h2 className="text-3xl font-bold text-[#4A6741] tabular-nums">
                {totalBirds.toLocaleString()}
              </h2>
              <span className="text-[#4A6741] text-xs font-bold tabular-nums">
                {avgSurvivalRate}% survie
              </span>
            </div>
          </div>

          {/* Card 2: FCR & GMQ */}
          <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8A8D7C]">Croissance & Indice (IC)</p>
              <Scale className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <h2 className="text-3xl font-bold text-[#D4A373] tabular-nums">{avgFCR}</h2>
                <span className="text-[11px] text-[#8A8D7C]">IC moyen · Homog. {avgUniformityPercent}%</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#3D4035] tabular-nums">+{latestAvgDailyGain} g/j</p>
                <span className="text-[11px] text-[#8A8D7C]">GMQ moyen</span>
              </div>
            </div>
          </div>

          {/* Card 3: Temperature & Water/Feed */}
          <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] flex flex-col justify-between min-h-32">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#8A8D7C]">Ambiance & Ration</p>
              <Thermometer className="w-4 h-4 text-[#D4A373]" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <h2 className="text-2xl font-bold text-[#3D4035] tabular-nums">{avgTemp}°C</h2>
                <span className="text-[11px] text-[#8A8D7C]">Eau : {latestFeedWater.toLocaleString()} L/j</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#4A6741] tabular-nums">{avgRationGrams} g/sujet</p>
                <span className="text-[11px] text-[#8A8D7C]">Ration moyenne</span>
              </div>
            </div>
          </div>

          {/* AI Flock Audit Card */}
          <div
            onClick={onOpenAIAssistant}
            className="bg-[#E9F0E6] p-5 rounded-3xl border border-[#4A6741]/20 flex-1 flex flex-col justify-center items-center text-center cursor-pointer transition-all hover:bg-[#e1ebd9]"
          >
            <div className="w-11 h-11 bg-white rounded-full mb-3 flex items-center justify-center text-[#4A6741]">
              <Sparkles className="w-5 h-5 text-[#4A6741]" />
            </div>
            <h3 className="font-bold text-[#4A6741] text-base">Audit des Lots IA</h3>
            <p className="text-xs text-[#4A6741]/80 mt-1 max-w-[210px]">
              Analysez la courbe de croissance, l'IC et le plan de prophylaxie de vos bandes.
            </p>
            <span className="mt-3 text-xs font-bold text-[#4A6741] underline underline-offset-2 flex items-center gap-1">
              Ouvrir l'assistant <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </section>

        {/* Center Column: Growth Curve Chart & Feed Inventory */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6 flex-1 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                  Courbe de Croissance ({chartFlock?.name || 'Lot Principal'})
                </h3>
                <p className="text-xs text-[#8A8D7C]">
                  Poids moyen mesuré (g) comparé au standard de la souche
                </p>
              </div>

              <div className="flex gap-1.5 bg-[#F9F7F2] p-1 rounded-xl border border-[#E9E5D8]">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === '7d'
                      ? 'bg-[#4A6741] text-white'
                      : 'text-[#8A8D7C] hover:text-[#3D4035]'
                  }`}
                >
                  Récent
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === '30d'
                      ? 'bg-[#4A6741] text-white'
                      : 'text-[#8A8D7C] hover:text-[#3D4035]'
                  }`}
                >
                  30 Jours
                </button>
              </div>
            </div>

            <div className="h-64 md:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A6741" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4A6741" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#8A8D7C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E9E5D8' }}
                  />
                  <YAxis
                    stroke="#8A8D7C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E9E5D8' }}
                    unit="g"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E9E5D8',
                      borderRadius: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toLocaleString()} g`,
                      name === 'poids' ? 'Poids Mesuré' : 'Standard Cible',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="objectif"
                    stroke="#D4A373"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="poids"
                    stroke="#4A6741"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#weightColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8A8D7C] border-t border-[#E9E5D8] pt-3 mt-2">
              <div className="flex items-center gap-4">
                <span>Poids Mesuré (vert)</span>
                <span aria-hidden="true">·</span>
                <span>Standard Souche (pointillés)</span>
              </div>
              <button
                onClick={() => onNavigateTab('growth')}
                className="font-bold text-[#4A6741] hover:underline cursor-pointer"
              >
                Détails des pesées →
              </button>
            </div>
          </div>

          {/* Feed Stock Gauge */}
          <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                  État des Silos & Stock d'Aliment
                </h3>
                <p className="text-xs text-[#8A8D7C] tabular-nums">
                  {totalStockKg.toLocaleString()} kg disponibles · Autonomie estimée : ~{feedDaysRemaining} jours
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('feed')}
                className="text-xs font-bold text-[#4A6741] hover:underline cursor-pointer"
              >
                Gérer les silos →
              </button>
            </div>

            <div className="relative w-full h-5 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#E9E5D8] p-0.5">
              <div
                className="h-full bg-[#D4A373] rounded-full transition-all duration-500"
                style={{ width: `${stockPercentage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
              {feedInventory.map((inv) => (
                <div key={inv.id} className="p-2.5 rounded-2xl bg-[#F9F7F2] border border-[#E9E5D8]">
                  <p className="text-[11px] text-[#8A8D7C] font-semibold truncate">{inv.label.split('(')[0]}</p>
                  <p className="text-sm font-bold text-[#3D4035] mt-0.5 tabular-nums">
                    {inv.currentStockKg.toLocaleString()} kg
                  </p>
                  <span
                    className={`text-[11px] font-semibold ${
                      inv.currentStockKg <= inv.alertThresholdKg ? 'text-[#FF4B2B]' : 'text-[#4A6741]'
                    }`}
                  >
                    {inv.currentStockKg <= inv.alertThresholdKg ? 'Seuil bas' : 'Stock normal'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Health & Sanitary Alerts */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-[#E9E5D8] flex-1 flex flex-col p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                  Santé & Alertes des Lots
                </h3>
                <p className="text-xs text-[#8A8D7C] tabular-nums">
                  {activeSanitaryAlertsCount} action(s) ou suivi(s) actif(s)
                </p>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {/* Latest Mortality / Health Entry */}
              {latestHealth && (
                <div className="p-3.5 rounded-2xl bg-[#FFF4F2] border border-[#FFD0CA] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-bold text-[#2D3436] truncate">
                      {latestHealthFlock?.name || latestHealth.flockId}
                    </p>
                    <span className="text-[11px] text-[#8A8D7C] tabular-nums shrink-0">
                      {new Date(latestHealth.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    Mortalité : {latestHealth.mortalityCount} · Tri : {latestHealth.culledCount} — {latestHealth.suspectedCause}
                  </p>
                </div>
              )}

              {/* Next Vaccination */}
              {pendingVaccines.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-[#FFE7A3] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-bold text-[#2D3436]">{pendingVaccines[0].diseaseTarget}</p>
                    <span className="text-[11px] font-bold text-[#9E7C5A]">À faire</span>
                  </div>
                  <p className="text-xs text-[#636E72]">
                    {pendingVaccines[0].vaccineName} ({pendingVaccines[0].method.replace('_', ' ')})
                  </p>
                  <button
                    onClick={() => toggleVaccinationStatus(pendingVaccines[0].id)}
                    className="mt-1 text-xs font-bold px-2.5 py-1 bg-[#F39C12] text-white rounded-lg hover:bg-[#d6860a] transition-all cursor-pointer"
                  >
                    Valider l'administration
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F9FDF9] border border-[#D5EED5]">
                  <p className="text-xs font-bold text-[#2D3436]">Vaccinations à jour</p>
                  <p className="text-xs text-[#636E72] mt-0.5">Toutes les prophylaxies des lots sont validées.</p>
                </div>
              )}

              {/* Environment Note */}
              <div className="p-3.5 rounded-2xl bg-[#F9FDF9] border border-[#D5EED5]">
                <p className="text-xs font-bold text-[#2D3436]">Ambiance & Litière</p>
                <p className="text-xs text-[#636E72] mt-0.5">
                  Ventilation et abreuvement nominaux sur les {houses.length} bâtiments.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-[#E9E5D8]">
              <button
                onClick={onOpenAddHealth}
                className="w-full py-3 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Nouveau Contrôle Sanitaire</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Buildings & Active Flocks Quick Preview */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
              État des Bâtiments & Avancement des Lots
            </h3>
            <p className="text-xs text-[#8A8D7C]">
              Effectif, poids moyen par rapport à l'objectif de sortie et ambiance
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('flocks')}
            className="text-xs font-bold text-[#4A6741] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Gérer les lots →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {houses.map((house) => {
            const flock = flocks.find((f) => f.id === house.currentFlockId);
            const weightPct =
              flock?.currentWeightGrams && flock?.targetWeightGrams
                ? Math.min(100, Math.round((flock.currentWeightGrams / flock.targetWeightGrams) * 100))
                : 0;

            return (
              <div
                key={house.id}
                className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#E9E5D8] flex flex-col justify-between space-y-3"
              >
                <div>
                  <p className="text-xs font-semibold text-[#4A6741]">{house.code}</p>
                  <h4 className="font-bold text-sm text-[#3D4035] mt-0.5">{house.name}</h4>
                </div>

                {flock ? (
                  <div className="text-xs space-y-2">
                    <div>
                      <p className="text-[#3D4035] font-bold">{flock.name}</p>
                      <p className="text-[#8A8D7C] tabular-nums">
                        {flock.breed} · {flock.ageWeeks} sem. · {flock.currentCount.toLocaleString()} / {flock.initialCount.toLocaleString()} sujets
                      </p>
                    </div>
                    {flock.targetWeightGrams && (
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 tabular-nums">
                          <span className="text-[#8A8D7C]">Poids : {flock.currentWeightGrams || 0} g</span>
                          <span className="font-bold text-[#4A6741]">Cible : {flock.targetWeightGrams} g ({weightPct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#E9E5D8]">
                          <div
                            className="h-full bg-[#4A6741] rounded-full"
                            style={{ width: `${weightPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A8D7C] italic">Aucun lot assigné (vide sanitaire)</p>
                )}

                <div className="grid grid-cols-3 gap-1 text-[11px] pt-2 border-t border-[#E9E5D8] tabular-nums">
                  <div className="text-center">
                    <span className="text-[#8A8D7C] block">Temp.</span>
                    <span className="font-bold text-[#3D4035]">{house.temperature}°C</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[#8A8D7C] block">Humidité</span>
                    <span className="font-bold text-[#3D4035]">{house.humidity}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[#8A8D7C] block">Lumière</span>
                    <span className="font-bold text-[#4A6741]">{house.lightingHours}h/j</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
