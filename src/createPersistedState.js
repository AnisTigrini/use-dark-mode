import { useCallback } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const listenersByKey = new Map();

const memory = new Map();

// Notifies the coponents that use the hook.
const notify = (key) => {
  (listenersByKey.get(key) || []).forEach(listener => listener());
};

// This is called by React 18+ while server rendering / hydrating, (next)
export const getServerSnapshot = /* istanbul ignore next */ () => undefined;

const createPersistedState = (key, storageProvider, glbl = globalThis) => {
  const getStorage = () => {
    try {
      return storageProvider || glbl.localStorage || null;
    } catch (e) {
      return null;
    }
  };

  const readRaw = () => {
    if (memory.has(key)) return memory.get(key);
    try {
      const storage = getStorage();
      return storage ? storage.getItem(key) : null;
    } catch (e) {
      return null;
    }
  };

  let cachedRaw;
  let cachedValue;

  const getSnapshot = () => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? undefined : JSON.parse(raw);
      } catch (e) {
        cachedValue = undefined; // Corrupted value: fall back to the initial value.
      }
    }
    return cachedValue;
  };

  const write = (value) => {
    const raw = JSON.stringify(value);
    try {
      getStorage().setItem(key, raw);
      memory.delete(key);
    } catch (e) {
      memory.set(key, raw);
    }
    notify(key);
  };

  // Forget the saved choice. If storage fails, `null` in memory means "nothing saved".
  const remove = () => {
    try {
      getStorage().removeItem(key);
      memory.delete(key);
    } catch (e) {
      memory.set(key, null);
    }
    notify(key);
  };

  const subscribe = (listener) => {
    if (!listenersByKey.has(key)) listenersByKey.set(key, new Set());
    const listeners = listenersByKey.get(key);
    listeners.add(listener);

    // Fired only in *other* tabs. `key === null` means `storage.clear()`.
    const onStorage = (event) => {
      if (event.key === key || event.key === null) listener();
    };

    if (glbl.addEventListener) glbl.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) listenersByKey.delete(key);
      if (glbl.removeEventListener) glbl.removeEventListener('storage', onStorage);
    };
  };

  return (initialValue) => {
    const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const value = stored === undefined ? initialValue : stored;

    const setValue = useCallback((next) => {
      const current = getSnapshot();
      const base = current === undefined ? initialValue : current;
      write(typeof next === 'function' ? next(base) : next);
    }, [initialValue]);

    return [value, setValue, remove];
  };
};

export default createPersistedState;
