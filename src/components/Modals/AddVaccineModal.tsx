import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, ShieldCheck, Check } from 'lucide-react';
import { VaccineAdministrationMethod } from '../../types/poultry';

interface AddVaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVaccineModal: React.FC<AddVaccineModalProps> = ({ isOpen, onClose }) => {
  const { flocks, addVaccination } = useFarm();

  const [flockId, setFlockId] = useState(flocks[0]?.id || '');
  const [vaccineName, setVaccineName] = useState('');
  const [diseaseTarget, setDiseaseTarget] = useState('Newcastle & Bronchite');
  const [targetAgeWeeks, setTargetAgeWeeks] = useState<number | ''>(2);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<VaccineAdministrationMethod>('eau_boisson');
  const [batchNumber, setBatchNumber] = useState('');
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState<number | ''>(0);
  const [vetNotes, setVetNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockId || !vaccineName) return;

    addVaccination({
      flockId,
      vaccineName: vaccineName.trim(),
      diseaseTarget: diseaseTarget.trim(),
      targetAgeDays: (Number(targetAgeWeeks) || 1) * 7,
      targetAgeWeeks: Number(targetAgeWeeks) || 1,
      scheduledDate,
      method,
      status: 'pending',
      batchNumber: batchNumber.trim() || undefined,
      withdrawalPeriodDays: Number(withdrawalPeriodDays) || 0,
      vetNotes: vetNotes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] border border-[#E9E5D8] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E5D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F0E6] flex items-center justify-center text-[#4A6741]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Planifier une Vaccination
              </h2>
              <p className="text-xs text-[#8A8D7C]">Programme de prophylaxie aviaire</p>
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
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Lot de Volailles</label>
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
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Date Prévue</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Nom Commercial du Vaccin</label>
            <input
              type="text"
              required
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              placeholder="Ex: Nobilis ND Clone 30, Cevac Transmune..."
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Maladie Ciblée</label>
              <input
                type="text"
                required
                value={diseaseTarget}
                onChange={(e) => setDiseaseTarget(e.target.value)}
                placeholder="Ex: Newcastle, Gumboro, Marek..."
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Âge Cible (Semaines)</label>
              <input
                type="number"
                min="0"
                value={targetAgeWeeks}
                onChange={(e) => setTargetAgeWeeks(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Mode d'Administration</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as VaccineAdministrationMethod)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                <option value="eau_boisson">Eau de boisson</option>
                <option value="nebulisation">Nébulisation / Spray</option>
                <option value="goutte_oculaire">Goutte oculaire</option>
                <option value="injection">Injection (bréchet / cuisse)</option>
                <option value="transfixion_alaire">Transfixion alaire (Variole)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">N° de Lot Fabricant</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Ex: NV-2026-X4"
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Instructions / Recommandations Vétérinaire</label>
            <input
              type="text"
              value={vetNotes}
              onChange={(e) => setVetNotes(e.target.value)}
              placeholder="Ex: Couper l'eau 2h avant, ajouter du lait écrémé comme fixateur..."
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
              <span>Programmer la Vaccination</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
