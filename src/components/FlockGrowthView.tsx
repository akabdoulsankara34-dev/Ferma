import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Scale,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Activity,
  Award,
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

interface FlockGrowthViewProps {
  onOpenAddWeight: () => void;
}

export const FlockGrowthView: React.FC<FlockGrowthViewProps> = ({ onOpenAddWeight }) => {
  const { weightRecords, flocks, deleteWeightRecord, selectedFlockId } = useFarm();
  const [filterFlockId, setFilterFlockId] = useState<string>(
    selectedFlockId === 'all' ? 'all' : selectedFlockId
  );

  const filteredRecords = weightRecords.filter(
    (r) => filterFlockId === 'all' || r.flockId === filterFlockId
  );

  const latestRecord = filteredRecords[0];
  const avgWeight = latestRecord ? latestRecord.avgWeightGrams : 0;
  const avgDailyGain =
    filteredRecords.length > 0
      ? Math.round(
          filteredRecords.reduce((acc, r) => acc + r.dailyGainGrams, 0) / filteredRecords.length
        )
      : 0;
  const avgUniformity =
    filteredRecords.length > 0
      ? (
          filteredRecords.reduce((acc, r) => acc + r.uniformityPercent, 0) / filteredRecords.length
        ).toFixed(1)
      : '0.0';
  const avgFcr =
    filteredRecords.length > 0
      ? (
          filteredRecords.reduce((acc, r) => acc + r.fcr, 0) / filteredRecords.length
        ).toFixed(2)
      : '0.00';

  const chartData = [...filteredRecords]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      poids: r.avgWeightGrams,
      objectif: r.targetWeightGrams,
    }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5D8]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Pesées & Croissance des Lots
          </h2>
          <p className="text-xs md:text-sm text-[#8A8D7C]">
            Suivi du poids moyen, du Gain Moyen Quotidien (GMQ), de l'homogénéité et de l'indice de consommation
          </p>
        </div>

        <button
          onClick={onOpenAddWeight}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Pesée</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8A8D7C]">Dernier Poids Moyen</p>
            <Scale className="w-4 h-4 text-[#4A6741]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#4A6741] mt-2 tabular-nums">
            {avgWeight.toLocaleString()} g
          </h3>
          <p className="text-xs text-[#8A8D7C] mt-1 tabular-nums">
            {latestRecord
              ? `Cible standard : ${latestRecord.targetWeightGrams.toLocaleString()} g`
              : 'Aucune pesée enregistrée'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8A8D7C]">Gain Moyen Quotidien (GMQ)</p>
            <TrendingUp className="w-4 h-4 text-[#D4A373]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#3D4035] mt-2 tabular-nums">
            +{avgDailyGain} g/j
          </h3>
          <p className="text-xs text-[#8A8D7C] mt-1">Vitesse de croissance moyenne</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8A8D7C]">Homogénéité du Lot</p>
            <Award className="w-4 h-4 text-[#4A6741]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#4A6741] mt-2 tabular-nums">
            {avgUniformity}%
          </h3>
          <p className="text-xs text-[#8A8D7C] mt-1">Objectif d'élevage &ge; 85%</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8A8D7C]">Indice de Consommation (IC)</p>
            <Target className="w-4 h-4 text-[#D4A373]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#D4A373] mt-2 tabular-nums">
            {avgFcr}
          </h3>
          <p className="text-xs text-[#8A8D7C] mt-1">kg aliment / kg poids vif</p>
        </div>
      </div>

      {/* Growth Curve Chart */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
              Courbe de Croissance : Poids Mesuré vs Standard Souche
            </h3>
            <p className="text-xs text-[#8A8D7C]">
              Comparaison chronologique de l'évolution pondérale en grammes
            </p>
          </div>

          <select
            value={filterFlockId}
            onChange={(e) => setFilterFlockId(e.target.value)}
            className="bg-[#F9F7F2] border border-[#E9E5D8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#3D4035] outline-hidden cursor-pointer"
          >
            <option value="all">Tous les Lots</option>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.breed})
              </option>
            ))}
          </select>
        </div>

        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A6741" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4A6741" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" vertical={false} />
                <XAxis dataKey="date" stroke="#8A8D7C" fontSize={11} tickLine={false} />
                <YAxis stroke="#8A8D7C" fontSize={11} tickLine={false} unit=" g" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E9E5D8',
                    borderRadius: '14px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: string) => [
                    `${Number(value).toLocaleString()} g`,
                    name === 'poids' ? 'Poids Moyen Mesuré' : 'Standard Souche',
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
                  fill="url(#weightActualGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#8A8D7C]">
            Aucune pesée enregistrée pour ce filtre. Cliquez sur « Enregistrer une Pesée » pour démarrer le suivi.
          </div>
        )}
      </div>

      {/* Weighing History Table */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
              Registre des Pesées par Lot
            </h3>
            <p className="text-xs text-[#8A8D7C]">
              Échantillonnage hebdomadaire, écart au standard et homogénéité
            </p>
          </div>
          <span className="text-xs text-[#8A8D7C] tabular-nums">
            {filteredRecords.length} relevé(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9E5D8] text-[#8A8D7C] font-semibold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Lot</th>
                <th className="py-3 px-3 text-right">Échantillon</th>
                <th className="py-3 px-3 text-right">Poids Moyen</th>
                <th className="py-3 px-3 text-right">Standard</th>
                <th className="py-3 px-3 text-right">Écart</th>
                <th className="py-3 px-3 text-right">GMQ</th>
                <th className="py-3 px-3 text-right">Homogénéité</th>
                <th className="py-3 px-3 text-right">IC</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5D8]/60">
              {filteredRecords.map((rec) => {
                const flock = flocks.find((f) => f.id === rec.flockId);
                const diff = rec.avgWeightGrams - rec.targetWeightGrams;
                return (
                  <tr key={rec.id} className="hover:bg-[#F9F7F2]/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#3D4035] tabular-nums whitespace-nowrap">
                      {new Date(rec.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#3D4035]">{flock?.name || rec.flockId}</p>
                      {rec.notes && (
                        <p className="text-[11px] text-[#8A8D7C] truncate max-w-[220px]">{rec.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-[#3D4035] tabular-nums">
                      {rec.sampleSize} sujets
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#4A6741] tabular-nums">
                      {rec.avgWeightGrams.toLocaleString()} g
                    </td>
                    <td className="py-3 px-3 text-right text-[#8A8D7C] tabular-nums">
                      {rec.targetWeightGrams.toLocaleString()} g
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold tabular-nums ${
                        diff >= 0 ? 'text-[#27AE60]' : 'text-[#FF4B2B]'
                      }`}
                    >
                      {diff >= 0 ? `+${diff} g` : `${diff} g`}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#3D4035] tabular-nums">
                      +{rec.dailyGainGrams} g/j
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#4A6741] tabular-nums">
                      {rec.uniformityPercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#D4A373] tabular-nums">
                      {rec.fcr.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteWeightRecord(rec.id)}
                        className="p-1.5 text-[#8A8D7C] hover:text-[#FF4B2B] rounded-lg transition-colors cursor-pointer"
                        title="Supprimer cette pesée"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
