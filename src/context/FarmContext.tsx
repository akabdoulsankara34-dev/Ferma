import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import {
  db,
  subscribeToAuthChanges,
  testFirestoreConnection,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutUser as firebaseSignOutUser,
  handleFirestoreError,
  isPermissionError,
  stripUndefined,
  OperationType,
} from '../lib/firebase';
import {
  House,
  Flock,
  WeightRecord,
  HealthRecord,
  VaccinationScheduleItem,
  TreatmentRecord,
  FeedRecord,
  FeedInventory,
  FinancialTransaction,
} from '../types/poultry';
import {
  INITIAL_HOUSES,
  INITIAL_FLOCKS,
  INITIAL_WEIGHT_RECORDS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_VACCINATIONS,
  INITIAL_TREATMENTS,
  INITIAL_FEED_INVENTORY,
  INITIAL_FEED_RECORDS,
  INITIAL_FINANCES,
} from '../data/initialData';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface FarmContextType {
  houses: House[];
  flocks: Flock[];
  weightRecords: WeightRecord[];
  healthRecords: HealthRecord[];
  vaccinations: VaccinationScheduleItem[];
  treatments: TreatmentRecord[];
  feedInventory: FeedInventory[];
  feedRecords: FeedRecord[];
  finances: FinancialTransaction[];
  selectedFlockId: string | 'all';
  setSelectedFlockId: (id: string | 'all') => void;

  // Cloud & Auth status
  user: User | null;
  isAuthReady: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  cloudSyncStatus: CloudSyncStatus;
  lastSyncTime: Date | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Actions
  addWeightRecord: (record: Omit<WeightRecord, 'id'>) => Promise<void>;
  deleteWeightRecord: (id: string) => Promise<void>;
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;
  toggleVaccinationStatus: (id: string) => Promise<void>;
  addVaccination: (item: Omit<VaccinationScheduleItem, 'id'>) => Promise<void>;
  addTreatment: (item: Omit<TreatmentRecord, 'id'>) => Promise<void>;
  updateTreatmentStatus: (id: string, status: 'in_progress' | 'completed') => Promise<void>;
  addFeedRecord: (record: Omit<FeedRecord, 'id' | 'feedPerBirdGrams' | 'waterFeedRatio'>) => Promise<void>;
  updateFeedStock: (id: string, newStockKg: number) => Promise<void>;
  addFinancialTransaction: (trans: Omit<FinancialTransaction, 'id'>) => Promise<void>;
  addFlock: (flock: Omit<Flock, 'id' | 'code'>) => Promise<void>;
  updateFlockStatus: (flockId: string, status: Flock['status']) => Promise<void>;
  updateHouseParams: (houseId: string, params: Partial<House>) => Promise<void>;
  resetAllData: () => Promise<void>;

  // Computed flock tracking metrics
  totalBirds: number;
  activeFlocksCount: number;
  avgSurvivalRate: number;
  avgUniformityPercent: number;
  avgFCR: number;
  latestAvgDailyGain: number;
  recentMortalityCount: number;
  feedDaysRemaining: number;
  totalIncome30d: number;
  totalExpense30d: number;
  netMargin30d: number;
  activeSanitaryAlertsCount: number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'avicool_lots_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const [houses, setHouses] = useState<House[]>(() => loadFromStorage('houses', INITIAL_HOUSES));
  const [flocks, setFlocks] = useState<Flock[]>(() => loadFromStorage('flocks', INITIAL_FLOCKS));
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(() => loadFromStorage('weight_records', INITIAL_WEIGHT_RECORDS));
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => loadFromStorage('health_records', INITIAL_HEALTH_RECORDS));
  const [vaccinations, setVaccinations] = useState<VaccinationScheduleItem[]>(() => loadFromStorage('vaccinations', INITIAL_VACCINATIONS));
  const [treatments, setTreatments] = useState<TreatmentRecord[]>(() => loadFromStorage('treatments', INITIAL_TREATMENTS));
  const [feedInventory, setFeedInventory] = useState<FeedInventory[]>(() => loadFromStorage('feed_inventory', INITIAL_FEED_INVENTORY));
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(() => loadFromStorage('feed_records', INITIAL_FEED_RECORDS));
  const [finances, setFinances] = useState<FinancialTransaction[]>(() => loadFromStorage('finances', INITIAL_FINANCES));
  const [selectedFlockId, setSelectedFlockId] = useState<string | 'all'>('all');

  const hasSeededRef = useRef(false);

  // Local storage persistence fallback
  useEffect(() => { saveToStorage('houses', houses); }, [houses]);
  useEffect(() => { saveToStorage('flocks', flocks); }, [flocks]);
  useEffect(() => { saveToStorage('weight_records', weightRecords); }, [weightRecords]);
  useEffect(() => { saveToStorage('health_records', healthRecords); }, [healthRecords]);
  useEffect(() => { saveToStorage('vaccinations', vaccinations); }, [vaccinations]);
  useEffect(() => { saveToStorage('treatments', treatments); }, [treatments]);
  useEffect(() => { saveToStorage('feed_inventory', feedInventory); }, [feedInventory]);
  useEffect(() => { saveToStorage('feed_records', feedRecords); }, [feedRecords]);
  useEffect(() => { saveToStorage('finances', finances); }, [finances]);

  // Initialize Firebase Auth listener & startup connection test
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribeAuth = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        hasSeededRef.current = false;
        setCloudSyncStatus('offline');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const signInWithGoogle = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await firebaseSignInWithGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        console.error('Erreur de connexion Google:', err);
        setAuthError('Impossible de se connecter à Google pour la synchronisation.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await firebaseSignOutUser();
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleOperationError = (
    err: unknown,
    operationType: OperationType,
    path: string
  ) => {
    if (isPermissionError(err)) {
      setCloudSyncStatus('error');
      handleFirestoreError(err, operationType, path);
    } else {
      console.warn(`Firestore ${operationType} fallback (${path}):`, err);
      setCloudSyncStatus('offline');
    }
  };

  // Sync with Firestore in real-time ONLY when auth is ready and user is authenticated
  useEffect(() => {
    if (!isAuthReady || !user) {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');
    const uid = user.uid;

    const seedFirestoreIfEmpty = async (remoteHousesCount: number) => {
      if (remoteHousesCount === 0 && !hasSeededRef.current) {
        hasSeededRef.current = true;
        const seedPath = `users/${uid}`;
        try {
          const batch = writeBatch(db);

          const profileDoc = doc(db, 'users', uid, 'profile', 'info');
          batch.set(profileDoc, {
            userId: uid,
            email: user.email || '',
            displayName: user.displayName || 'Éleveur',
            farmName: 'Ferme Éco-Avenir',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          INITIAL_HOUSES.forEach((h) => {
            batch.set(doc(db, 'users', uid, 'houses', h.id), stripUndefined(h));
          });
          INITIAL_FLOCKS.forEach((f) => {
            batch.set(doc(db, 'users', uid, 'flocks', f.id), stripUndefined(f));
          });
          INITIAL_WEIGHT_RECORDS.forEach((w) => {
            batch.set(doc(db, 'users', uid, 'weight_records', w.id), stripUndefined(w));
          });
          INITIAL_HEALTH_RECORDS.forEach((h) => {
            batch.set(doc(db, 'users', uid, 'health_records', h.id), stripUndefined(h));
          });
          INITIAL_VACCINATIONS.forEach((v) => {
            batch.set(doc(db, 'users', uid, 'vaccinations', v.id), stripUndefined(v));
          });
          INITIAL_TREATMENTS.forEach((t) => {
            batch.set(doc(db, 'users', uid, 'treatments', t.id), stripUndefined(t));
          });
          INITIAL_FEED_INVENTORY.forEach((f) => {
            batch.set(doc(db, 'users', uid, 'feed_inventory', f.id), stripUndefined(f));
          });
          INITIAL_FEED_RECORDS.forEach((f) => {
            batch.set(doc(db, 'users', uid, 'feed_records', f.id), stripUndefined(f));
          });
          INITIAL_FINANCES.forEach((f) => {
            batch.set(doc(db, 'users', uid, 'finances', f.id), stripUndefined(f));
          });

          await batch.commit();
          setCloudSyncStatus('synced');
          setLastSyncTime(new Date());
        } catch (seedErr) {
          handleOperationError(seedErr, OperationType.WRITE, seedPath);
        }
      }
    };

    const unsubHouses = onSnapshot(
      collection(db, 'users', uid, 'houses'),
      (snapshot) => {
        if (!snapshot.empty) {
          setHouses(snapshot.docs.map((d) => d.data() as House));
        } else {
          seedFirestoreIfEmpty(snapshot.size);
        }
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/houses`)
    );

    const unsubFlocks = onSnapshot(
      collection(db, 'users', uid, 'flocks'),
      (snapshot) => {
        if (!snapshot.empty) {
          setFlocks(snapshot.docs.map((d) => d.data() as Flock));
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/flocks`)
    );

    const unsubWeights = onSnapshot(
      collection(db, 'users', uid, 'weight_records'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteWeights = snapshot.docs.map((d) => d.data() as WeightRecord);
          remoteWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setWeightRecords(remoteWeights);
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/weight_records`)
    );

    const unsubHealth = onSnapshot(
      collection(db, 'users', uid, 'health_records'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteHealth = snapshot.docs.map((d) => d.data() as HealthRecord);
          remoteHealth.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setHealthRecords(remoteHealth);
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/health_records`)
    );

    const unsubVaccinations = onSnapshot(
      collection(db, 'users', uid, 'vaccinations'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteVaccines = snapshot.docs.map((d) => d.data() as VaccinationScheduleItem);
          remoteVaccines.sort((a, b) => a.targetAgeDays - b.targetAgeDays);
          setVaccinations(remoteVaccines);
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/vaccinations`)
    );

    const unsubTreatments = onSnapshot(
      collection(db, 'users', uid, 'treatments'),
      (snapshot) => {
        if (!snapshot.empty) {
          setTreatments(snapshot.docs.map((d) => d.data() as TreatmentRecord));
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/treatments`)
    );

    const unsubFeedInv = onSnapshot(
      collection(db, 'users', uid, 'feed_inventory'),
      (snapshot) => {
        if (!snapshot.empty) {
          setFeedInventory(snapshot.docs.map((d) => d.data() as FeedInventory));
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/feed_inventory`)
    );

    const unsubFeedRec = onSnapshot(
      collection(db, 'users', uid, 'feed_records'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteFeedRec = snapshot.docs.map((d) => d.data() as FeedRecord);
          remoteFeedRec.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setFeedRecords(remoteFeedRec);
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/feed_records`)
    );

    const unsubFinances = onSnapshot(
      collection(db, 'users', uid, 'finances'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteFin = snapshot.docs.map((d) => d.data() as FinancialTransaction);
          remoteFin.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setFinances(remoteFin);
        }
      },
      (err) => handleOperationError(err, OperationType.LIST, `users/${uid}/finances`)
    );

    return () => {
      unsubHouses();
      unsubFlocks();
      unsubWeights();
      unsubHealth();
      unsubVaccinations();
      unsubTreatments();
      unsubFeedInv();
      unsubFeedRec();
      unsubFinances();
    };
  }, [isAuthReady, user]);

  // Actions
  const addWeightRecord = async (record: Omit<WeightRecord, 'id'>) => {
    const newRecord: WeightRecord = {
      ...record,
      id: `weight-${Date.now()}`,
    };
    setWeightRecords((prev) => [newRecord, ...prev]);

    let updatedFlock: Flock | undefined;
    setFlocks((prev) =>
      prev.map((f) => {
        if (f.id === record.flockId) {
          updatedFlock = { ...f, currentWeightGrams: record.avgWeightGrams };
          return updatedFlock;
        }
        return f;
      })
    );

    if (user) {
      const path = `users/${user.uid}/weight_records/${newRecord.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'weight_records', newRecord.id), stripUndefined(newRecord));
        if (updatedFlock) {
          await setDoc(doc(db, 'users', user.uid, 'flocks', updatedFlock.id), stripUndefined(updatedFlock));
        }
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const deleteWeightRecord = async (id: string) => {
    setWeightRecords((prev) => prev.filter((r) => r.id !== id));
    if (user) {
      const path = `users/${user.uid}/weight_records/${id}`;
      try {
        setCloudSyncStatus('syncing');
        await deleteDoc(doc(db, 'users', user.uid, 'weight_records', id));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.DELETE, path);
      }
    }
  };

  const addHealthRecord = async (record: Omit<HealthRecord, 'id'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `health-${Date.now()}`,
    };
    setHealthRecords((prev) => [newRecord, ...prev]);

    let updatedFlock: Flock | undefined;
    if (record.mortalityCount > 0 || record.culledCount > 0) {
      setFlocks((prev) =>
        prev.map((f) => {
          if (f.id === record.flockId) {
            const lost = Number(record.mortalityCount || 0) + Number(record.culledCount || 0);
            const currentCount = Math.max(0, f.currentCount - lost);
            updatedFlock = { ...f, currentCount };
            return updatedFlock;
          }
          return f;
        })
      );
    }

    if (user) {
      const path = `users/${user.uid}/health_records/${newRecord.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'health_records', newRecord.id), stripUndefined(newRecord));
        if (updatedFlock) {
          await setDoc(doc(db, 'users', user.uid, 'flocks', updatedFlock.id), stripUndefined(updatedFlock));
        }
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const deleteHealthRecord = async (id: string) => {
    setHealthRecords((prev) => prev.filter((r) => r.id !== id));
    if (user) {
      const path = `users/${user.uid}/health_records/${id}`;
      try {
        setCloudSyncStatus('syncing');
        await deleteDoc(doc(db, 'users', user.uid, 'health_records', id));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.DELETE, path);
      }
    }
  };

  const toggleVaccinationStatus = async (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedItem: VaccinationScheduleItem | undefined;

    setVaccinations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const isComp = v.status === 'completed';
          updatedItem = {
            ...v,
            status: isComp ? 'pending' : 'completed',
            administeredDate: isComp ? undefined : todayStr,
          };
          return updatedItem;
        }
        return v;
      })
    );

    if (user && updatedItem) {
      const path = `users/${user.uid}/vaccinations/${id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'vaccinations', id), stripUndefined(updatedItem));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.UPDATE, path);
      }
    }
  };

  const addVaccination = async (item: Omit<VaccinationScheduleItem, 'id'>) => {
    const newItem: VaccinationScheduleItem = {
      ...item,
      id: `vac-${Date.now()}`,
    };
    setVaccinations((prev) => [...prev, newItem]);

    if (user) {
      const path = `users/${user.uid}/vaccinations/${newItem.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'vaccinations', newItem.id), stripUndefined(newItem));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const addTreatment = async (item: Omit<TreatmentRecord, 'id'>) => {
    const newItem: TreatmentRecord = {
      ...item,
      id: `treat-${Date.now()}`,
    };
    setTreatments((prev) => [newItem, ...prev]);

    if (user) {
      const path = `users/${user.uid}/treatments/${newItem.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'treatments', newItem.id), stripUndefined(newItem));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const updateTreatmentStatus = async (id: string, status: 'in_progress' | 'completed') => {
    let updatedItem: TreatmentRecord | undefined;
    setTreatments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          updatedItem = { ...t, status };
          return updatedItem;
        }
        return t;
      })
    );

    if (user && updatedItem) {
      const path = `users/${user.uid}/treatments/${id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'treatments', id), stripUndefined(updatedItem));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.UPDATE, path);
      }
    }
  };

  const addFeedRecord = async (record: Omit<FeedRecord, 'id' | 'feedPerBirdGrams' | 'waterFeedRatio'>) => {
    const flock = flocks.find((f) => f.id === record.flockId);
    const birdCount = flock?.currentCount || 3000;
    const feedPerBirdGrams = birdCount > 0 ? Number(((record.quantityKg * 1000) / birdCount).toFixed(1)) : 120;
    const waterFeedRatio = record.quantityKg > 0 ? Number((record.waterIntakeLiters / record.quantityKg).toFixed(2)) : 2.0;

    const newRecord: FeedRecord = {
      ...record,
      id: `feed-${Date.now()}`,
      feedPerBirdGrams,
      waterFeedRatio,
    };
    setFeedRecords((prev) => [newRecord, ...prev]);

    let updatedInventory: FeedInventory | undefined;
    setFeedInventory((prev) =>
      prev.map((inv) => {
        if (inv.feedType === record.feedType) {
          const currentStockKg = Math.max(0, inv.currentStockKg - record.quantityKg);
          updatedInventory = { ...inv, currentStockKg };
          return updatedInventory;
        }
        return inv;
      })
    );

    if (user) {
      const path = `users/${user.uid}/feed_records/${newRecord.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'feed_records', newRecord.id), stripUndefined(newRecord));
        if (updatedInventory) {
          await setDoc(doc(db, 'users', user.uid, 'feed_inventory', updatedInventory.id), stripUndefined(updatedInventory));
        }
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const updateFeedStock = async (id: string, newStockKg: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updatedInv: FeedInventory | undefined;
    setFeedInventory((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          updatedInv = { ...inv, currentStockKg: newStockKg, lastRefillDate: todayStr };
          return updatedInv;
        }
        return inv;
      })
    );

    if (user && updatedInv) {
      const path = `users/${user.uid}/feed_inventory/${id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'feed_inventory', id), stripUndefined(updatedInv));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.UPDATE, path);
      }
    }
  };

  const addFinancialTransaction = async (trans: Omit<FinancialTransaction, 'id'>) => {
    const newTrans: FinancialTransaction = {
      ...trans,
      id: `fin-${Date.now()}`,
    };
    setFinances((prev) => [newTrans, ...prev]);

    if (user) {
      const path = `users/${user.uid}/finances/${newTrans.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'finances', newTrans.id), stripUndefined(newTrans));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const addFlock = async (flockData: Omit<Flock, 'id' | 'code'>) => {
    const code = `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newFlock: Flock = {
      ...flockData,
      id: `flock-${Date.now()}`,
      code,
    };
    setFlocks((prev) => [...prev, newFlock]);

    // Link house to the newly placed flock
    let updatedHouse: House | undefined;
    setHouses((prev) =>
      prev.map((h) => {
        if (h.id === flockData.houseId) {
          updatedHouse = { ...h, currentFlockId: newFlock.id };
          return updatedHouse;
        }
        return h;
      })
    );

    if (user) {
      const path = `users/${user.uid}/flocks/${newFlock.id}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'flocks', newFlock.id), stripUndefined(newFlock));
        if (updatedHouse) {
          await setDoc(doc(db, 'users', user.uid, 'houses', updatedHouse.id), stripUndefined(updatedHouse));
        }
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  const updateFlockStatus = async (flockId: string, status: Flock['status']) => {
    let updatedFlock: Flock | undefined;
    setFlocks((prev) =>
      prev.map((f) => {
        if (f.id === flockId) {
          updatedFlock = { ...f, status };
          return updatedFlock;
        }
        return f;
      })
    );

    if (user && updatedFlock) {
      const path = `users/${user.uid}/flocks/${flockId}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'flocks', flockId), stripUndefined(updatedFlock));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.UPDATE, path);
      }
    }
  };

  const updateHouseParams = async (houseId: string, params: Partial<House>) => {
    let updatedHouse: House | undefined;
    setHouses((prev) =>
      prev.map((h) => {
        if (h.id === houseId) {
          updatedHouse = { ...h, ...params };
          return updatedHouse;
        }
        return h;
      })
    );

    if (user && updatedHouse) {
      const path = `users/${user.uid}/houses/${houseId}`;
      try {
        setCloudSyncStatus('syncing');
        await setDoc(doc(db, 'users', user.uid, 'houses', houseId), stripUndefined(updatedHouse));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.UPDATE, path);
      }
    }
  };

  const resetAllData = async () => {
    localStorage.clear();
    setHouses(INITIAL_HOUSES);
    setFlocks(INITIAL_FLOCKS);
    setWeightRecords(INITIAL_WEIGHT_RECORDS);
    setHealthRecords(INITIAL_HEALTH_RECORDS);
    setVaccinations(INITIAL_VACCINATIONS);
    setTreatments(INITIAL_TREATMENTS);
    setFeedInventory(INITIAL_FEED_INVENTORY);
    setFeedRecords(INITIAL_FEED_RECORDS);
    setFinances(INITIAL_FINANCES);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        setCloudSyncStatus('syncing');
        const batch = writeBatch(db);
        INITIAL_HOUSES.forEach((h) => batch.set(doc(db, 'users', user.uid, 'houses', h.id), stripUndefined(h)));
        INITIAL_FLOCKS.forEach((f) => batch.set(doc(db, 'users', user.uid, 'flocks', f.id), stripUndefined(f)));
        INITIAL_WEIGHT_RECORDS.forEach((w) => batch.set(doc(db, 'users', user.uid, 'weight_records', w.id), stripUndefined(w)));
        INITIAL_HEALTH_RECORDS.forEach((h) => batch.set(doc(db, 'users', user.uid, 'health_records', h.id), stripUndefined(h)));
        INITIAL_VACCINATIONS.forEach((v) => batch.set(doc(db, 'users', user.uid, 'vaccinations', v.id), stripUndefined(v)));
        INITIAL_TREATMENTS.forEach((t) => batch.set(doc(db, 'users', user.uid, 'treatments', t.id), stripUndefined(t)));
        INITIAL_FEED_INVENTORY.forEach((f) => batch.set(doc(db, 'users', user.uid, 'feed_inventory', f.id), stripUndefined(f)));
        INITIAL_FEED_RECORDS.forEach((f) => batch.set(doc(db, 'users', user.uid, 'feed_records', f.id), stripUndefined(f)));
        INITIAL_FINANCES.forEach((f) => batch.set(doc(db, 'users', user.uid, 'finances', f.id), stripUndefined(f)));
        await batch.commit();
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch (err) {
        handleOperationError(err, OperationType.WRITE, path);
      }
    }
  };

  // Computations for Flock Tracking (Suivi des Lots)
  const activeFlocks = flocks.filter((f) => f.status === 'active' || f.status === 'quarantine');
  const activeFlocksCount = activeFlocks.length;
  const totalBirds = activeFlocks.reduce((acc, f) => acc + f.currentCount, 0);
  const totalInitialBirds = activeFlocks.reduce((acc, f) => acc + f.initialCount, 0);

  const avgSurvivalRate =
    totalInitialBirds > 0
      ? Number(((totalBirds / totalInitialBirds) * 100).toFixed(1))
      : 98.5;

  const latestWeights = weightRecords.slice(0, Math.max(1, activeFlocksCount));
  const avgUniformityPercent =
    latestWeights.length > 0
      ? Number((latestWeights.reduce((acc, w) => acc + w.uniformityPercent, 0) / latestWeights.length).toFixed(1))
      : 89.0;

  const avgFCR =
    latestWeights.length > 0
      ? Number((latestWeights.reduce((acc, w) => acc + w.fcr, 0) / latestWeights.length).toFixed(2))
      : 1.75;

  const latestAvgDailyGain =
    latestWeights.length > 0
      ? Math.round(latestWeights.reduce((acc, w) => acc + w.dailyGainGrams, 0) / latestWeights.length)
      : 50;

  const recentMortalityCount = healthRecords.slice(0, 5).reduce((acc, h) => acc + h.mortalityCount, 0);

  const totalCurrentFeedKg = feedInventory.reduce((acc, i) => acc + i.currentStockKg, 0);
  const dailyFeedConsumptionAvg = feedRecords.slice(0, 3).reduce((acc, f) => acc + f.quantityKg, 0) || 1080;
  const feedDaysRemaining = Math.max(1, Math.round(totalCurrentFeedKg / dailyFeedConsumptionAvg));

  const totalIncome30d = finances
    .filter((f) => f.type === 'income')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalExpense30d = finances
    .filter((f) => f.type === 'expense')
    .reduce((acc, f) => acc + f.amount, 0);

  const netMargin30d = totalIncome30d - totalExpense30d;

  const pendingVaccinationsCount = vaccinations.filter((v) => v.status === 'pending').length;
  const activeTreatmentsCount = treatments.filter((t) => t.status === 'in_progress').length;
  const feedAlertsCount = feedInventory.filter((i) => i.currentStockKg <= i.alertThresholdKg).length;
  const activeSanitaryAlertsCount = pendingVaccinationsCount + activeTreatmentsCount + feedAlertsCount;

  return (
    <FarmContext.Provider
      value={{
        houses,
        flocks,
        weightRecords,
        healthRecords,
        vaccinations,
        treatments,
        feedInventory,
        feedRecords,
        finances,
        selectedFlockId,
        setSelectedFlockId,
        user,
        isAuthReady,
        isAuthLoading,
        authError,
        cloudSyncStatus,
        lastSyncTime,
        signInWithGoogle,
        signOutUser,
        addWeightRecord,
        deleteWeightRecord,
        addHealthRecord,
        deleteHealthRecord,
        toggleVaccinationStatus,
        addVaccination,
        addTreatment,
        updateTreatmentStatus,
        addFeedRecord,
        updateFeedStock,
        addFinancialTransaction,
        addFlock,
        updateFlockStatus,
        updateHouseParams,
        resetAllData,
        totalBirds,
        activeFlocksCount,
        avgSurvivalRate,
        avgUniformityPercent,
        avgFCR,
        latestAvgDailyGain,
        recentMortalityCount,
        feedDaysRemaining,
        totalIncome30d,
        totalExpense30d,
        netMargin30d,
        activeSanitaryAlertsCount,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
