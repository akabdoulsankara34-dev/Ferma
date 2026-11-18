import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Wheat,
  Droplets,
  Plus,
  TrendingDown,
  AlertCircle,
  RotateCcw,
  Scale,
  Calendar,
  Check,
} from 'lucide-react';

interface FeedWaterViewProps {
  onOpenAddFeed: () => void;
}

export const FeedWaterView: React.FC<FeedWaterViewProps> = ({ onOpenAddFeed }) => {
  const { feedInventory, feedRecords, flocks, updateFeedStock } = useFarm();
  const [restockModalId, setRestockModalId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(3000);

  const totalStock = feedInventory.reduce((acc, i) => acc + i.currentStockKg, 0);

  const handleRestockSubmit = (id: string, current: number) => {
    updateFeedStock(id, current + Number(restockAmount));
    setRestockModalId(null);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E5D8]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Alimentation, Eau & Gestion des Silos
          </h2>
          <p className="text-xs md:text-sm text-[#8A8D7C]">
            Suivi des stocks d'aliments, consommation en g/sujet/j et surveillance du ratio hydrique
          </p>
        </div>

        <button
          onClick={onOpenAddFeed}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer Distribution Aliment</span>
        </button>
      </div>

      {/* Silo Inventory Cards */}
      <div>
        <h3 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif] mb-4">
          État des Silos de Stockage (Total : {totalStock.toLocaleString()} kg)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {feedInventory.map((item) => {
            const isLow = item.currentStockKg <= item.alertThresholdKg;
            const pct = Math.min(100, Math.round((item.currentStockKg / 6000) * 100));

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#E9E5D8] shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A8D7C]">Silo</span>
                    <h4 className="font-bold text-sm text-[#3D4035] mt-0.5 line-clamp-2">
                      {item.label}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isLow ? 'bg-[#FFF4F2] text-[#FF4B2B]' : 'bg-[#E9F0E6] text-[#4A6741]'
                  }`}>
                    {isLow ? 'Alerte Stock' : 'Optimal'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8A8D7C]">Niveau :</span>
                    <span className="font-extrabold text-sm text-[#3D4035]">
                      {item.currentStockKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#E9E5D8]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLow ? 'bg-[#FF4B2B]' : 'bg-[#D4A373]'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-[#8A8D7C] mt-1">
                    Seuil d'alerte : {item.alertThresholdKg.toLocaleString()} kg • Fournisseur : {item.supplier}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E9E5D8]">
                  <button
                    onClick={() => setRestockModalId(item.id)}
                    className="w-full py-2 bg-[#F9F7F2] hover:bg-[#E9E5D8] text-[#3D4035] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réapprovisionner Silo</span>
                  </button>
                </div>

                {/* Inline Restock Modal */}
                {restockModalId === item.id && (
                  <div className="p-3 bg-[#FFFBF0] rounded-2xl border border-[#FFE7A3] space-y-2 text-xs">
                    <p className="font-bold text-[#9E7C5A]">Quantité livrée (kg) :</p>
                    <input
                      type="number"
                      step="500"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(Number(e.target.value))}
                      className="w-full bg-white border border-[#E9E5D8] rounded-xl px-2 py-1 font-bold text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRestockModalId(null)}
                        className="flex-1 py-1 bg-white border border-[#E9E5D8] rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleRestockSubmit(item.id, item.currentStockKg)}
                        className="flex-1 py-1 bg-[#4A6741] text-white font-bold rounded-lg"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feed Conversion Ratio (FCR / Indice de Consommation) Guide */}
      <div className="bg-[#F9F7F2] rounded-3xl border border-[#E9E5D8] p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#D4A373]" />
          <h3 className="text-base font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Indicateurs Zootechniques d'Alimentation & Eau
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
            <span className="text-[10px] font-bold text-[#8A8D7C] uppercase">Ration Croissance & Finition</span>
            <p className="text-xl font-bold text-[#4A6741] mt-1 tabular-nums">95 à 155 g / sujet / jour</p>
            <p className="text-[#8A8D7C] text-[11px] mt-1">
              Adaptée selon l'âge du lot (démarrage 21% protéines puis finition énergétique) pour maximiser le GMQ.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
            <span className="text-[10px] font-bold text-[#8A8D7C] uppercase">Ratio Eau / Aliment</span>
            <p className="text-xl font-bold text-[#4A6741] mt-1 tabular-nums">1.8 à 2.2 x</p>
            <p className="text-[#8A8D7C] text-[11px] mt-1">
              Une hausse brutale (&gt;2.5x) signale un stress thermique ou entérique ; une baisse (&lt;1.6x) alerte sur un bouchage ou une pathologie.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E9E5D8]">
            <span className="text-[10px] font-bold text-[#8A8D7C] uppercase">Indice de Consommation (IC)</span>
            <p className="text-xl font-bold text-[#D4A373] mt-1 tabular-nums">1.65 à 1.95 kg / kg vif</p>
            <p className="text-[#8A8D7C] text-[11px] mt-1">
              Efficacité alimentaire mesurée entre l'entrée des poussins et l'abattage ou la sortie du lot.
            </p>
          </div>
        </div>
      </div>

      {/* Feed Distribution History Table */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
          Historique des Distributions d'Aliments & Abreuvement
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9E5D8] text-[#8A8D7C] font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Lot Concerne</th>
                <th className="py-3 px-3">Type Aliment</th>
                <th className="py-3 px-3">Quantité Distribuée</th>
                <th className="py-3 px-3">Eau (Litres)</th>
                <th className="py-3 px-3">Ration / Sujet</th>
                <th className="py-3 px-3">Ratio Eau/Alim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5D8]/60">
              {feedRecords.map((r) => {
                const flock = flocks.find((f) => f.id === r.flockId);
                return (
                  <tr key={r.id} className="hover:bg-[#F9F7F2]/80 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#3D4035]">
                      {new Date(r.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#3D4035]">{flock?.name || r.flockId}</td>
                    <td className="py-3.5 px-3 capitalize text-[#3D4035]">{r.feedType.replace('_', ' ')}</td>
                    <td className="py-3.5 px-3 font-bold text-[#4A6741]">{r.quantityKg} kg</td>
                    <td className="py-3.5 px-3 text-[#3D4035]">{r.waterIntakeLiters} L</td>
                    <td className="py-3.5 px-3 font-bold text-[#3D4035]">{r.feedPerBirdGrams} g/j</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-[#E9F0E6] text-[#4A6741] text-[11px]">
                        {r.waterFeedRatio}x
                      </span>
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
