import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Scale, Check } from 'lucide-react';

interface AddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({ isOpen, onClose }) => {
  const { flocks, addWeightRecord } = useFarm();

  const [flockId, setFlockId] = useState(flocks[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sampleSize, setSampleSize] = useState<number | ''>(100);
  const [avgWeightGrams, setAvgWeightGrams] = useState<number | ''>(1500);
  const [targetWeightGrams, setTargetWeightGrams] = useState<number | ''>(1480);
  const [uniformityPercent, setUniformityPercent] = useState<number | ''>(89);
  const [dailyGainGrams, setDailyGainGrams] = useState<number | ''>(52);
  const [fcr, setFcr] = useState<number | ''>(1.72);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const selected = flocks.find((f) => f.id === flockId);
    if (selected) {
      if (selected.currentWeightGrams) {
        setAvgWeightGrams(selected.currentWeightGrams + 60);
      }
      if (selected.targetWeightGrams) {
        setTargetWeightGrams(selected.currentWeightGrams ? selected.currentWeightGrams + 50 : selected.targetWeightGrams);
      }
    }
  }, [flockId, flocks]);

  if (!isOpen) return null;

  const selectedFlock = flocks.find((f) => f.id === flockId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockId || !avgWeightGrams) return;

    addWeightRecord({
      date,
      flockId,
      houseId: selectedFlock?.houseId || 'house-1',
      sampleSize: Number(sampleSize) || 50,
      avgWeightGrams: Number(avgWeightGrams),
      targetWeightGrams: Number(targetWeightGrams) || Number(avgWeightGrams),
      uniformityPercent: Number(uniformityPercent) || 85,
      dailyGainGrams: Number(dailyGainGrams) || 45,
      fcr: Number(fcr) || 1.8,
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
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Nouvelle Pesée de Lot
              </h2>
              <p className="text-xs text-[#8A8D7C]">
                Contrôle pondéral, homogénéité et indice de consommation
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Lot Pesé</label>
              <select
                value={flockId}
                onChange={(e) => setFlockId(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Date de la Pesée</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
              <label className="block text-xs font-semibold text-[#8A8D7C] mb-1">
                Poids Moyen Mesuré (g)
              </label>
              <input
                type="number"
                min="20"
                required
                value={avgWeightGrams}
                onChange={(e) => setAvgWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xl font-bold text-[#4A6741] bg-transparent outline-hidden tabular-nums"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
              <label className="block text-xs font-semibold text-[#8A8D7C] mb-1">
                Standard Souche (g)
              </label>
              <input
                type="number"
                min="20"
                required
                value={targetWeightGrams}
                onChange={(e) => setTargetWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-xl font-bold text-[#3D4035] bg-transparent outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Échantillon (sujets)</label>
              <input
                type="number"
                min="5"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#3D4035] outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">Homogénéité (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={uniformityPercent}
                onChange={(e) => setUniformityPercent(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#4A6741] outline-hidden tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] mb-1">GMQ (g/jour)</label>
              <input
                type="number"
                min="1"
                value={dailyGainGrams}
                onChange={(e) => setDailyGainGrams(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#3D4035] outline-hidden tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] mb-1">Indice de Consommation (IC)</label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="5"
              value={fcr}
              onChange={(e) => setFcr(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-bold text-[#D4A373] outline-hidden tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] mb-1">Observations sur le Lot</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Lot homogène, bonne prise d'aliment..."
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
              <span>Enregistrer la Pesée</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
