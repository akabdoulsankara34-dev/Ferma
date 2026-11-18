import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, HeartPulse, AlertTriangle, Check } from 'lucide-react';

interface AddHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_SYMPTOMS = [
  'Prostration / léthargie',
  'Plumes ébouriffées',
  'Fientes blanches / diarrhée',
  'Fientes sanguinolentes',
  'Éternuements / râles respiratoires',
  'Crête pâle ou cyanosée',
  'Baisse soudaine d’appétit',
  'Boiterie / paralysie des pattes',
  'Ailes pendantes / cou tordu',
  'Retard de croissance / hétérogénéité',
  'Plumage ébouriffé / frilosité',
  'Yeux gonflés / jetage nasal',
];

export const AddHealthModal: React.FC<AddHealthModalProps> = ({ isOpen, onClose }) => {
  const { flocks, addHealthRecord } = useFarm();

  const [flockId, setFlockId] = useState(flocks[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mortalityCount, setMortalityCount] = useState<number | ''>(1);
  const [culledCount, setCulledCount] = useState<number | ''>(0);
  const [suspectedCause, setSuspectedCause] = useState('Cause indéterminée / Mortalité naturelle');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [autopsyNotes, setAutopsyNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Éric S. (Chef d’élevage)');
  const [actionsTaken, setActionsTaken] = useState('');

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockId || !date) return;

    addHealthRecord({
      date,
      flockId,
      mortalityCount: Number(mortalityCount) || 0,
      culledCount: Number(culledCount) || 0,
      suspectedCause: suspectedCause.trim(),
      symptoms: selectedSymptoms,
      autopsyNotes: autopsyNotes.trim(),
      recordedBy: recordedBy.trim(),
      actionsTaken: actionsTaken.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] border border-[#E9E5D8] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E5D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4F2] border border-[#FFD0CA] flex items-center justify-center text-[#FF4B2B]">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Contrôle Sanitaire & Mortalité
              </h2>
              <p className="text-xs text-[#8A8D7C]">Registre de santé et suivi de mortalité</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Lot Concerné</label>
              <select
                value={flockId}
                onChange={(e) => setFlockId(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2.5 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                {flocks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.breed} - {f.currentCount} sujets)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Date du Constat</label>
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
            <div className="bg-[#FFF4F2] p-4 rounded-2xl border border-[#FFD0CA]">
              <label className="block text-xs font-bold text-[#FF4B2B] uppercase mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Mortalités (sujets morts)
              </label>
              <input
                type="number"
                min="0"
                value={mortalityCount}
                onChange={(e) => setMortalityCount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                className="w-full text-2xl font-bold text-[#FF4B2B] bg-transparent outline-hidden"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
              <label className="block text-xs font-bold text-[#8A8D7C] uppercase mb-1">
                Sujets Écartés / Réformés
              </label>
              <input
                type="number"
                min="0"
                value={culledCount}
                onChange={(e) => setCulledCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-2xl font-bold text-[#3D4035] bg-transparent outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Cause Suspectée / Diagnostic</label>
            <input
              type="text"
              value={suspectedCause}
              onChange={(e) => setSuspectedCause(e.target.value)}
              placeholder="Ex: Picage, stress thermique, salpingite, coccidiose..."
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
            />
          </div>

          {/* Symptômes observés */}
          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-2">
              Symptômes observés dans le bâtiment ({selectedSymptoms.length} sélectionnés)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF4B2B] text-white shadow-xs'
                        : 'bg-white text-[#3D4035] border border-[#E9E5D8] hover:border-[#D4A373]'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Actions Immédiates</label>
              <input
                type="text"
                value={actionsTaken}
                onChange={(e) => setActionsTaken(e.target.value)}
                placeholder="Ex: Isolement, désinfection, vitamines..."
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Enregistré par</label>
              <input
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Observations Autopsie / Lésions</label>
            <textarea
              rows={2}
              value={autopsyNotes}
              onChange={(e) => setAutopsyNotes(e.target.value)}
              placeholder="Ex: Examen des viscères, état des poumons, présence de vers ou coccidies..."
              className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden resize-none"
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
              <span>Enregistrer au Registre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
