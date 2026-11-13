import { useEffect, useCallback, useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import initialize from './initialize';
import { getServerSnapshot } from './createPersistedState';

const useDarkMode = ({
  defaultMode = 'system',
  element,
  classNameDark,
  classNameLight,
  onChange,
  storageKey = 'darkMode',
  storageProvider,
  global,
} = {}) => {
  const {
    usePersistedDarkModeState,
    getDefaultOnChange,
    getSystemSnapshot,
    subscribeToSystem,
  } = useMemo(
    () => initialize(storageKey, storageProvider, global),
    [storageKey, storageProvider, global]
  );

  const systemValue = useSyncExternalStore(subscribeToSystem, getSystemSnapshot, getServerSnapshot);

  const fallback = defaultMode === 'system' ? systemValue === true : defaultMode === 'dark';

  // The user's saved choice wins over the fallback.
  const [state, setState, reset] = usePersistedDarkModeState(fallback);

  const stateChangeCallback = useMemo(
    () => onChange || getDefaultOnChange(element, classNameDark, classNameLight),
    [onChange, element, classNameDark, classNameLight, getDefaultOnChange]
  );

  // Call the onChange handler
  useEffect(() => {
    stateChangeCallback(state);
  }, [stateChangeCallback, state]);

  return {
    isDarkModeEnabled: state,
    set: useCallback(value => setState(value), [setState]),
    toggle: useCallback(() => setState(current => !current), [setState]),
    reset,
  };
};

export default useDarkMode;
