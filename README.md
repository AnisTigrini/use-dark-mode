# use-dark-mode-v2

A custom [React Hook](https://react.dev/reference/react/hooks) to help you implement a "dark mode" component for your application.
The user setting persists to `localStorage`.

[![npm version](https://badge.fury.io/js/use-dark-mode-v2.svg)](https://www.npmjs.com/package/use-dark-mode-v2)

> **This is a maintained fork of [`use-dark-mode`](https://github.com/donavon/use-dark-mode)** by [Donavon West](https://github.com/donavon).
> The original package still gets thousands of downloads a week, but it hasn't been released since 2019,
> can't be installed on React 17+ without `--legacy-peer-deps`, and breaks with server rendering in Next.js.
> This fork fixes those problems and simplifies the API. All credit for the original design goes to Donavon and its [contributors](#contributors).

**📖 Documentation and live demo: https://anistigrini.github.io/use-dark-mode/**

## Installation

```sh
npm i use-dark-mode-v2
```

Works with React 16.8 through 19.

## Usage

```jsx
import useDarkMode from 'use-dark-mode-v2';

function ThemeToggle() {
  const darkMode = useDarkMode();

  return (
    <button onClick={darkMode.toggle}>
      {darkMode.isDarkModeEnabled ? '☀ Light' : '☾ Dark'}
    </button>
  );
}
```

The hook adds a `dark-mode` or `light-mode` class to `<body>`, saves the user's choice in `localStorage`,
follows the OS theme until the user picks one, and keeps every component and tab in sync.

`useDarkMode` returns:

| Property | Description |
|---|---|
| `isDarkModeEnabled` | `true` when dark mode is on. |
| `toggle()` | Flip the current mode and save it as the user's choice. |
| `set(isDarkModeEnabled)` | Turn dark mode on (`true`) or off (`false`) and save it as the user's choice. |
| `reset()` | Forget the user's choice and go back to the default mode. |

By default the hook follows the OS theme until the user picks a mode. For a site designed dark-first (or light-first),
pass `useDarkMode({ defaultMode: 'dark' })`: it then starts dark whatever the OS says.

For the full API, the Next.js setup and how to prevent the flash on page load,
see the [documentation](https://anistigrini.github.io/use-dark-mode/).

## What this fork fixes

- React 17, 18 and 19 support ([#68](https://github.com/donavon/use-dark-mode/pull/68), [#70](https://github.com/donavon/use-dark-mode/issues/70), [#96](https://github.com/donavon/use-dark-mode/issues/96))
- No hydration errors, flash or double-click toggle in Next.js ([#83](https://github.com/donavon/use-dark-mode/issues/83), [#55](https://github.com/donavon/use-dark-mode/issues/55), [#66](https://github.com/donavon/use-dark-mode/issues/66), [#80](https://github.com/donavon/use-dark-mode/issues/80))
- Works with Vite and other modern bundlers ([#91](https://github.com/donavon/use-dark-mode/issues/91))
- Respects the user's choice, and follows the OS theme until they make one ([#52](https://github.com/donavon/use-dark-mode/issues/52))
- No abandoned dependencies, and no crash when storage is unavailable

## Migrating from `use-dark-mode`

```sh
npm uninstall use-dark-mode && npm i use-dark-mode-v2
```

Change your imports to `use-dark-mode-v2`, then update the call and what it returns:

| `use-dark-mode` | `use-dark-mode-v2` |
|---|---|
| `useDarkMode(initialState, config)` | `useDarkMode(config)` |
| `darkMode.value` | `darkMode.isDarkModeEnabled` |
| `darkMode.enable()` | `darkMode.set(true)` |
| `darkMode.disable()` | `darkMode.set(false)` |
| `darkMode.toggle()` | `darkMode.toggle()` (unchanged) |

The other options and the default `storageKey` are unchanged, so your users keep their saved preference.
`initialState` was only used in browsers without an OS theme setting, so dropping it changes nothing for most apps.
If you meant it as "start dark", pass `{ defaultMode: 'dark' }`.
Two behaviours changed on purpose: nothing is saved until the user picks a mode, and once they have, OS theme changes no longer override it (use `reset()` to follow the OS again).

## Sample Apps

If you have an app built with `use-dark-mode-v2` you would like to include on this list, open a PR.

* [Original demo app on CodeSandbox](https://codesandbox.io/s/mzj64x80ny) (uses the original `use-dark-mode`) - by [@donavon](https://twitter.com/donavon)

## License

**[MIT](LICENSE)** Licensed. Original work © Donavon West.

## Contributors

These are the contributors to the original `use-dark-mode`. Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://donavon.com"><img src="https://avatars3.githubusercontent.com/u/887639?v=4" width="100px;" alt=""/><br /><sub><b>Donavon West</b></sub></a><br /><a href="#infra-donavon" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/donavon/use-dark-mode/commits?author=donavon" title="Tests">⚠️</a> <a href="#example-donavon" title="Examples">💡</a> <a href="#ideas-donavon" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-donavon" title="Maintenance">🚧</a> <a href="https://github.com/donavon/use-dark-mode/pulls?q=is%3Apr+reviewed-by%3Adonavon" title="Reviewed Pull Requests">👀</a> <a href="#tool-donavon" title="Tools">🔧</a> <a href="https://github.com/donavon/use-dark-mode/commits?author=donavon" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/revelcw"><img src="https://avatars2.githubusercontent.com/u/29359616?v=4" width="100px;" alt=""/><br /><sub><b>Revel Carlberg West</b></sub></a><br /><a href="#ideas-revelcw" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Andarist"><img src="https://avatars2.githubusercontent.com/u/9800850?v=4" width="100px;" alt=""/><br /><sub><b>Mateusz Burzyński</b></sub></a><br /><a href="https://github.com/donavon/use-dark-mode/commits?author=Andarist" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wKovacs64"><img src="https://avatars1.githubusercontent.com/u/1288694?v=4" width="100px;" alt=""/><br /><sub><b>Justin Hall</b></sub></a><br /><a href="https://github.com/donavon/use-dark-mode/commits?author=wKovacs64" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/fxbabys"><img src="https://avatars1.githubusercontent.com/u/24556921?v=4" width="100px;" alt=""/><br /><sub><b>Jeremy</b></sub></a><br /><a href="#userTesting-fxbabys" title="User Testing">📓</a> <a href="https://github.com/donavon/use-dark-mode/issues?q=author%3Afxbabys" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://janosh.io"><img src="https://avatars0.githubusercontent.com/u/30958850?v=4" width="100px;" alt=""/><br /><sub><b>Janosh Riebesell</b></sub></a><br /><a href="https://github.com/donavon/use-dark-mode/commits?author=janosh" title="Documentation">📖</a></td>
    <td align="center"><a href="http://hipstersmoothie.com"><img src="https://avatars3.githubusercontent.com/u/1192452?v=4" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="https://github.com/donavon/use-dark-mode/commits?author=hipstersmoothie" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://jorgegonzalez.io"><img src="https://avatars2.githubusercontent.com/u/12901172?v=4" width="100px;" alt=""/><br /><sub><b>Jorge Gonzalez</b></sub></a><br /><a href="https://github.com/donavon/use-dark-mode/commits?author=jorgegonzalez" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
