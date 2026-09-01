// ----------------------------------------------------
// Amja Travels CRM - Dual-Mode Database Service (db.js)
// ----------------------------------------------------

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';

// In-memory cache for fast, synchronous UI updates
let cache = {
  customers: [],
  groups: [],
  expenses: []
};

// UI Subscription listeners
const listeners = [];
let firebaseApp = null;
let firestoreDb = null;
let activeUnsubscribers = [];

// LocalStorage Keys
const KEYS = {
  CUSTOMERS: 'amja_crm_customers',
  GROUPS: 'amja_crm_groups',
  EXPENSES: 'amja_crm_expenses',
  CONFIG: 'amja_crm_firebase_config'
};

// Helper: Generate unique ID for offline mode
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCj-1SVmds61ONGZ6FsD31KlFjdYiPw7II",
  authDomain: "amja-travels-ca870.firebaseapp.com",
  projectId: "amja-travels-ca870",
  storageBucket: "amja-travels-ca870.firebasestorage.app",
  messagingSenderId: "75246992156",
  appId: "1:75246992156:web:3d8644c6354e4b456818d9"
};

// Get stored Firebase configuration or default
export function getFirebaseConfig() {
  try {
    const configStr = localStorage.getItem(KEYS.CONFIG);
    if (configStr) return JSON.parse(configStr);
  } catch (e) {
    console.error('Error reading Firebase config from LocalStorage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Save Firebase configuration and trigger re-init
export function saveFirebaseConfig(config) {
  if (config) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(KEYS.CONFIG);
  }
  // Reinitialize database connection
  return initializeDatabase();
}

// Check if currently connected to Firebase
export function isFirebaseConnected() {
  return firestoreDb !== null;
}

// Subscribe to data changes (used by UI views to trigger re-renders)
export function onDataChanged(callback) {
  listeners.push(callback);
  // Return unsubscribe function
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach(cb => {
    try { cb(); } catch (e) { console.error('Error running update listener:', e); }
  });
}

// INITIALIZE DATABASE ENGINE
export async function initializeDatabase() {
  // Clear any existing Firebase listeners
  activeUnsubscribers.forEach(unsub => unsub());
  activeUnsubscribers = [];
  firestoreDb = null;
  firebaseApp = null;

  const config = getFirebaseConfig();

  // If no firebase config is saved, load from LocalStorage
  if (!config || !config.apiKey || !config.projectId) {
    console.log('Firebase not configured. Operating in LocalStorage Mode.');
    loadLocalStorageData();
    notifyListeners();
    return false;
  }

  try {
    console.log('Connecting to Firebase Firestore...');
    firebaseApp = initializeApp(config);
    firestoreDb = getFirestore(firebaseApp);

    // Setup real-time listeners for Firestore collections
    setupFirestoreListeners();
    return true;
  } catch (error) {
    console.error('Firebase initialization failed. Falling back to LocalStorage:', error);
    firestoreDb = null;
    firebaseApp = null;
    loadLocalStorageData();
    notifyListeners();
    return false;
  }
}

// --- LOCAL STORAGE DATA ENGINE ---
function loadLocalStorageData() {
  try {
    cache.customers = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS)) || [];
    cache.groups = JSON.parse(localStorage.getItem(KEYS.GROUPS)) || [];
    cache.expenses = JSON.parse(localStorage.getItem(KEYS.EXPENSES)) || [];
  } catch (e) {
    console.error('Failed to load LocalStorage data:', e);
    cache.customers = [];
    cache.groups = [];
    cache.expenses = [];
  }
}

function saveLocalStorageData() {
  try {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(cache.customers));
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(cache.groups));
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(cache.expenses));
  } catch (e) {
    console.error('Failed to save LocalStorage data:', e);
  }
}

// --- FIRESTORE REAL-TIME SYNCLISTENERS ---
function setupFirestoreListeners() {
  const customersQuery = query(collection(firestoreDb, 'customers'));
  const groupsQuery = query(collection(firestoreDb, 'groups'));
  const expensesQuery = query(collection(firestoreDb, 'expenses'));

  // Subscribe to Customers
  const unsubCust = onSnapshot(customersQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.customers = list;
    notifyListeners();
  }, (err) => {
    console.error('Firestore Customers Sync Error:', err);
  });

  // Subscribe to Groups
  const unsubGroups = onSnapshot(groupsQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.groups = list;
    notifyListeners();
  }, (err) => {
    console.error('Firestore Groups Sync Error:', err);
  });

  // Subscribe to Expenses
  const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.expenses = list;
    notifyListeners();
  }, (err) => {
    console.error('Firestore Expenses Sync Error:', err);
  });

  activeUnsubscribers = [unsubCust, unsubGroups, unsubExpenses];
}

// --- MIGRATION SERVICE (Local -> Firebase) ---
export async function migrateLocalDataToFirebase() {
  if (!firestoreDb) throw new Error('Database is not connected to Firebase.');

  const localCustomers = JSON.parse(localStorage.getItem(KEYS.CUSTOMERS)) || [];
  const localGroups = JSON.parse(localStorage.getItem(KEYS.GROUPS)) || [];
  const localExpenses = JSON.parse(localStorage.getItem(KEYS.EXPENSES)) || [];

  console.log(`Migrating data: ${localCustomers.length} customers, ${localGroups.length} groups, ${localExpenses.length} expenses.`);

  // Migrate Customers
  for (const customer of localCustomers) {
    const { id, ...data } = customer; // omit local ID
    await addDoc(collection(firestoreDb, 'customers'), {
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    });
  }

  // Migrate Groups
  for (const group of localGroups) {
    const { id, ...data } = group; // omit local ID
    await addDoc(collection(firestoreDb, 'groups'), {
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    });
  }

  // Migrate Expenses
  for (const expense of localExpenses) {
    const { id, ...data } = expense; // omit local ID
    await addDoc(collection(firestoreDb, 'expenses'), {
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    });
  }

  // Clear local keys so we don't prompt migration again
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.GROUPS);
  localStorage.removeItem(KEYS.EXPENSES);

  console.log('Migration finished successfully!');
}

// --- UNIFIED PUBLIC CRUD API ---

// 1. CUSTOMERS CRUD
export async function getCustomers() {
  return cache.customers;
}

export async function saveCustomer(customerData) {
  const timestamp = new Date().toISOString();
  
  if (firestoreDb) {
    // Firebase Mode
    if (customerData.id) {
      const { id, ...data } = customerData;
      const docRef = doc(firestoreDb, 'customers', id);
      await updateDoc(docRef, data);
    } else {
      await addDoc(collection(firestoreDb, 'customers'), {
        ...customerData,
        createdAt: timestamp
      });
    }
  } else {
    // LocalStorage Mode
    if (customerData.id) {
      const idx = cache.customers.findIndex(c => c.id === customerData.id);
      if (idx !== -1) {
        cache.customers[idx] = { ...cache.customers[idx], ...customerData };
      }
    } else {
      const newCustomer = {
        ...customerData,
        id: generateId(),
        createdAt: timestamp
      };
      cache.customers.push(newCustomer);
    }
    saveLocalStorageData();
    notifyListeners();
  }
}

export async function deleteCustomer(id) {
  if (firestoreDb) {
    const docRef = doc(firestoreDb, 'customers', id);
    await deleteDoc(docRef);
  } else {
    cache.customers = cache.customers.filter(c => c.id !== id);
    // Unassign customers from groups if applicable
    saveLocalStorageData();
    notifyListeners();
  }
}

// 2. GROUPS CRUD
export async function getGroups() {
  return cache.groups;
}

export async function saveGroup(groupData) {
  const timestamp = new Date().toISOString();
  
  if (firestoreDb) {
    if (groupData.id) {
      const { id, ...data } = groupData;
      const docRef = doc(firestoreDb, 'groups', id);
      await updateDoc(docRef, data);
    } else {
      await addDoc(collection(firestoreDb, 'groups'), {
        ...groupData,
        createdAt: timestamp
      });
    }
  } else {
    if (groupData.id) {
      const idx = cache.groups.findIndex(g => g.id === groupData.id);
      if (idx !== -1) {
        cache.groups[idx] = { ...cache.groups[idx], ...groupData };
      }
    } else {
      const newGroup = {
        ...groupData,
        id: generateId(),
        createdAt: timestamp
      };
      cache.groups.push(newGroup);
    }
    saveLocalStorageData();
    notifyListeners();
  }
}

export async function deleteGroup(id) {
  if (firestoreDb) {
    const docRef = doc(firestoreDb, 'groups', id);
    await deleteDoc(docRef);
  } else {
    cache.groups = cache.groups.filter(g => g.id !== id);
    saveLocalStorageData();
    notifyListeners();
  }
}

// 3. EXPENSES CRUD
export async function getExpenses() {
  return cache.expenses;
}

export async function saveExpense(expenseData) {
  const timestamp = new Date().toISOString();
  
  if (firestoreDb) {
    if (expenseData.id) {
      const { id, ...data } = expenseData;
      const docRef = doc(firestoreDb, 'expenses', id);
      await updateDoc(docRef, data);
    } else {
      await addDoc(collection(firestoreDb, 'expenses'), {
        ...expenseData,
        createdAt: timestamp
      });
    }
  } else {
    if (expenseData.id) {
      const idx = cache.expenses.findIndex(e => e.id === expenseData.id);
      if (idx !== -1) {
        cache.expenses[idx] = { ...cache.expenses[idx], ...expenseData };
      }
    } else {
      const newExpense = {
        ...expenseData,
        id: generateId(),
        createdAt: timestamp
      };
      cache.expenses.push(newExpense);
    }
    saveLocalStorageData();
    notifyListeners();
  }
}

export async function deleteExpense(id) {
  if (firestoreDb) {
    const docRef = doc(firestoreDb, 'expenses', id);
    await deleteDoc(docRef);
  } else {
    cache.expenses = cache.expenses.filter(e => e.id !== id);
    saveLocalStorageData();
    notifyListeners();
  }
}
