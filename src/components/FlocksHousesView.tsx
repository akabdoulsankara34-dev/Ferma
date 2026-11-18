import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Home,
  Plus,
  Thermometer,
  Droplets,
  Sun,
  Fan,
  Search,
} from 'lucide-react';
import { Flock } from '../types/poultry';

interface FlocksHousesViewProps {
  onOpenAddFlock: () => void;
}

const STATUS_LABELS: Record<Flock['status'], string> = {
  active: 'En élevage',
  quarantine: 'Quarantaine',
  sold: 'Vendu / Sorti',
  culled: 'Réformé',
};

export const FlocksHousesView: React.FC<FlocksHousesViewProps> = ({ onOpenAddFlock }) => {
  const { houses, flocks, updateHouseParams, updateFlockStatus } = useFarm();
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [tempInput, setTempInput] = useState<number>(22);
  const [humidityInput, setHumidityInput] = useState<number>(60);
  const [lightingInput, setLightingInput] = useState<number>(16);

  const [statusFilter, setStatusFilter] = useState<'all' | Flock['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const startEditHouse = (house: any) => {
    setEditingHouseId(house.id);
    setTempInput(house.temperature);
    setHumidityInput(house.humidity);
    setLightingInput(house.lightingHours);
  };

  const saveHouseParams = (houseId: string) => {
    updateHouseParams(houseId, {
      temperature: Number(tempInput),
      humidity: Number(humidityInput),
      lightingHours: Number(lightingInput),
    });
    setEditingHouseId(null);
  };

  const filteredFlocks = flocks.filter((f) => {
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.breed.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E9E5D8]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Suivi des Lots & Bâtiments d'Élevage
          </h2>
          <p className="text-xs md:text-sm text-[#8A8D7C]">
            Gestion des bandes avicoles, taux de survie, progression pondérale et ambiance des poulaillers
          </p>
        </div>

        <button
          onClick={onOpenAddFlock}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Mettre en Place un Nouveau Lot</span>
        </button>
      </div>

      {/* Flocks Registry Table */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
              Registre des Lots & Bandes ({filteredFlocks.length})
            </h3>
            <p className="text-xs text-[#8A8D7C]">
              Effectif initial, mortalité cumulée, poids moyen actuel et statut de bande
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8A8D7C] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un lot..."
                className="bg-[#F9F7F2] border border-[#E9E5D8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3D4035] outline-hidden focus:border-[#4A6741]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F9F7F2] rounded-xl border border-[#E9E5D8]">
              {(['all', 'active', 'quarantine', 'sold'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-[#4A6741] shadow-xs'
                      : 'text-[#8A8D7C] hover:text-[#3D4035]'
                  }`}
                >
                  {st === 'all' ? 'Tous' : STATUS_LABELS[st]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9E5D8] text-[#8A8D7C] font-semibold">
                <th className="py-3 px-3">Code Lot</th>
                <th className="py-3 px-3">Désignation & Souche</th>
                <th className="py-3 px-3">Bâtiment</th>
                <th className="py-3 px-3 text-right">Âge</th>
                <th className="py-3 px-3 text-right">Effectif</th>
                <th className="py-3 px-3 text-right">Survie</th>
                <th className="py-3 px-3 text-right">Poids / Objectif</th>
                <th className="py-3 px-3">Statut du Lot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5D8]/60">
              {filteredFlocks.map((flock) => {
                const house = houses.find((h) => h.id === flock.houseId);
                const survivalRate =
                  flock.initialCount > 0
                    ? ((flock.currentCount / flock.initialCount) * 100).toFixed(1)
                    : '100.0';
                return (
                  <tr key={flock.id} className="hover:bg-[#F9F7F2]/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#4A6741] whitespace-nowrap">
                      {flock.code}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#3D4035]">{flock.name}</p>
                      <p className="text-[11px] text-[#8A8D7C]">
                        {flock.breed} · Arrivée {new Date(flock.arrivalDate).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-[#3D4035]">{house?.code || flock.houseId}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#3D4035] tabular-nums">
                      {flock.ageWeeks} sem.
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#4A6741] tabular-nums whitespace-nowrap">
                      {flock.currentCount.toLocaleString()}{' '}
                      <span className="font-normal text-[11px] text-[#8A8D7C]">
                        / {flock.initialCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#4A6741] tabular-nums">
                      {survivalRate}%
                    </td>
                    <td className="py-3.5 px-3 text-right tabular-nums whitespace-nowrap">
                      <span className="font-bold text-[#3D4035]">
                        {(flock.currentWeightGrams || 0).toLocaleString()} g
                      </span>
                      {flock.targetWeightGrams ? (
                        <span className="text-[#8A8D7C]"> / {flock.targetWeightGrams.toLocaleString()} g</span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={flock.status}
                        onChange={(e) => updateFlockStatus(flock.id, e.target.value as Flock['status'])}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border outline-hidden cursor-pointer ${
                          flock.status === 'active'
                            ? 'bg-[#E9F0E6] text-[#4A6741] border-[#4A6741]/20'
                            : flock.status === 'quarantine'
                            ? 'bg-[#FFF4F2] text-[#FF4B2B] border-[#FFD0CA]'
                            : 'bg-[#F9F7F2] text-[#8A8D7C] border-[#E9E5D8]'
                        }`}
                      >
                        <option value="active">En élevage</option>
                        <option value="quarantine">Quarantaine</option>
                        <option value="sold">Vendu / Sorti</option>
                        <option value="culled">Réformé</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buildings Cards */}
      <div>
        <h3 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif] mb-4">
          Poulaillers & Paramètres d'Ambiance ({houses.length} bâtiments)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {houses.map((house) => {
            const currentFlock = flocks.find((f) => f.id === house.currentFlockId);
            const isEditing = editingHouseId === house.id;

            return (
              <div
                key={house.id}
                className="bg-white rounded-3xl border border-[#E9E5D8] p-5 md:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E9F0E6] flex items-center justify-center text-[#4A6741]">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#4A6741]">{house.code}</p>
                      <h4 className="font-bold text-base text-[#3D4035]">{house.name}</h4>
                    </div>
                  </div>
                </div>

                {/* Flock details in house */}
                <div className="p-3.5 rounded-2xl bg-[#F9F7F2] border border-[#E9E5D8] text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A8D7C] font-semibold">Lot Actif</span>
                    <span className="font-bold text-[#4A6741]">
                      {currentFlock ? currentFlock.name : 'Vide sanitaire'}
                    </span>
                  </div>
                  {currentFlock && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#8A8D7C]">Souche & Âge</span>
                        <span className="font-semibold text-[#3D4035] tabular-nums">
                          {currentFlock.breed} · {currentFlock.ageWeeks} sem.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8D7C]">Occupation</span>
                        <span className="font-bold text-[#3D4035] tabular-nums">
                          {currentFlock.currentCount.toLocaleString()} / {house.capacity.toLocaleString()} (
                          {Math.round((currentFlock.currentCount / house.capacity) * 100)}%)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Environmental parameters */}
                {isEditing ? (
                  <div className="space-y-3 p-3 bg-[#FFFBF0] rounded-2xl border border-[#FFE7A3] text-xs">
                    <p className="font-bold text-[#9E7C5A]">Modifier les consignes d'ambiance :</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-[#8A8D7C]">Temp. (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={tempInput}
                          onChange={(e) => setTempInput(Number(e.target.value))}
                          className="w-full bg-white border border-[#E9E5D8] rounded-xl px-2 py-1 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#8A8D7C]">Humidité (%)</label>
                        <input
                          type="number"
                          value={humidityInput}
                          onChange={(e) => setHumidityInput(Number(e.target.value))}
                          className="w-full bg-white border border-[#E9E5D8] rounded-xl px-2 py-1 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#8A8D7C]">Lumière (h/j)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={lightingInput}
                          onChange={(e) => setLightingInput(Number(e.target.value))}
                          className="w-full bg-white border border-[#E9E5D8] rounded-xl px-2 py-1 font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingHouseId(null)}
                        className="flex-1 py-1.5 bg-white border border-[#E9E5D8] rounded-xl font-bold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => saveHouseParams(house.id)}
                        className="flex-1 py-1.5 bg-[#4A6741] text-white rounded-xl font-bold cursor-pointer"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums">
                    <div className="p-2.5 rounded-2xl bg-[#FDFCF8] border border-[#E9E5D8]">
                      <div className="flex items-center justify-center gap-1 text-[#D4A373] mb-1">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold text-[#8A8D7C]">Temp.</span>
                      </div>
                      <p className="font-bold text-base text-[#3D4035]">{house.temperature}°C</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#FDFCF8] border border-[#E9E5D8]">
                      <div className="flex items-center justify-center gap-1 text-[#4A6741] mb-1">
                        <Droplets className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold text-[#8A8D7C]">Humidité</span>
                      </div>
                      <p className="font-bold text-base text-[#3D4035]">{house.humidity}%</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#FDFCF8] border border-[#E9E5D8]">
                      <div className="flex items-center justify-center gap-1 text-[#D4A373] mb-1">
                        <Sun className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-semibold text-[#8A8D7C]">Lumière</span>
                      </div>
                      <p className="font-bold text-base text-[#4A6741]">{house.lightingHours} h/j</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E9E5D8] flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#8A8D7C]">
                    <Fan className="w-3.5 h-3.5 text-[#4A6741]" /> Ventilation auto
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => startEditHouse(house)}
                      className="font-bold text-[#4A6741] hover:underline cursor-pointer"
                    >
                      Ajuster consignes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
