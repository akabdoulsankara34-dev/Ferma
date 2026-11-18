import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Wheat, Check } from 'lucide-react';
import { FeedType } from '../../types/poultry';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose }) => {
  const { flocks, addFeedRecord } = useFarm();

  const [flockId, setFlockId] = useState(flocks[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [feedType, setFeedType] = useState<FeedType>('croissance');
  const [quantityKg, setQuantityKg] = useState<number | ''>(450);
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number | ''>(900);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedFlock = flocks.find((f) => f.id === flockId);
  const count = selectedFlock?.currentCount || 3000;
  const feedGrams = count > 0 ? (((Number(quantityKg) || 0) * 1000) / count).toFixed(1) : '0';
  const ratio = Number(quantityKg) > 0 ? ((Number(waterIntakeLiters) || 0) / (Number(quantityKg) || 1)).toFixed(2) : '2.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockId || !quantityKg) return;

    addFeedRecord({
      date,
      flockId,
      feedType,
      quantityKg: Number(quantityKg),
      waterIntakeLiters: Number(waterIntakeLiters) || 0,
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
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Distribution d'Aliment & Eau
              </h2>
              <p className="text-xs text-[#8A8D7C]">Suivi des rations et de l'indice de consommation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8D7C] hover:text-[#3D4035] hover:bg-[#F9F7F2] rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Lot Destinataire</label>
              <select
                value={flockId}
                onChange={(e) => setFlockId(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Type d'Aliment</label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value as FeedType)}
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            >
              <option value="demarrage">Miette Poussin Démarrage</option>
              <option value="croissance">Granulé Croissance Chair</option>
              <option value="finition">Granulé Finition Haute Énergie</option>
              <option value="pre_abattage">Aliment Retrait Fin de Bande</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
              <label className="block text-xs font-bold text-[#8A8D7C] uppercase mb-1">Quantité Distribuée (kg)</label>
              <input
                type="number"
                min="1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full text-xl font-bold text-[#4A6741] bg-transparent outline-hidden"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
              <label className="block text-xs font-bold text-[#8A8D7C] uppercase mb-1">Consommation Eau (Litres)</label>
              <input
                type="number"
                min="0"
                value={waterIntakeLiters}
                onChange={(e) => setWaterIntakeLiters(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full text-xl font-bold text-[#3D4035] bg-transparent outline-hidden"
              />
            </div>
          </div>

          {/* Computed Analysis */}
          <div className="p-4 bg-[#E9F0E6] rounded-2xl border border-[#4A6741]/20 flex items-center justify-between text-xs">
            <div>
              <p className="text-[#4A6741]/80 font-bold uppercase">Ration par Sujet</p>
              <p className="text-xl font-bold text-[#4A6741] tabular-nums">{feedGrams} g / sujet / jour</p>
              <span className="text-[10px] text-[#4A6741]">Selon l'âge de la bande</span>
            </div>
            <div className="text-right">
              <p className="text-[#4A6741]/80 font-bold uppercase">Ratio Eau / Aliment</p>
              <p className="text-xl font-bold text-[#4A6741]">{ratio}</p>
              <span className="text-[10px] text-[#4A6741]">Norme : 1.8 à 2.2</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Observations</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Mangeoires vidées, litière sèche sous abreuvoirs..."
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F9F7F2] hover:bg-[#E9E5D8] text-[#3D4035] font-bold rounded-2xl text-sm transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#4A6741] hover:bg-[#3D5235] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer la Ration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
