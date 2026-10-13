import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Project } from '../types/project';
import { IdeSettings, DEFAULT_SETTINGS } from '../types/settings';
import { DEFAULT_PROJECTS } from './starterProjects';

interface IdeDatabaseSchema extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updated': number };
  };
  settings: {
    key: string;
    value: unknown;
  };
  sqlDatabases: {
    key: string;
    value: Uint8Array;
  };
}

const DB_NAME = 'BrowserIdeDb';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<IdeDatabaseSchema>> | null = null;

export async function getIdeDatabase(): Promise<IDBPDatabase<IdeDatabaseSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<IdeDatabaseSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('sqlDatabases')) {
          db.createObjectStore('sqlDatabases');
        }
      },
    });
  }
  return dbPromise;
}

export async function initStorageWithDefaults(): Promise<void> {
  const db = await getIdeDatabase();
  const existingCount = await db.count('projects');
  if (existingCount === 0) {
    const tx = db.transaction('projects', 'readwrite');
    for (const proj of DEFAULT_PROJECTS) {
      await tx.store.put(proj);
    }
    await tx.done;
  }
}

export async function getActiveProjectId(): Promise<string | null> {
  const db = await getIdeDatabase();
  const val = await db.get('settings', 'activeProjectId');
  return (val as string) || null;
}

export async function setActiveProjectId(id: string): Promise<void> {
  const db = await getIdeDatabase();
  await db.put('settings', id, 'activeProjectId');
}

export async function getSavedSettings(): Promise<IdeSettings> {
  try {
    const db = await getIdeDatabase();
    const stored = (await db.get('settings', 'userPreferences')) as Partial<IdeSettings> | undefined;
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...stored };
    }
  } catch (e) {
    console.warn('Falling back to default settings', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: IdeSettings): Promise<void> {
  const db = await getIdeDatabase();
  await db.put('settings', settings, 'userPreferences');
}

export async function saveSqlBinary(key: string, data: Uint8Array): Promise<void> {
  const db = await getIdeDatabase();
  await db.put('sqlDatabases', data, key);
}

export async function getSqlBinary(key: string): Promise<Uint8Array | undefined> {
  const db = await getIdeDatabase();
  return db.get('sqlDatabases', key);
}

export async function clearSqlBinary(key: string): Promise<void> {
  const db = await getIdeDatabase();
  await db.delete('sqlDatabases', key);
}
