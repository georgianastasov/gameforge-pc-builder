/**
 * Small wrappers around Web Storage for versioned JSON records. Storage can be
 * unavailable (private mode, quota, blocked site data), so every access is guarded
 * and callers fall back to their seeded defaults.
 */

/** Returns the stored payload when `version` matches; otherwise `null`. */
export function readVersioned(key: string, version: number, storage: 'local' | 'session' = 'local'): Record<string, unknown> | null {
  try {
    const json = getStorage(storage).getItem(key);
    const raw: unknown = json ? JSON.parse(json) : null;
    if (!raw || typeof raw !== 'object' || (raw as Record<string, unknown>)['version'] !== version) {
      return null;
    }
    return raw as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function writeVersioned(key: string, version: number, data: object, storage: 'local' | 'session' = 'local'): boolean {
  try {
    getStorage(storage).setItem(key, JSON.stringify({ version, ...data }));
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: string, storage: 'local' | 'session' = 'local'): void {
  try {
    getStorage(storage).removeItem(key);
  } catch {
    // Nothing to remove when storage is unavailable.
  }
}

function getStorage(storage: 'local' | 'session'): Storage {
  return storage === 'local' ? localStorage : sessionStorage;
}
