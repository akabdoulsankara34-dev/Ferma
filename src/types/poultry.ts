export type FlockType = 'broilers' | 'pullets' | 'layers';

export interface House {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: FlockType;
  temperature: number; // °C
  humidity: number; // %
  lightingHours: number; // h/jour
  ventilationStatus: 'optimal' | 'warning' | 'alert';
  currentFlockId?: string;
}

export interface Flock {
  id: string;
  code: string;
  name: string;
  houseId: string;
  type: FlockType;
  breed: string; // ex: Sasso T451, Ross 308, Cobb 500, Label Fermier
  initialCount: number;
  currentCount: number;
  arrivalDate: string; // YYYY-MM-DD
  ageWeeks: number;
  targetLayingRatePercent?: number;
  targetWeightGrams?: number;
  currentWeightGrams?: number;
  status: 'active' | 'quarantine' | 'sold' | 'culled';
  notes?: string;
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  flockId: string;
  houseId: string;
  sampleSize: number; // Nombre de sujets pesés (échantillon)
  avgWeightGrams: number; // Poids moyen mesuré (g)
  targetWeightGrams: number; // Poids cible standard souche (g)
  uniformityPercent: number; // Homogénéité du lot (%)
  dailyGainGrams: number; // Gain Moyen Quotidien GMQ (g/j)
  fcr: number; // Indice de Consommation (IC)
  notes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  flockId: string;
  mortalityCount: number;
  culledCount: number; // Écartés / triés
  suspectedCause: string;
  symptoms: string[];
  autopsyNotes?: string;
  recordedBy: string;
  actionsTaken?: string;
}

export type VaccineAdministrationMethod = 'eau_boisson' | 'nebulisation' | 'goutte_oculaire' | 'injection' | 'transfixion_alaire';

export interface VaccinationScheduleItem {
  id: string;
  flockId: string;
  vaccineName: string;
  diseaseTarget: string; // Newcastle, Gumboro, Bronchite, Marek, Variole, Coryza
  targetAgeDays: number;
  targetAgeWeeks: number;
  scheduledDate: string;
  administeredDate?: string;
  method: VaccineAdministrationMethod;
  status: 'completed' | 'pending' | 'overdue';
  batchNumber?: string;
  withdrawalPeriodDays: number; // Délai d'attente
  vetNotes?: string;
}

export interface TreatmentRecord {
  id: string;
  date: string;
  flockId: string;
  diagnosis: string;
  productName: string;
  activeMolecule: string;
  dosage: string;
  route: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  eggWithdrawalDays: number;
  meatWithdrawalDays: number; // Délai d'attente avant sortie / abattage (jours)
  prescribingVet: string;
  status: 'in_progress' | 'completed';
  notes?: string;
}

export type FeedType = 'demarrage' | 'croissance' | 'finition' | 'pre_abattage' | 'ponte_phase1' | 'ponte_phase2' | 'pre_ponte';

export interface FeedRecord {
  id: string;
  date: string;
  flockId: string;
  feedType: FeedType;
  quantityKg: number;
  waterIntakeLiters: number;
  feedPerBirdGrams: number; // g / sujet / jour
  waterFeedRatio: number; // Ratio eau / aliment (normal 1.8 - 2.2)
  notes?: string;
}

export interface FeedInventory {
  id: string;
  feedType: FeedType;
  label: string;
  currentStockKg: number;
  alertThresholdKg: number;
  unitPricePerKg: number;
  supplier: string;
  lastRefillDate: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'vente_volailles_vives'
  | 'vente_lots_abattus'
  | 'vente_fientes_fumier'
  | 'achat_poussins'
  | 'achat_aliment'
  | 'soins_vaccins_veto'
  | 'litiere_copeaux'
  | 'energie_eau'
  | 'main_oeuvre'
  | 'materiel_equipement'
  | 'vente_oeufs_plateaux'
  | 'vente_oeufs_vrac'
  | 'autre';

export interface FinancialTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  quantity?: number;
  unit?: string;
  description: string;
  clientOrSupplier?: string;
  invoiceRef?: string;
}

export interface AIVetDiagnosis {
  diagnosticPrincipal: string;
  probabilite: 'Élevée' | 'Moyenne' | 'Faible';
  gravite: 'Critique' | 'Moyenne' | 'Faible';
  diagnosticsDifferentiels: Array<{ nom: string; justification: string }>;
  mesuresUrgentes: string[];
  traitementsRecommandes: Array<{ molecule: string; posologie: string; delaiAttente: string }>;
  conseilsProphylaxie: string[];
  rawText?: string;
}
