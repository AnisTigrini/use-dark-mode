import { testHook, act, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';

import useDarkMode from '../src';

afterEach(cleanup);

const createTestElement = arr => ({
  classList: {
    add: (className) => {
      arr.push({ method: 'add', className });
    },
    remove: (className) => {
      arr.push({ method: 'remove', className });
    },
  },
});

// A fake `window` whose OS dark-mode preference can be changed from the test.
// `legacy: true` mimics Safari < 14 (addListener/removeListener only).
const createMockGlobal = ({ matches = false, legacy = false } = {}) => {
  const listeners = new Set();
  const mql = { media: '(prefers-color-scheme: dark)', matches };
  if (legacy) {
    mql.addListener = (l) => { listeners.add(l); };
    mql.removeListener = (l) => { listeners.delete(l); };
  } else {
    mql.addEventListener = (_, l) => { listeners.add(l); };
    mql.removeEventListener = (_, l) => { listeners.delete(l); };
  }
  return {
    global: { matchMedia: () => mql },
    listeners,
    setSystem: (value) => {
      mql.matches = value;
      listeners.forEach(l => l({ matches: value }));
    },
  };
};

describe('useDarkMode without onChange', () => {
  test('without options and no OS preference, returns false', () => {
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode());
    });
    expect(value).toBe(false);
  });

  test("`defaultMode: 'light'` returns false", () => {
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ defaultMode: 'light', storageKey: null }));
    });
    expect(value).toBe(false);
  });

  test("`defaultMode: 'dark'` returns true", () => {
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ defaultMode: 'dark', storageKey: null }));
    });
    expect(value).toBe(true);
  });

  test('calling `set(true)` will return `true`', () => {
    let value;
    let set;
    testHook(() => {
      ({ isDarkModeEnabled: value, set } = useDarkMode({ storageKey: null }));
    });
    act(() => set(true));
    expect(value).toBe(true);
  });

  test('calling `set(false)` will return `false`', () => {
    let value;
    let set;
    testHook(() => {
      ({ isDarkModeEnabled: value, set } = useDarkMode({ defaultMode: 'dark', storageKey: null }));
    });
    act(() => set(false));
    expect(value).toBe(false);
  });

  test('calling `toggle` will return flip from `true` to `false` and vice versa', () => {
    let value;
    let toggle;
    testHook(() => {
      ({ isDarkModeEnabled: value, toggle } = useDarkMode({ defaultMode: 'dark', storageKey: null }));
    });
    act(toggle);
    expect(value).toBe(false);
    act(toggle);
    expect(value).toBe(true);
  });

  test('a media change to "dark mode" will return true', () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: false });
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ storageKey: null, global: mockGlobal }));
    });
    expect(value).toBe(false);
    act(() => setSystem(true));
    expect(value).toBe(true);
  });

  test('a media change to "light mode" will return false', () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: true });
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ storageKey: null, global: mockGlobal }));
    });
    expect(value).toBe(true);
    act(() => setSystem(false));
    expect(value).toBe(false);
  });
});

describe('useDarkMode with onChange', () => {
  test('calling `set(true)` will call handler with `true`', () => {
    let set;
    const handler = jest.fn();
    testHook(() => {
      ({ set } = useDarkMode({ storageKey: null, onChange: handler }));
    });
    act(() => set(true));
    expect(handler).toHaveBeenCalledWith(true);
  });
  test('calling `set(false)` will call handler with `false`', () => {
    let set;
    const handler = jest.fn();
    testHook(() => {
      ({ set } = useDarkMode({ defaultMode: 'dark', storageKey: null, onChange: handler }));
    });
    act(() => set(false));
    expect(handler).toHaveBeenCalledWith(false);
  });
});

describe('useDarkMode with the default storage', () => {
  test('works with `localStorage` and the default `storageKey`', () => {
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ defaultMode: 'dark' }));
    });
    expect(value).toBe(true);
  });
});

describe('useDarkMode and default `onChange`', () => {
  test('`classNameDark` and `classNameDark` default', () => {
    const calls = [];
    const mockElement = createTestElement(calls);

    testHook(() => {
      (useDarkMode({ defaultMode: 'dark',
        storageKey: null,
        element: mockElement,
      }));
    });
    expect(calls.length).toBe(2);
    expect(calls[0]).toEqual({ method: 'add', className: 'dark-mode' });
    expect(calls[1]).toEqual({ method: 'remove', className: 'light-mode' });
  });

  test('`classNameDark` and `classNameDark` can be specified in `config`', () => {
    const calls = [];
    const mockElement = createTestElement(calls);

    let toggle;
    testHook(() => {
      ({ toggle } = useDarkMode({ defaultMode: 'dark',
        storageKey: null,
        element: mockElement,
        classNameDark: 'd',
        classNameLight: 'l',
      }));
    });
    expect(calls.length).toBe(2);
    expect(calls[0]).toEqual({ method: 'add', className: 'd' });
    expect(calls[1]).toEqual({ method: 'remove', className: 'l' });

    act(toggle);
    expect(calls.length).toBe(4);
    expect(calls[2]).toEqual({ method: 'add', className: 'l' });
    expect(calls[3]).toEqual({ method: 'remove', className: 'd' });
  });

  test('you can specify a custom `storageProvider` and a `storageKey', () => {
    const data = [];
    const mockProvider = {
      getItem: () => null,
      setItem: (key, value) => { data.push([key, value]); },
    };

    let toggle;
    testHook(() => {
      ({ toggle } = useDarkMode({ defaultMode: 'dark',
        storageKey: 'key',
        storageProvider: mockProvider,
        onChange: () => {},
      }));
    });
    // Nothing is saved until the user actually changes the value.
    expect(data.length).toBe(0);

    act(toggle);

    expect(data.length).toBe(1);
    expect(data[0]).toEqual(['key', 'false']);
  });
});

describe('useDarkMode and the OS preference', () => {
  test('by default (`system`), the OS preference is used when nothing is saved', () => {
    const { global: mockGlobal } = createMockGlobal({ matches: true });
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ storageKey: null, global: mockGlobal }));
    });
    expect(value).toBe(true);
  });

  test("`defaultMode: 'dark'` ignores the OS, and `reset` goes back to dark", () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: false });
    let value;
    let set;
    let reset;
    testHook(() => {
      ({ isDarkModeEnabled: value, set, reset } = useDarkMode({
        defaultMode: 'dark',
        storageKey: null,
        global: mockGlobal,
      }));
    });
    expect(value).toBe(true);
    act(() => setSystem(false));
    expect(value).toBe(true);
    act(() => set(false));
    expect(value).toBe(false);
    act(reset);
    expect(value).toBe(true);
  });

  test("`defaultMode: 'light'` ignores a dark OS", () => {
    const { global: mockGlobal } = createMockGlobal({ matches: true });
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({
        defaultMode: 'light',
        storageKey: null,
        global: mockGlobal,
      }));
    });
    expect(value).toBe(false);
  });

  test('an explicit choice wins over later OS changes', () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: false });
    let value;
    let set;
    testHook(() => {
      ({ isDarkModeEnabled: value, set } = useDarkMode({ storageKey: null, global: mockGlobal }));
    });
    act(() => set(true));
    act(() => setSystem(false));
    expect(value).toBe(true);
  });

  test('without a saved choice, the OS preference is followed and nothing is stored', () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: false });
    const data = [];
    const provider = { getItem: () => null, setItem: (k, v) => { data.push([k, v]); } };
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ storageProvider: provider, global: mockGlobal }));
    });
    act(() => setSystem(true));
    expect(value).toBe(true);
    expect(data.length).toBe(0);
  });

  test('`reset` forgets the choice and follows the OS again (no storage)', () => {
    const { global: mockGlobal, setSystem } = createMockGlobal({ matches: false });
    let value;
    let set;
    let reset;
    testHook(() => {
      ({ isDarkModeEnabled: value, set, reset } = useDarkMode({
        storageKey: null,
        global: mockGlobal,
      }));
    });
    act(() => set(true));
    act(() => setSystem(false));
    expect(value).toBe(true); // The choice wins...
    act(reset);
    expect(value).toBe(false); // ...until reset: back to the OS value.
    act(() => setSystem(true));
    expect(value).toBe(true);
  });

  test('`reset` removes the saved choice from storage', () => {
    const { global: mockGlobal } = createMockGlobal({ matches: true });
    const data = {};
    const provider = {
      getItem: k => (k in data ? data[k] : null),
      setItem: (k, v) => { data[k] = v; },
      removeItem: (k) => { delete data[k]; },
    };
    let value;
    let set;
    let reset;
    testHook(() => {
      ({ isDarkModeEnabled: value, set, reset } = useDarkMode({
        storageKey: 'reset-test',
        storageProvider: provider,
        global: mockGlobal,
      }));
    });
    act(() => set(false));
    expect(data['reset-test']).toBe('false');
    expect(value).toBe(false);
    act(reset);
    expect('reset-test' in data).toBe(false);
    expect(value).toBe(true); // The OS preference.
  });

  test('supports the legacy `addListener` API and unsubscribes on unmount', () => {
    const { global: mockGlobal, setSystem, listeners } = createMockGlobal({ legacy: true });
    let value;
    testHook(() => {
      ({ isDarkModeEnabled: value } = useDarkMode({ storageKey: null, global: mockGlobal }));
    });
    expect(listeners.size).toBe(1);
    act(() => setSystem(true));
    expect(value).toBe(true);
    cleanup();
    expect(listeners.size).toBe(0);
  });
});
