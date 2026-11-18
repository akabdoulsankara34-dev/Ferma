import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { X, Pill, Check, AlertTriangle, Stethoscope, Clock } from 'lucide-react';

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({ isOpen, onClose }) => {
  const { flocks, addTreatment } = useFarm();

  const [flockId, setFlockId] = useState(flocks[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [productName, setProductName] = useState('');
  const [activeMolecule, setActiveMolecule] = useState('');
  const [dosage, setDosage] = useState('1.5 ml / Litre d’eau');
  const [route, setRoute] = useState('Eau de boisson');
  const [durationDays, setDurationDays] = useState<number | ''>(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [eggWithdrawalDays, setEggWithdrawalDays] = useState<number | ''>(0);
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState<number | ''>(0);
  const [prescribingVet, setPrescribingVet] = useState('Dr. Karine L. (Vétérinaire Conseil)');
  const [notes, setNotes] = useState('');

  // Automatically calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && durationDays) {
      const start = new Date(startDate);
      const days = Number(durationDays) || 1;
      const end = new Date(start);
      end.setDate(start.getDate() + Math.max(0, days - 1));
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, durationDays]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockId || !productName.trim() || !diagnosis.trim()) return;

    addTreatment({
      flockId,
      date: startDate,
      diagnosis: diagnosis.trim(),
      productName: productName.trim(),
      activeMolecule: activeMolecule.trim() || productName.trim(),
      dosage: dosage.trim(),
      route: route.trim(),
      durationDays: Number(durationDays) || 1,
      startDate,
      endDate: endDate || startDate,
      eggWithdrawalDays: Number(eggWithdrawalDays) || 0,
      meatWithdrawalDays: Number(meatWithdrawalDays) || 0,
      prescribingVet: prescribingVet.trim(),
      status: 'in_progress',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const commonPrescriptions = [
    {
      diagnosis: 'Soutien hépato-rénal & croissance',
      productName: 'Hépaturyl Aviaire Bio',
      molecule: 'Sorbitol, Choline, Méthionine, Vit C',
      dosage: '1.5 ml / L d’eau',
      route: 'Eau de boisson',
      duration: 5,
      eggWait: 0,
    },
    {
      diagnosis: 'Prévention Coccidiose',
      productName: 'Vecoxan Solution',
      molecule: 'Diclazuril 2.5 mg/ml',
      dosage: '1 mg/kg PV en dose unique',
      route: 'Eau de boisson',
      duration: 2,
      eggWait: 0,
    },
    {
      diagnosis: 'Vermifuge / Parasitisme interne',
      productName: 'Solubenol 100 mg/g',
      molecule: 'Flubendazole',
      dosage: '1.43 g / 100 kg PV / jour',
      route: 'Eau de boisson',
      duration: 7,
      eggWait: 0,
    },
    {
      diagnosis: 'Complexe Antistress & Canicule',
      productName: 'Vitaperf Électrolytes + C',
      molecule: 'Vitamine C, Bicarbonate, K, Na',
      dosage: '1 g / L d’eau de boisson',
      route: 'Eau de boisson',
      duration: 3,
      eggWait: 0,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] border border-[#E9E5D8] rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E5D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4F2] flex items-center justify-center text-[#FF4B2B]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
                Enregistrer un Traitement Vétérinaire
              </h2>
              <p className="text-xs text-[#8A8D7C]">Traçabilité légale du carnet sanitaire & respect des délais d'attente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8D7C] hover:text-[#3D4035] hover:bg-[#F9F7F2] rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick templates */}
        <div className="mt-4">
          <p className="text-[11px] font-bold text-[#8A8D7C] uppercase tracking-wider mb-2">
            Protocoles fréquents :
          </p>
          <div className="flex flex-wrap gap-1.5">
            {commonPrescriptions.map((proto, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDiagnosis(proto.diagnosis);
                  setProductName(proto.productName);
                  setActiveMolecule(proto.molecule);
                  setDosage(proto.dosage);
                  setRoute(proto.route);
                  setDurationDays(proto.duration);
                  setEggWithdrawalDays(proto.eggWait);
                }}
                className="text-[11px] px-2.5 py-1 bg-[#F9F7F2] hover:bg-[#E9E5D8] text-[#3D4035] font-medium rounded-lg border border-[#E9E5D8] transition-colors text-left"
              >
                + {proto.productName}
              </button>
            ))}
          </div>
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
                    {f.name} ({f.breed} - {f.currentCount} sujets)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Motif / Diagnostic</label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Ex: Entérite, Prévention hépatique..."
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Médicament Commercial</label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Hépaturyl Aviaire Bio"
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Molécule Active</label>
              <input
                type="text"
                value={activeMolecule}
                onChange={(e) => setActiveMolecule(e.target.value)}
                placeholder="Ex: Sorbitol, Choline, Vit C"
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Posologie & Concentration</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 1.5 ml / L d’eau"
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Voie d'Administration</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              >
                <option value="Eau de boisson">Eau de boisson (abreuvoir/pipette)</option>
                <option value="Aliment complet">Mélange dans l'aliment</option>
                <option value="Injection IM / SC">Injection intramusculaire / sous-cutanée</option>
                <option value="Pulvérisation / Nébulisation">Nébulisation atmosphérique</option>
                <option value="Individuelle orale">Administration orale directe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Date Début</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm font-semibold text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Durée (Jours)</label>
              <input
                type="number"
                min="1"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Date Fin Prévue</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl px-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          {/* Delais d'attente */}
          <div className="p-3.5 rounded-2xl bg-[#FFFBF0] border border-[#FFE7A3] space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F39C12]" />
              <span className="text-xs font-bold text-[#9E6504] uppercase">
                Délais d'attente légaux (Résidus médicamenteux)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D4035] mb-1">
                  Délai d'attente avant sortie / abattage du lot (Jours) :
                </label>
                <input
                  type="number"
                  min="0"
                  value={meatWithdrawalDays}
                  onChange={(e) => setMeatWithdrawalDays(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-[#FFE7A3] rounded-xl px-3 py-1.5 text-sm font-bold text-[#3D4035] focus:border-[#F39C12] outline-hidden"
                />
                <p className="text-[10px] text-[#8A8D7C] mt-1">
                  {Number(meatWithdrawalDays) > 0 ? (
                    <span className="text-[#FF4B2B] font-bold">⚠️ Enlèvement du lot interdit pendant {meatWithdrawalDays} jours après la fin du traitement</span>
                  ) : (
                    'Délai zéro (sortie du lot autorisée)'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Vétérinaire Prescripteur</label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-[#8A8D7C] absolute left-3 top-3" />
              <input
                type="text"
                value={prescribingVet}
                onChange={(e) => setPrescribingVet(e.target.value)}
                placeholder="Ex: Dr. Karine L."
                className="w-full bg-white border border-[#E9E5D8] rounded-2xl pl-9 pr-3 py-2 text-sm text-[#3D4035] focus:border-[#4A6741] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D4035] uppercase mb-1">Remarques / Précautions particulières</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Nettoyer le circuit d'eau après 5 jours, vérifier la consommation journalière..."
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
              <span>Enregistrer le Traitement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
