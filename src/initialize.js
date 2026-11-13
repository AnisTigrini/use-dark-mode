import { useState, useCallback } from 'react';
import createPersistedState from './createPersistedState';

const noop = () => {};

const mockElement = {
  classList: {
    add: noop,
    remove: noop,
  },
};

const preferDarkQuery = '(prefers-color-scheme: dark)';

export const useMemoryState = (fallback) => {
  const [override, setOverride] = useState(undefined);
  const value = override === undefined ? fallback : override;

  const setValue = useCallback((next) => {
    setOverride((current) => {
      const base = current === undefined ? fallback : current;
      return typeof next === 'function' ? next(base) : next;
    });
  }, [fallback]);

  const reset = useCallback(() => setOverride(undefined), []);

  return [value, setValue, reset];
};

const initialize = (storageKey, storageProvider, glbl = globalThis) => {
  const usePersistedDarkModeState = storageKey
    ? createPersistedState(storageKey, storageProvider, glbl)
    : useMemoryState;

  const mql = glbl.matchMedia ? glbl.matchMedia(preferDarkQuery) : null;
  const isColorSchemeQuerySupported = !!mql && mql.media === preferDarkQuery;

  // OS preference.
  const getSystemSnapshot = () => (isColorSchemeQuerySupported ? mql.matches : undefined);

  const subscribeToSystem = (onChange) => {
    if (!isColorSchemeQuerySupported) return noop;

    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }

    // These APIs are deprecated (for old browsers like Safari 14).
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  };

  // Mock element if SSR else real body element.
  const defaultElement = (glbl.document && glbl.document.body) || mockElement;

  const getDefaultOnChange = (
    element = defaultElement,
    classNameDark = 'dark-mode',
    classNameLight = 'light-mode'
  ) => (val) => {
    element.classList.add(val ? classNameDark : classNameLight);
    element.classList.remove(val ? classNameLight : classNameDark);
  };

  return {
    usePersistedDarkModeState,
    getDefaultOnChange,
    getSystemSnapshot,
    subscribeToSystem,
  };
};

export default initialize;
