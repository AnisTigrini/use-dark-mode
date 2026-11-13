import React from 'react';
import { render, act, cleanup } from 'react-testing-library';

import createPersistedState from '../src/createPersistedState';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// The listener registry and memory fallback are module-level,
// so every test uses its own key to stay isolated.
let keyCount = 0;
const nextKey = () => `test-key-${keyCount += 1}`;

// Renders a component that calls `usePersistedState(initialValue)`.
// `result.current` always holds the latest `[value, setValue]`.
const renderPersisted = (usePersistedState, initialValue) => {
  const result = {};
  const Test = () => {
    result.current = usePersistedState(initialValue);
    return null;
  };
  const { unmount } = render(<Test />);
  return { result, unmount };
};

const dispatchStorageEvent = (key) => {
  const event = new Event('storage');
  event.key = key;
  act(() => { window.dispatchEvent(event); });
};

describe('createPersistedState', () => {
  test('returns the initial value and writes nothing when storage is empty', () => {
    const key = nextKey();
    const { result } = renderPersisted(createPersistedState(key), true);
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(key)).toBe(null);
  });

  test('reads an existing value from localStorage by default', () => {
    const key = nextKey();
    localStorage.setItem(key, 'false');
    const { result } = renderPersisted(createPersistedState(key), true);
    expect(result.current[0]).toBe(false);
  });

  test('setting a value updates state and saves it as JSON', () => {
    const key = nextKey();
    const { result } = renderPersisted(createPersistedState(key, undefined, window), false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(key)).toBe('true');
  });

  test('a functional update receives the initial value when nothing is stored', () => {
    const key = nextKey();
    const { result } = renderPersisted(createPersistedState(key), true);
    act(() => result.current[1](current => !current));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](current => !current));
    expect(result.current[0]).toBe(true);
  });

  test('hooks using the same key in the same tab stay in sync', () => {
    const key = nextKey();
    const a = renderPersisted(createPersistedState(key), false);
    const b = renderPersisted(createPersistedState(key), false);
    act(() => a.result.current[1](true));
    expect(b.result.current[0]).toBe(true);
  });

  test('a change made in another tab updates the value', () => {
    const key = nextKey();
    const { result } = renderPersisted(createPersistedState(key), false);
    localStorage.setItem(key, 'true'); // What the other tab wrote.
    dispatchStorageEvent(key);
    expect(result.current[0]).toBe(true);
  });

  test('storage events for other keys are ignored, `clear()` is not', () => {
    const key = nextKey();
    localStorage.setItem(key, 'true');
    const { result } = renderPersisted(createPersistedState(key), false);
    localStorage.removeItem(key);
    dispatchStorageEvent('some-other-key');
    expect(result.current[0]).toBe(true); // Not re-read yet.
    dispatchStorageEvent(null); // Another tab called `localStorage.clear()`.
    expect(result.current[0]).toBe(false);
  });

  test('a corrupted stored value falls back to the initial value', () => {
    const key = nextKey();
    localStorage.setItem(key, 'not json');
    const { result } = renderPersisted(createPersistedState(key), true);
    expect(result.current[0]).toBe(true);
  });

  test('uses a custom storage provider', () => {
    const key = nextKey();
    const data = {};
    const provider = {
      getItem: k => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = v; },
    };
    const { result } = renderPersisted(createPersistedState(key, provider), false);
    act(() => result.current[1](true));
    expect(data[key]).toBe('true');
    expect(localStorage.getItem(key)).toBe(null);
  });

  test('keeps working in memory when storage throws', () => {
    const key = nextKey();
    const provider = {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: () => { throw new Error('QuotaExceededError'); },
    };
    const { result } = renderPersisted(createPersistedState(key, provider), false);
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  test('keeps working in memory when accessing localStorage throws', () => {
    const key = nextKey();
    const glbl = {
      get localStorage() { throw new Error('SecurityError'); },
    };
    const { result } = renderPersisted(createPersistedState(key, undefined, glbl), false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  test('works without any storage or events (SSR-like global)', () => {
    const key = nextKey();
    const { result, unmount } = renderPersisted(createPersistedState(key, undefined, {}), true);
    expect(result.current[0]).toBe(true);
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    unmount();
  });

  test('reset removes the saved value and goes back to the initial value', () => {
    const key = nextKey();
    const a = renderPersisted(createPersistedState(key), false);
    const b = renderPersisted(createPersistedState(key), false);
    act(() => a.result.current[1](true));
    expect(localStorage.getItem(key)).toBe('true');
    act(() => a.result.current[2]());
    expect(localStorage.getItem(key)).toBe(null);
    expect(a.result.current[0]).toBe(false);
    expect(b.result.current[0]).toBe(false); // Other hooks on the key follow.
  });

  test('reset works in memory when storage throws', () => {
    const key = nextKey();
    const provider = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: () => { throw new Error('SecurityError'); },
    };
    const { result } = renderPersisted(createPersistedState(key, provider), false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[2]());
    expect(result.current[0]).toBe(false);
  });

  test('stops listening after unmount', () => {
    const key = nextKey();
    const { result, unmount } = renderPersisted(createPersistedState(key), false);
    const setValue = result.current[1];
    unmount();
    setValue(true); // No listeners left: must not throw.
    dispatchStorageEvent(key);
    expect(localStorage.getItem(key)).toBe('true');
    expect(result.current[0]).toBe(false); // Unmounted, never re-rendered.
  });
});
