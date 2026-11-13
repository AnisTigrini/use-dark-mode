declare module 'use-dark-mode-v2' {
  /**
   * A config object allowing you to specify certain aspects of `useDarkMode`
   */
  export interface DarkModeConfig {
    defaultMode?: 'system' | 'dark' | 'light'; // The mode before the user picks one (and after `reset`). Default = "system" (follow the OS).
    classNameDark?: string; // A className to set "dark mode". Default = "dark-mode".
    classNameLight?: string; // A className to set "light mode". Default = "light-mode".
    element?: HTMLElement; // The element to apply the className. Default = `document.body`
    onChange?: (val?: boolean) => void; // Overide the default className handler with a custom callback.
    storageKey?: string | null; // Specify the `localStorage` key. Default = "darkMode". Set to `null` to disable persistent storage.
    storageProvider?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>; // A storage provider, e.g. `sessionStorage`. Default = `localStorage`.
    global?: Window; // The global object. Default = `globalThis`.
  }

  /**
   * An object returned from a call to `useDarkMode`.
   */
  export interface DarkMode {
    readonly isDarkModeEnabled: boolean;
    set: (isDarkModeEnabled: boolean) => void;
    toggle: () => void;
    reset: () => void;
  }

  /**
   * A custom React Hook to help you implement a "dark mode" component for your application.
   */
  export default function useDarkMode(config?: DarkModeConfig): DarkMode;
}
