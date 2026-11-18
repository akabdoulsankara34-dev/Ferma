import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Receipt,
  FileSpreadsheet,
  Check,
  Calendar,
} from 'lucide-react';
import { TransactionType, TransactionCategory } from '../types/poultry';

export const FinancesView: React.FC = () => {
  const { finances, addFinancialTransaction, totalIncome30d, totalExpense30d, netMargin30d, totalBirds } = useFarm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState<TransactionCategory>('vente_volailles_vives');
  const [amount, setAmount] = useState<number | ''>(1200);
  const [quantity, setQuantity] = useState<number | ''>(150);
  const [unit, setUnit] = useState('volailles');
  const [description, setDescription] = useState('');
  const [clientOrSupplier, setClientOrSupplier] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    addFinancialTransaction({
      date,
      type,
      category,
      amount: Number(amount),
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit || undefined,
      description: description.trim(),
      clientOrSupplier: clientOrSupplier.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setDescription('');
  };

  const costPerBirdEstimated = totalBirds > 0 ? (totalExpense30d / totalBirds).toFixed(2) : '2.45';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E5D8]">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#3D4035] font-['Outfit',sans-serif]">
            Finances, Ventes de Lots & Rentabilité
          </h2>
          <p className="text-xs md:text-sm text-[#8A8D7C]">
            Chiffre d'affaires des enlèvements de lots, achats poussins/aliments et coût de production par sujet
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white rounded-2xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Transaction</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#8A8D7C] uppercase">Recettes (30 Jours)</p>
            <TrendingUp className="w-4 h-4 text-[#4A6741]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#4A6741] mt-2">
            {totalIncome30d.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </h3>
          <span className="text-[11px] text-[#8A8D7C]">Enlèvements & ventes de lots</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#8A8D7C] uppercase">Dépenses (30 Jours)</p>
            <TrendingDown className="w-4 h-4 text-[#FF4B2B]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#FF4B2B] mt-2 tabular-nums">
            {totalExpense30d.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </h3>
          <span className="text-[11px] text-[#8A8D7C]">Poussins, aliments, soins & litière</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#8A8D7C] uppercase">Marge Nette (30J)</p>
            <DollarSign className="w-4 h-4 text-[#D4A373]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#D4A373] mt-2 tabular-nums">
            {netMargin30d.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </h3>
          <span className="text-[11px] text-[#27AE60] font-semibold">Solde d'exploitation</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E5D8] shadow-xs">
          <p className="text-xs font-bold text-[#8A8D7C] uppercase">Charge / Sujet Actif</p>
          <h3 className="text-2xl md:text-3xl font-bold text-[#3D4035] mt-2 tabular-nums">
            {costPerBirdEstimated} € <span className="text-xs font-normal text-[#8A8D7C]">/ sujet</span>
          </h3>
          <span className="text-[11px] text-[#8A8D7C]">Sur {totalBirds.toLocaleString()} volailles actives</span>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border border-[#E9E5D8] shadow-xs p-5 md:p-6 space-y-4">
        <h3 className="text-base md:text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif]">
          Journal des Ventes & Achats
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E9E5D8] text-[#8A8D7C] font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Description & Client / Fournisseur</th>
                <th className="py-3 px-3">Quantité</th>
                <th className="py-3 px-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5D8]/60">
              {finances.map((fin) => {
                const isIncome = fin.type === 'income';
                return (
                  <tr key={fin.id} className="hover:bg-[#F9F7F2]/80 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#3D4035]">
                      {new Date(fin.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isIncome ? 'bg-[#E9F0E6] text-[#4A6741]' : 'bg-[#FFF4F2] text-[#FF4B2B]'
                      }`}>
                        {isIncome ? 'Recette' : 'Dépense'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 capitalize text-[#3D4035]">
                      {fin.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#3D4035]">{fin.description}</p>
                      {fin.clientOrSupplier && (
                        <span className="text-[10px] text-[#8A8D7C]">Tiers : {fin.clientOrSupplier}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#3D4035]">
                      {fin.quantity ? `${fin.quantity} ${fin.unit || ''}` : '—'}
                    </td>
                    <td className={`py-3.5 px-3 text-right font-extrabold text-sm ${
                      isIncome ? 'text-[#4A6741]' : 'text-[#FF4B2B]'
                    }`}>
                      {isIncome ? '+' : '-'}{' '}
                      {fin.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FDFCF8] border border-[#E9E5D8] rounded-3xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#3D4035] font-['Outfit',sans-serif] pb-3 border-b border-[#E9E5D8]">
              Nouvelle Transaction Financière
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3D4035] uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    <option value="income">Recette (Vente)</option>
                    <option value="expense">Dépense (Achat / Frais)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3D4035] uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D4035] uppercase mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2 text-sm"
                >
                  <option value="vente_volailles_vives">Vente Volailles Vives / Enlèvement Lot</option>
                  <option value="vente_lots_abattus">Vente Lots Abattus / Prêts à Cuire</option>
                  <option value="vente_fientes_fumier">Vente Fientes / Fumier organique</option>
                  <option value="achat_poussins">Achat Poussins 1 jour (Mise en place)</option>
                  <option value="achat_aliment">Achat Aliments (Silos / Sacs)</option>
                  <option value="soins_vaccins_veto">Soins, Vaccins & Vétérinaire</option>
                  <option value="litiere_copeaux">Litière / Copeaux de bois</option>
                  <option value="energie_eau">Énergie & Eau</option>
                  <option value="materiel_equipement">Matériel & Équipement</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3D4035] uppercase mb-1">Montant (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2 text-base font-bold text-[#4A6741]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3D4035] uppercase mb-1">Quantité & Unité</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Qté"
                      className="w-1/2 bg-white border border-[#E9E5D8] rounded-xl px-2 py-2"
                    />
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Unité"
                      className="w-1/2 bg-white border border-[#E9E5D8] rounded-xl px-2 py-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D4035] uppercase mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Enlèvement 450 poulets Sasso Lot A1"
                  className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D4035] uppercase mb-1">Client ou Fournisseur</label>
                <input
                  type="text"
                  value={clientOrSupplier}
                  onChange={(e) => setClientOrSupplier(e.target.value)}
                  placeholder="Ex: Maison Frais Terroir"
                  className="w-full bg-white border border-[#E9E5D8] rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-[#F9F7F2] rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A6741] text-white rounded-xl font-bold shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
