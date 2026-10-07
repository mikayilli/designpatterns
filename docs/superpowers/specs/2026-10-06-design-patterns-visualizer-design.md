# Design Patterns Visualizer — Design Spec

Date: 2026-10-06

## Goal

A static web app that explains the 12 most common design patterns simply and visually. For each pattern it shows: the problem it solves, where it is used in practice, a "bad" vs "good" code comparison, a diagram, and an interactive animation.

## Decisions

| Topic | Decision |
|---|---|
| Patterns | 12 common GoF patterns (see list below); more can be added later |
| Code languages | C++, Java, JavaScript, PHP (user-switchable) |
| Site language | Azerbaijani and English (user-switchable); code identifiers stay in English |
| Tech | Static site: HTML + CSS + vanilla JS, no build step, no framework |
| Visuals | SVG diagram + interactive animation per pattern |
| Syntax highlighting | Prism.js from CDN (only external dependency) |

## Patterns

- **Creational:** Singleton, Factory Method, Builder
- **Structural:** Adapter, Decorator, Facade, Proxy
- **Behavioral:** Observer, Strategy, Command, State, Iterator

| Pattern | Problem | Animation |
|---|---|---|
| Singleton | Accidental multiple instances of a shared resource | "new" button: bad version grows instances, good version returns the same one |
| Factory Method | Concrete classes are `new`-ed everywhere | Pick payment type, factory creates the right object |
| Builder | 10-parameter constructors are unreadable | Pizza/query assembled step by step |
| Adapter | Incompatible interfaces | EU plug + US socket, adapter makes the light turn on |
| Decorator | Subclass explosion for each combination | Coffee gets milk/sugar/cream layers; price and description accumulate |
| Facade | Client talks to many complex subsystems | One "Watch movie" button drives projector, sound, lights |
| Proxy | Direct access to heavy/protected object | Image shows placeholder, loads real one on demand; cache shown |
| Observer | Tight coupling when one change must notify many | Subscribe/unsubscribe; publisher notifies subscribers |
| Strategy | Large if/else for algorithm selection | Delivery price changes with selected strategy |
| Command | No undo/queue for operations | Text editor with history, Undo/Redo |
| State | Behavior depends on status via giant if-chains | Order flow; only allowed buttons are active per state |
| Iterator | Traverse a collection without exposing its structure | List, tree, graph traversed with the same `next()` |

## File structure

```
designpatterns/
├── index.html
├── css/style.css
├── js/
│   ├── app.js        # navigation, language + code-language switching
│   ├── i18n.js       # UI strings
│   └── render.js     # builds a pattern page from its data
├── patterns/
│   ├── observer.js
│   ├── strategy.js
│   └── ...           # one file per pattern
└── tests/validate.html
```

Each pattern file exports one object: name, category, `az`/`en` text (problem, solution, where used, when not to use), SVG diagram, animation `mount(container)` function, and `code.bad` / `code.good` each with `cpp`, `java`, `js`, `php`. Adding a pattern = one new file plus one registry entry.

## Page layout

- **Left panel:** pattern list grouped by category, with search. Collapses to a menu on mobile.
- **Top bar:** AZ | EN toggle, C++ | Java | JS | PHP toggle, light/dark theme.
- **Pattern page, top to bottom:** title + one-line summary; problem (real-life example); bad code beside good code; diagram, then interactive animation; where it is used; when not to use it.
- Selected languages and theme persist in the URL hash and `localStorage`.

## Error handling

- Missing translation: fall back to EN, log a console warning.
- Missing code snippet for selected language: show "No example in this language yet" and offer JS.
- Animation throws: wrapped in try/catch, that block shows "Animation failed to load", rest of page works.
- Unknown `#hash`: redirect to first pattern.
- `localStorage` blocked: settings not remembered, site works normally.
- Prism.js CDN fails: code shown as plain `<pre>`.

## Accessibility

Real `<button>` elements, visible focus, `prefers-reduced-motion` simplifies animations, diagrams carry `aria-label`.

## Testing

- `tests/validate.html`: checks every pattern has AZ + EN text, `bad`/`good` code in all 4 languages, a diagram, and an animation; highlights gaps in red.
- Animation logic (e.g. Observer subscribe/notify, Command undo/redo) is written as pure functions separate from DOM and checked with simple `assert`s in the browser console.
- Manual checklist per pattern: language switch, theme, mobile layout, keyboard navigation, buttons work.
- After each build phase, open in Chrome and check screenshots and console errors.

## Build phases

1. Skeleton: `index.html`, theme, side panel, AZ/EN and code-language switches, `render.js`, `validate.html`.
2. Prototype: Observer and Strategy fully done (text, diagram, animation, code in 4 languages). Review the format with the user before continuing.
3. Creational: Singleton, Factory Method, Builder.
4. Structural: Adapter, Decorator, Facade, Proxy.
5. Behavioral: Command, State, Iterator.
6. Polish: mobile, search, final `validate.html` pass, README.

## Out of scope

User accounts, backend, running code in the browser, quiz mode. Rarer patterns (Abstract Factory, Visitor, Mediator, etc.) can be added later.
