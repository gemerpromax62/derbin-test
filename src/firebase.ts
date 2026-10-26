import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  UserProfileData,
  ProxyConfigData,
  SubscriptionPlan,
  GlassPresetId,
  HwidStatus,
  sanitizeUserProfileInput,
} from './utils/derbinLogic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

export { onAuthStateChanged };
export type { User };

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfileExists(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function ensureUserProfileExists(
  user: User,
  overrides?: Partial<UserProfileData>
): Promise<UserProfileData> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (existingSnap && existingSnap.exists()) {
    return existingSnap.data() as UserProfileData;
  }

  const sanitized = sanitizeUserProfileInput(
    {
      displayName: overrides?.displayName || user.displayName || 'derbin_player',
      minecraftNick:
        overrides?.minecraftNick ||
        (user.displayName ? user.displayName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) : 'omar_torrez'),
      subscriptionPlan: overrides?.subscriptionPlan || 'free',
      licenseKey: overrides?.licenseKey || 'DRB-FREE-IOS26-INIT0001',
      hwidStatus: overrides?.hwidStatus || 'bound',
      glassPreset: overrides?.glassPreset || 'prismatic_ios26',
    },
    user.uid
  );

  try {
    await setDoc(userRef, {
      ...sanitized,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  if (user.email) {
    const privatePath = `users/${user.uid}/private/info`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'private', 'info'), {
        uid: user.uid.slice(0, 128),
        email: user.email.slice(0, 120),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, privatePath);
    }
  }

  return sanitized;
}

export async function updateUserProfileDetails(
  uid: string,
  updates: {
    displayName: string;
    minecraftNick: string;
    glassPreset: GlassPresetId;
    hwidStatus: HwidStatus;
  }
): Promise<void> {
  const userPath = `users/${uid}`;
  const cleanNick = updates.minecraftNick.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
  const safeNick = cleanNick.length >= 2 ? cleanNick : 'omar_torrez';
  const safeDisplay = updates.displayName.trim().slice(0, 60) || safeNick;

  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName: safeDisplay,
      minecraftNick: safeNick,
      glassPreset: updates.glassPreset,
      hwidStatus: updates.hwidStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function updateUserSubscription(
  uid: string,
  plan: SubscriptionPlan,
  licenseKey: string,
  hwidStatus: HwidStatus = 'bound'
): Promise<void> {
  const userPath = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      subscriptionPlan: plan,
      licenseKey: licenseKey.trim().slice(0, 64),
      hwidStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function saveCloudProxyConfig(
  uid: string,
  configId: string,
  config: Omit<ProxyConfigData, 'id' | 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const safeId = configId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || `cfg_${Date.now()}`;
  const path = `users/${uid}/configs/${safeId}`;
  const cleanNick = config.accountName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
  const safeAccount = cleanNick.length >= 2 ? cleanNick : 'omar_torrez';

  try {
    await setDoc(doc(db, 'users', uid, 'configs', safeId), {
      uid: uid.slice(0, 128),
      name: config.name.trim().slice(0, 50) || 'Derbin Preset',
      serverAddress: config.serverAddress.trim().slice(0, 100) || 'mc.reallyworld.ru',
      accountName: safeAccount,
      dhcpSubnet: config.dhcpSubnet.trim().slice(0, 20) || '192.168.178.1',
      pingSpoofMs: Math.max(0, Math.min(120, Math.round(config.pingSpoofMs))),
      jitterSmoothPct: Math.max(10, Math.min(100, Math.round(config.jitterSmoothPct))),
      tracerouteBypass: Boolean(config.tracerouteBypass),
      routerMode: Boolean(config.routerMode),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCloudProxyConfig(uid: string, configId: string): Promise<void> {
  const path = `users/${uid}/configs/${configId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'configs', configId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfileData | null) => void
): () => void {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as UserProfileData);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToUserConfigs(
  uid: string,
  onData: (configs: ProxyConfigData[]) => void
): () => void {
  const path = `users/${uid}/configs`;
  const q = query(collection(db, 'users', uid, 'configs'));
  return onSnapshot(
    q,
    (snap) => {
      const items: ProxyConfigData[] = [];
      snap.forEach((d) => {
        const data = d.data() as ProxyConfigData;
        if (data.uid === uid) {
          items.push({ ...data, id: d.id });
        }
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
