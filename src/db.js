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
  expenses: [],
  hotels: [],
  roomAllocations: [],
  flights: [],
  transports: [],
  payments: []
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
  HOTELS: 'amja_crm_hotels',
  ALLOCATIONS: 'amja_crm_allocations',
  FLIGHTS: 'amja_crm_flights',
  TRANSPORTS: 'amja_crm_transports',
  PAYMENTS: 'amja_crm_payments',
  CONFIG: 'amja_crm_firebase_config'
};

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

// Seed Defaults
const SEED_HOTELS = [
  {
    id: 'hotel_makkah_1',
    name: 'Pullman Zamzam Makkah',
    city: 'Makkah',
    stars: 5,
    distanceHaram: '100m (Clock Tower Complex)',
    address: 'Abraj Al Bait Complex, King Abdul Aziz Endowment, Makkah',
    contact: '+966 12 571 5555',
    rooms: [
      { id: 'room_m_401', roomNumber: '401', type: 'Quad', capacity: 4, floor: '4th Floor', view: 'City View' },
      { id: 'room_m_402', roomNumber: '402', type: 'Quad', capacity: 4, floor: '4th Floor', view: 'Kaaba Partial' },
      { id: 'room_m_501', roomNumber: '501', type: 'Triple', capacity: 3, floor: '5th Floor', view: 'Haram View' },
      { id: 'room_m_601', roomNumber: '601', type: 'Double', capacity: 2, floor: '6th Floor', view: 'Kaaba Front' }
    ]
  },
  {
    id: 'hotel_madinah_1',
    name: 'Dar Al Taqwa Hotel Madinah',
    city: 'Madinah',
    stars: 5,
    distanceHaram: '50m (Facing Gate 25 / Rawdah)',
    address: 'Off Central North Area, Facing Prophet Mosque, Madinah',
    contact: '+966 14 829 1111',
    rooms: [
      { id: 'room_md_201', roomNumber: '201', type: 'Quad', capacity: 4, floor: '2nd Floor', view: 'Courtyard View' },
      { id: 'room_md_202', roomNumber: '202', type: 'Triple', capacity: 3, floor: '2nd Floor', view: 'City View' },
      { id: 'room_md_301', roomNumber: '301', type: 'Double', capacity: 2, floor: '3rd Floor', view: 'Haram Front' }
    ]
  }
];

const SEED_FLIGHTS = [
  {
    id: 'flight_1',
    direction: 'outbound',
    airline: 'SriLankan Airlines',
    flightNumber: 'UL 281',
    pnr: 'AMJA-98234',
    origin: 'Colombo (CMB) Bandaranayake Intl',
    destination: 'Jeddah (JED) King Abdulaziz Intl',
    departureDate: '2026-09-06',
    departureTime: '14:30',
    arrivalDate: '2026-09-06',
    arrivalTime: '18:45',
    seatBlock: '35 Seats Blocked',
    baggage: '2x 23kg Check-in + 7kg Cabin + 5L Zamzam Water',
    terminal: 'Terminal 1 (Jeddah Hajj Terminal)',
    notes: 'Direct group flight with specialized pilgrimage handling'
  },
  {
    id: 'flight_2',
    direction: 'inbound',
    airline: 'SriLankan Airlines',
    flightNumber: 'UL 282',
    pnr: 'AMJA-98234',
    origin: 'Madinah (MED) Prince Mohammad Bin Abdulaziz',
    destination: 'Colombo (CMB) Bandaranayake Intl',
    departureDate: '2026-09-20',
    departureTime: '20:15',
    arrivalDate: '2026-09-21',
    arrivalTime: '05:30',
    seatBlock: '35 Seats Blocked',
    baggage: '2x 23kg Check-in + 7kg Cabin + 5L Zamzam Water',
    terminal: 'International Gate 4',
    notes: 'Return flight direct from Madinah'
  }
];

const SEED_TRANSPORTS = [
  {
    id: 'trans_1',
    type: 'Airport Pickup Transfer',
    route: 'Jeddah Airport (JED) ➔ Makkah Hotel (Pullman Zamzam)',
    date: '2026-09-06',
    time: '20:00',
    vehicle: 'VIP SAPTCO Luxury Coach (50-Seater)',
    vehiclePlate: 'KSA-7782-HJJ',
    driver: 'Brother Tariq Al-Ghamdi',
    driverPhone: '+966 55 491 2288',
    status: 'Confirmed'
  },
  {
    id: 'trans_2',
    type: 'Intercity High-Speed Train',
    route: 'Makkah Station ➔ Madinah Station (Haramain High-Speed Rail)',
    date: '2026-09-13',
    time: '10:00',
    vehicle: 'Haramain Bullet Train (Carriage 4 & 5)',
    vehiclePlate: 'HHR-Reservation #4490',
    driver: 'Saudi Railway Organization',
    driverPhone: '19909',
    status: 'Confirmed'
  },
  {
    id: 'trans_3',
    type: 'Historical Ziyarah Tour',
    route: 'Madinah Historical Sites (Masjid Quba, Mount Uhud, Qiblatain, Dates Market)',
    date: '2026-09-15',
    time: '07:30',
    vehicle: 'Mercedes Travego AC Coach',
    vehiclePlate: 'KSA-3312-MDN',
    driver: 'Ustaz Fawaz Al-Harbi',
    driverPhone: '+966 50 119 7744',
    status: 'Scheduled'
  }
];

export function getFirebaseConfig() {
  try {
    const configStr = localStorage.getItem(KEYS.CONFIG);
    if (configStr) return JSON.parse(configStr);
  } catch (e) {
    console.error('Error reading Firebase config from LocalStorage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  if (config) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(KEYS.CONFIG);
  }
  return initializeDatabase();
}

export function isFirebaseConnected() {
  return firestoreDb !== null;
}

export function onDataChanged(callback) {
  listeners.push(callback);
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
  activeUnsubscribers.forEach(unsub => unsub());
  activeUnsubscribers = [];
  firestoreDb = null;
  firebaseApp = null;

  const config = getFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    loadLocalStorageData();
    notifyListeners();
    return false;
  }

  try {
    firebaseApp = initializeApp(config);
    firestoreDb = getFirestore(firebaseApp);
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
    cache.hotels = JSON.parse(localStorage.getItem(KEYS.HOTELS)) || SEED_HOTELS;
    cache.roomAllocations = JSON.parse(localStorage.getItem(KEYS.ALLOCATIONS)) || [];
    cache.flights = JSON.parse(localStorage.getItem(KEYS.FLIGHTS)) || SEED_FLIGHTS;
    cache.transports = JSON.parse(localStorage.getItem(KEYS.TRANSPORTS)) || SEED_TRANSPORTS;
    cache.payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS)) || [];
  } catch (e) {
    console.error('Failed to load LocalStorage data:', e);
    cache.customers = [];
    cache.groups = [];
    cache.expenses = [];
    cache.hotels = SEED_HOTELS;
    cache.roomAllocations = [];
    cache.flights = SEED_FLIGHTS;
    cache.transports = SEED_TRANSPORTS;
    cache.payments = [];
  }
}

function saveLocalStorageData() {
  try {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(cache.customers));
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(cache.groups));
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(cache.expenses));
    localStorage.setItem(KEYS.HOTELS, JSON.stringify(cache.hotels));
    localStorage.setItem(KEYS.ALLOCATIONS, JSON.stringify(cache.roomAllocations));
    localStorage.setItem(KEYS.FLIGHTS, JSON.stringify(cache.flights));
    localStorage.setItem(KEYS.TRANSPORTS, JSON.stringify(cache.transports));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(cache.payments));
  } catch (e) {
    console.error('Failed to save LocalStorage data:', e);
  }
}

// --- FIRESTORE REAL-TIME SYNCLISTENERS ---
function setupFirestoreListeners() {
  const customersQuery = query(collection(firestoreDb, 'customers'));
  const groupsQuery = query(collection(firestoreDb, 'groups'));
  const expensesQuery = query(collection(firestoreDb, 'expenses'));

  const unsubCust = onSnapshot(customersQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.customers = list;
    notifyListeners();
  }, (err) => console.error('Firestore Customers Sync Error:', err));

  const unsubGroups = onSnapshot(groupsQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.groups = list;
    notifyListeners();
  }, (err) => console.error('Firestore Groups Sync Error:', err));

  const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
    const list = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    cache.expenses = list;
    notifyListeners();
  }, (err) => console.error('Firestore Expenses Sync Error:', err));

  // Load remaining local collections
  cache.hotels = JSON.parse(localStorage.getItem(KEYS.HOTELS)) || SEED_HOTELS;
  cache.roomAllocations = JSON.parse(localStorage.getItem(KEYS.ALLOCATIONS)) || [];
  cache.flights = JSON.parse(localStorage.getItem(KEYS.FLIGHTS)) || SEED_FLIGHTS;
  cache.transports = JSON.parse(localStorage.getItem(KEYS.TRANSPORTS)) || SEED_TRANSPORTS;
  cache.payments = JSON.parse(localStorage.getItem(KEYS.PAYMENTS)) || [];

  activeUnsubscribers = [unsubCust, unsubGroups, unsubExpenses];
}

// --- PUBLIC CRUD API ---

// 1. CUSTOMERS CRUD
export async function getCustomers() {
  return cache.customers;
}

export async function saveCustomer(customerData) {
  const timestamp = new Date().toISOString();
  if (firestoreDb) {
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
    // Remove any room allocations for this customer
    cache.roomAllocations = cache.roomAllocations.filter(a => a.customerId !== id);
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

// 4. HOTELS & ROOMS CRUD
export async function getHotels() {
  return cache.hotels && cache.hotels.length > 0 ? cache.hotels : SEED_HOTELS;
}

export async function saveHotel(hotelData) {
  if (hotelData.id) {
    const idx = cache.hotels.findIndex(h => h.id === hotelData.id);
    if (idx !== -1) cache.hotels[idx] = { ...cache.hotels[idx], ...hotelData };
  } else {
    cache.hotels.push({ ...hotelData, id: generateId() });
  }
  saveLocalStorageData();
  notifyListeners();
}

export async function deleteHotel(id) {
  cache.hotels = cache.hotels.filter(h => h.id !== id);
  cache.roomAllocations = cache.roomAllocations.filter(a => a.hotelId !== id);
  saveLocalStorageData();
  notifyListeners();
}

// 5. ROOM ALLOCATIONS CRUD
export async function getRoomAllocations() {
  return cache.roomAllocations || [];
}

export async function saveRoomAllocation(allocData) {
  // Check if pilgrim is already allocated in this hotel
  const existingIdx = cache.roomAllocations.findIndex(
    a => a.hotelId === allocData.hotelId && a.customerId === allocData.customerId
  );

  if (existingIdx !== -1) {
    cache.roomAllocations[existingIdx] = { ...cache.roomAllocations[existingIdx], ...allocData };
  } else {
    cache.roomAllocations.push({ ...allocData, id: generateId(), allocatedAt: new Date().toISOString() });
  }
  saveLocalStorageData();
  notifyListeners();
}

export async function deleteRoomAllocation(id) {
  cache.roomAllocations = cache.roomAllocations.filter(a => a.id !== id);
  saveLocalStorageData();
  notifyListeners();
}

// 6. FLIGHTS CRUD
export async function getFlights() {
  return cache.flights && cache.flights.length > 0 ? cache.flights : SEED_FLIGHTS;
}

export async function saveFlight(flightData) {
  if (flightData.id) {
    const idx = cache.flights.findIndex(f => f.id === flightData.id);
    if (idx !== -1) cache.flights[idx] = { ...cache.flights[idx], ...flightData };
  } else {
    cache.flights.push({ ...flightData, id: generateId() });
  }
  saveLocalStorageData();
  notifyListeners();
}

export async function deleteFlight(id) {
  cache.flights = cache.flights.filter(f => f.id !== id);
  saveLocalStorageData();
  notifyListeners();
}

// 7. TRANSPORTS CRUD
export async function getTransports() {
  return cache.transports && cache.transports.length > 0 ? cache.transports : SEED_TRANSPORTS;
}

export async function saveTransport(transData) {
  if (transData.id) {
    const idx = cache.transports.findIndex(t => t.id === transData.id);
    if (idx !== -1) cache.transports[idx] = { ...cache.transports[idx], ...transData };
  } else {
    cache.transports.push({ ...transData, id: generateId() });
  }
  saveLocalStorageData();
  notifyListeners();
}

export async function deleteTransport(id) {
  cache.transports = cache.transports.filter(t => t.id !== id);
  saveLocalStorageData();
  notifyListeners();
}

// 8. PAYMENTS & INVOICES CRUD
export async function getPayments() {
  return cache.payments || [];
}

export async function recordPayment(paymentData) {
  const timestamp = new Date().toISOString();
  const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPayment = {
    ...paymentData,
    id: generateId(),
    receiptNo,
    createdAt: timestamp
  };

  cache.payments.push(newPayment);

  // Auto update customer's paid amount
  const custIdx = cache.customers.findIndex(c => c.id === paymentData.customerId);
  if (custIdx !== -1) {
    const currentPaid = cache.customers[custIdx].paid || 0;
    cache.customers[custIdx].paid = currentPaid + (Number(paymentData.amount) || 0);
  }

  saveLocalStorageData();
  notifyListeners();
  return newPayment;
}
