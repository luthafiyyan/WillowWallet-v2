import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth as getFirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase as getFirebaseDatabase, ref as firebaseRef, onValue as firebaseOnValue, push as firebasePush, set as firebaseSet, update as firebaseUpdate, remove as firebaseRemove } from 'firebase/database';

// 1. Check for stored config or env config
const getStoredConfig = () => {
  try {
    const stored = localStorage.getItem('WILLOW_FIREBASE_CONFIG');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored firebase config', e);
  }
  return null;
};

const envConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID,
};

const defaultConfig = {
  apiKey: "AIzaSyDtpe8SH8TRU2HjB6hc3sQtayNzJU9NGcw",
  authDomain: "willowwallet-65699.firebaseapp.com",
  databaseURL: "https://willowwallet-65699-default-rtdb.firebaseio.com",
  projectId: "willowwallet-65699",
  storageBucket: "willowwallet-65699.firebasestorage.app",
  messagingSenderId: "867520153542",
  appId: "1:867520153542:web:c2f407491af6f64c1754c7"
};

const isSandboxForced = localStorage.getItem('WILLOW_FORCE_SANDBOX') === 'true';

const hasEnvConfig = !!(envConfig.apiKey && envConfig.databaseURL);
const activeConfig = isSandboxForced 
  ? null 
  : (getStoredConfig() || (hasEnvConfig ? envConfig : defaultConfig));

export const isSandboxMode = !activeConfig;

// Setup Sandbox Database Mock
class SandboxDatabase {
  private listeners: { [path: string]: Array<(snapshot: { val: () => any; key: string | null }) => void> } = {};

  constructor() {
    if (!localStorage.getItem('WILLOW_SANDBOX_DB')) {
      // Default initial mock categories structure
      const defaultCategories = [
        'Makanan & Minuman',
        'Transportasi',
        'Belanja',
        'Tagihan & Utilitas',
        'Hiburan',
        'Keseharian',
        'Gaji',
        'Investasi',
        'Lainnya'
      ];
      localStorage.setItem('WILLOW_SANDBOX_DB', JSON.stringify({}));
    }
  }

  getRawData(): any {
    try {
      return JSON.parse(localStorage.getItem('WILLOW_SANDBOX_DB') || '{}');
    } catch {
      return {};
    }
  }

  setRawData(data: any) {
    localStorage.setItem('WILLOW_SANDBOX_DB', JSON.stringify(data));
    // Trigger any matched listeners
    Object.keys(this.listeners).forEach(listPath => {
      const val = this.getValueAtPath(data, listPath);
      this.listeners[listPath].forEach(callback => {
        const pathParts = listPath.split('/').filter(Boolean);
        const lastPart = pathParts[pathParts.length - 1] || null;
        callback({
          val: () => val,
          key: lastPart
        });
      });
    });
  }

  getValueAtPath(data: any, path: string): any {
    const parts = path.split('/').filter(p => p);
    let current = data;
    for (const part of parts) {
      if (!current || typeof current !== 'object') return null;
      current = current[part];
    }
    return current !== undefined ? current : null;
  }

  setValueAtPath(path: string, val: any) {
    const data = this.getRawData();
    const parts = path.split('/').filter(p => p);
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    if (parts.length > 0) {
      current[parts[parts.length - 1]] = val;
    } else {
      Object.assign(data, val);
    }
    this.setRawData(data);
  }

  updateValueAtPath(path: string, updates: any) {
    const data = this.getRawData();
    const parts = path.split('/').filter(p => p);
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    const targetKey = parts[parts.length - 1];
    if (targetKey) {
      if (!current[targetKey] || typeof current[targetKey] !== 'object') {
        current[targetKey] = {};
      }
      Object.assign(current[targetKey], updates);
    } else {
      Object.assign(data, updates);
    }
    this.setRawData(data);
  }

  removeValueAtPath(path: string) {
    const data = this.getRawData();
    const parts = path.split('/').filter(p => p);
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) return;
      current = current[part];
    }
    if (parts.length > 0) {
      delete current[parts[parts.length - 1]];
    }
    this.setRawData(data);
  }

  addListener(path: string, callback: (snapshot: { val: () => any; key: string | null }) => void) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    this.listeners[path].push(callback);
    // Trigger immediately with current value
    const val = this.getValueAtPath(this.getRawData(), path);
    const pathParts = path.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || null;
    callback({
      val: () => val,
      key: lastPart
    });

    // Return unsubscribe function
    return () => {
      this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
    };
  }
}

// Sandbox Authentication Mock
class SandboxAuth {
  private userListeners: Array<(user: any) => void> = [];
  public currentUser: any = null;

  constructor() {
    const storedUser = localStorage.getItem('WILLOW_SANDBOX_USER');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch {
        this.currentUser = null;
      }
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.userListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.userListeners = this.userListeners.filter(cb => cb !== callback);
    };
  }

  signInWithMockGoogle(name: string = 'Pengguna Willow', email: string = 'user@willow.com') {
    const mockUser = {
      uid: 'sandbox_user_123',
      displayName: name,
      email: email,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
    };
    this.currentUser = mockUser;
    localStorage.setItem('WILLOW_SANDBOX_USER', JSON.stringify(mockUser));
    this.notifyListeners();
    return Promise.resolve({ user: mockUser });
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('WILLOW_SANDBOX_USER');
    this.notifyListeners();
    return Promise.resolve();
  }

  private notifyListeners() {
    this.userListeners.forEach(callback => callback(this.currentUser));
  }
}

// 2. Initialize Real or Sandbox services
let realApp: any = null;
let realAuth: any = null;
let realDatabase: any = null;

if (!isSandboxMode && activeConfig) {
  try {
    realApp = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    realAuth = getFirebaseAuth(realApp);
    realDatabase = getFirebaseDatabase(realApp);
  } catch (error) {
    console.error('Failed to initialize actual Firebase, falling back to Sandbox Mode:', error);
  }
}

const sandboxDb = new SandboxDatabase();
const sandboxAuth = new SandboxAuth();

// Expose standardized unified APIs
export const auth = {
  getCurrentUser: () => {
    return isSandboxMode ? sandboxAuth.currentUser : realAuth?.currentUser;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    if (isSandboxMode) {
      return sandboxAuth.onAuthStateChanged(callback);
    } else {
      return realAuth.onAuthStateChanged(callback);
    }
  },
  signInWithGoogle: () => {
    if (isSandboxMode) {
      return sandboxAuth.signInWithMockGoogle();
    } else {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(realAuth, provider);
    }
  },
  signInWithMock: (name: string, email: string) => {
    return sandboxAuth.signInWithMockGoogle(name, email);
  },
  signOut: () => {
    if (isSandboxMode) {
      return sandboxAuth.signOut();
    } else {
      return signOut(realAuth);
    }
  }
};

export const dbRef = (path: string) => {
  return path; // Store path as reference string in standardized system
};

export const onValue = (pathRef: string, callback: (snapshot: any) => void) => {
  if (isSandboxMode) {
    return sandboxDb.addListener(pathRef, callback);
  } else {
    const fRef = firebaseRef(realDatabase, pathRef);
    return firebaseOnValue(fRef, callback);
  }
};

export const dbPush = (pathRef: string, value: any) => {
  if (isSandboxMode) {
    const id = 'tx_' + Math.random().toString(36).substr(2, 9);
    const fullPath = `${pathRef}/${id}`;
    sandboxDb.setValueAtPath(fullPath, { ...value, id });
    return Promise.resolve({ key: id });
  } else {
    const fRef = firebaseRef(realDatabase, pathRef);
    const newRef = firebasePush(fRef);
    const id = newRef.key || '';
    return firebaseSet(newRef, { ...value, id }).then(() => ({ key: id }));
  }
};

export const dbSet = (pathRef: string, value: any) => {
  if (isSandboxMode) {
    sandboxDb.setValueAtPath(pathRef, value);
    return Promise.resolve();
  } else {
    const fRef = firebaseRef(realDatabase, pathRef);
    return firebaseSet(fRef, value);
  }
};

export const dbUpdate = (pathRef: string, value: any) => {
  if (isSandboxMode) {
    sandboxDb.updateValueAtPath(pathRef, value);
    return Promise.resolve();
  } else {
    const fRef = firebaseRef(realDatabase, pathRef);
    return firebaseUpdate(fRef, value);
  }
};

export const dbRemove = (pathRef: string) => {
  if (isSandboxMode) {
    sandboxDb.removeValueAtPath(pathRef);
    return Promise.resolve();
  } else {
    const fRef = firebaseRef(realDatabase, pathRef);
    return firebaseRemove(fRef);
  }
};

// Config manager
export const saveFirebaseConfig = (config: any) => {
  if (config) {
    localStorage.setItem('WILLOW_FIREBASE_CONFIG', JSON.stringify(config));
    localStorage.removeItem('WILLOW_FORCE_SANDBOX');
  } else {
    localStorage.removeItem('WILLOW_FIREBASE_CONFIG');
    localStorage.setItem('WILLOW_FORCE_SANDBOX', 'true');
  }
  window.location.reload();
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem('WILLOW_FIREBASE_CONFIG');
  localStorage.setItem('WILLOW_FORCE_SANDBOX', 'true');
  window.location.reload();
};
