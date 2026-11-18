import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Building2, Check } from 'lucide-react';
import { FlockType } from '../../types/poultry';

interface AddFlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFlockModal: React.FC<AddFlockModalProps> = ({ isOpen, onClose }) => {
  const { houses, addFlock } = useFarm();

  const [name, setName] = useState('');
  const [houseId, setHouseId] = useState(houses[0]?.id || 'house-1');
  const [type, setType] = useState<FlockType>('broilers');
  const [breed, setBreed] = useState('Ross 308');
  const [initialCount, setInitialCount] = useState<number | ''>(2500);
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [ageWeeks, setAgeWeeks] = useState<number | ''>(1);
  const [currentWeightGrams, setCurrentWeightGrams] = useState<number | ''>(45);
  const [targetWeightGrams, setTargetWeightGrams] = useState<number | ''>(2200);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialCount) return;

    addFlock({
      name: name.trim(),
      houseId,
      type,
      breed: breed.trim(),
      initialCount: Number(initialCount),
      currentCount: Number(initialCount),
      arrivalDate,
      ageWeeks: Number(ageWeeks) || 0,
      currentWeightGrams: Number(currentWeightGrams) || 45,
      targetWeightGrams: Number(targetWeightGrams) || 2200,
      status: 'active',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] border border-[#E9E5D8] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E5D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F0E6] flex items-center justify-center text-[#4A6741]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Mettre en Place un Nouveau Lot
              </h2>
              <p className="text-xs text-[#8A8D7C]">Création et suivi de bande avicole</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8D7C] hover:text-[#3D4035] hover:bg-[#F9F7F2] rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3D4035] mb-1">Nom du Lot</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lot Fermier Sasso 2026-D4"
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Catégorie de Bande</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FlockType)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                <option value="broilers">Poulets de Chair / Bande</option>
                <option value="pullets">Démarrage / Élevage Jeune</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Bâtiment Affecté</label>
              <select
                value={houseId}
                onChange={(e) => setHouseId(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.capacity} max)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Souche / Race</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ex: Ross 308, Cobb 500, Sasso T451"
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Effectif Initial (Têtes)</label>
              <input
                type="number"
                min="1"
                required
                value={initialCount}
                onChange={(e) => setInitialCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#4A6741] focus:border-[#4A6741] outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Date de Mise en Place</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                required
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Âge à l'Arrivée (Semaines)</label>
              <input
                type="number"
                min="0"
                value={ageWeeks}
                onChange={(e) => setAgeWeeks(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Poids Initial (g)</label>
              <input
                type="number"
                min="20"
                value={currentWeightGrams}
                onChange={(e) => setCurrentWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Objectif Poids Sortie (g)</label>
              <input
                type="number"
                min="500"
                value={targetWeightGrams}
                onChange={(e) => setTargetWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#4A6741] focus:border-[#4A6741] outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] mb-1">Notes Complémentaires</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Couvoir certifié, vaccination Marek J1..."
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F9F7F2] hover:bg-[#E9E5D8] text-[#3D4035] font-bold rounded-2xl text-sm transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#4A6741] hover:bg-[#3D5235] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Créer le Lot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
