# Pokémon Card Collection

A React Native (Expo) app for tracking Pokémon card collections across multiple collectors. Built for families — parents can manage each child's collection independently, search cards via the [TCGdex API](https://tcgdex.dev), and view cards in an interactive 3D holographic viewer.

<p align="center">
  <img src="assets/icon.png" alt="App Icon" width="120" />
</p>

---

## Features

- **Multi-Collector Support** — Each child gets their own profile with custom avatar colors and independent card counts. The same card can belong to multiple children (many-to-many ownership via the `collection` join table).

- **Card Search & Assignment** — Search the full TCGdex database by card name. Tap any result to assign it to one or more collectors via a bottom sheet. Each child's row shows independent ownership — adding a card to Child B never affects Child A.

- **3D Holographic Card Viewer** — Tap a card in a collection to open a fullscreen viewer with real-time 3D tilt driven by finger pan gestures, spring-back physics, and idle auto-rotate. Five Skia shader layers (base, rainbow shine, radial glare, grain texture, glitter) with blend modes (Color Dodge, Overlay) create the holographic effect.

- **Data Management** — A dedicated tab with three tools:
  - **Reset Database** — Wipes all children, cards, and collection entries after a confirmation dialog.
  - **Export to JSON** — Serializes the full database to a structured JSON file (`children`, `cards`, `collection` arrays with an `exported_at` timestamp) and opens the native share sheet.
  - **Import from JSON** — Opens the system file picker filtered to `.json`, validates structure, and bulk-inserts with `INSERT OR IGNORE` to skip duplicates. Shows a result summary of how many rows were imported.

- **Local SQLite Database** — All collections, children, and cards stored on-device with WAL mode and foreign keys. Schema migrations run automatically on app start to keep existing databases up-to-date.

- **Offline-First** — Card data is cached locally in SQLite. Only the Search tab requires an internet connection (TCGdex API).

- **OCR Card Scanning** — *(In progress)* Camera-based card scanning using `react-native-vision-camera` with the TCGdex OCR matching pipeline.

---

## Navigation

Three bottom tabs:

| Tab | Label | Screen | Description |
|-----|-------|--------|-------------|
| 🏠 | Collectors | HomeScreen | List of children, tap to view their card collection |
| 🔍 | Search | SearchScreen | Search TCGdex API by card name, assign to children |
| ⚙ | Data | DataManagementScreen | Reset, export, and import database |

The **Collectors** tab has a stack navigator for drill-down: Collection detail and Manage Collectors. The **Add Collector** screen is a full-screen modal accessible from both Collectors and Data tabs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) |
| UI | React Native 0.85, React Navigation 7 |
| Graphics | [React Native Skia 2.6](https://shopify.github.io/react-native-skia/) |
| Animations | React Native Reanimated 4, Gesture Handler 2 |
| State | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Database | [expo-sqlite](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/) (SQLite) |
| File I/O | expo-file-system (v56 File API + legacy read/write) |
| Sharing | expo-sharing |
| Images | [expo-image](https://docs.expo.dev/versions/v56.0.0/sdk/image/) |
| Card Data | [TCGdex API](https://api.tcgdex.net/) (no API key required) |
| Camera | `react-native-vision-camera` 4 |

---

## Project Structure

```
src/
├── components/
│   ├── cards/           # CardGridItem, CollectionGrid, HoloCardViewer, CardSearchBar
│   ├── children/        # ChildAvatar, ChildProfileCard, ChildSelector
│   ├── common/          # Button, ConfirmDialog, EmptyState, ErrorBoundary, LoadingOverlay
│   ├── search/          # SearchResultsGrid, CardAssignSheet
│   └── skia/            # Skia-themed UI primitives (Button, Card, Avatar, BottomSheet, etc.)
├── core/                # App entry, Navigation (3-tab + stacks), Providers, Skia fonts
├── database/            # SQLite init, migrations, CRUD, dataManagement (export/import/reset)
├── hooks/               # useCards, useDebounce, useCardLookup, useImagePreloader
├── screens/             # Home, Collection, Search, AddChild, ManageChildren, DataManagement
├── services/            # tcgdexApi (search, OCR matching), ocrParser, setMatcher
├── store/               # Zustand stores (useAppStore, useChildrenStore, useCollectionStore)
├── theme/               # Color tokens, spacing, font sizes, shadows, animation presets
├── types/               # TypeScript types for API responses, DB rows, cards, children
└── utils/               # Colors, formatting, validation, constants
```

---

## Database Schema

### `children`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key |
| `name` | TEXT | Display name |
| `color` | TEXT | Hex color for avatar |
| `avatar_emoji` | TEXT | Optional emoji |
| `created_at` | TEXT | ISO timestamp |

### `cards`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key |
| `tcgdex_id` | TEXT | Unique TCGdex identifier |
| `name` | TEXT | Card name |
| `set_name` | TEXT | Expansion set name |
| `set_id` | TEXT | Expansion set identifier |
| `edition` | TEXT | Edition (default: `unlimited`) |
| `image_url` | TEXT | TCGdex high-res image URL |
| `card_type` | TEXT | Card category |
| `hp` | TEXT | Hit points |
| `rarity` | TEXT | Card rarity |
| `created_at` | TEXT | ISO timestamp |

Constraints: `UNIQUE(tcgdex_id)`, `UNIQUE(name, tcgdex_id)`

### `collection` (join table)
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER | Primary key |
| `child_id` | INTEGER | FK → children(id) ON DELETE CASCADE |
| `card_id` | INTEGER | FK → cards(id) ON DELETE CASCADE |
| `date_added` | TEXT | ISO timestamp |

Constraint: `UNIQUE(child_id, card_id)` — prevents duplicate assignments while **allowing the same card across different children**. This is the many-to-many design: the same `card_id` can appear in multiple rows as long as each row has a different `child_id`.

### Export JSON format

```json
{
  "exported_at": "2026-05-30T20:00:00.000Z",
  "children": [{ "id": 1, "name": "Ash", "color": "#FFD700", ... }],
  "cards": [{ "id": 1, "tcgdex_id": "swsh3-1", "name": "Charizard VMAX", ... }],
  "collection": [{ "id": 1, "child_id": 1, "card_id": 1, ... }]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for cloud builds)
- macOS: Xcode 16+ | Android: Android Studio (for local builds)

### Install

```bash
git clone <repo-url>
cd PokemonCardCollection
npm install
```

### Run on iOS Simulator

```bash
npx expo run:ios
```

> **Note:** This project uses `expo-dev-client` with native modules (Skia, Reanimated, Vision Camera). It requires a development build — it will not run in Expo Go.

If `pod install` fails with `Missing required attribute 'source'`, the prebuilt React Native tarball paths need to be disabled. The file `ios/.xcode.env.local` already exports the required flags:

```bash
export RCT_USE_RN_DEP=0
export RCT_USE_PREBUILT_RNCORE=0
export EXPO_USE_PRECOMPILED_MODULES=0
```

If you need to run `pod install` manually:

```bash
cd ios && RCT_USE_RN_DEP=0 RCT_USE_PREBUILT_RNCORE=0 EXPO_USE_PRECOMPILED_MODULES=0 pod install
```

### Run on Android Emulator

```bash
npx expo run:android
```

---

## Build & Distribution

### EAS Build Profiles (`eas.json`)

| Profile | Platform | Output |
|---------|----------|--------|
| `preview` | Android | APK (direct install) |
| `preview` | iOS | IPA (ad-hoc) |
| `release` | Android | AAB (Play Store) |
| `release` | iOS | IPA (App Store) |

### Build APK (Android)

```bash
npx eas build --platform android --profile preview
```

### Build for iOS

```bash
npx eas build --platform ios --profile preview
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Build and run on connected Android device / emulator |
| `npm run ios` | Build and run on iOS simulator |
| `npm run web` | Start web version (experimental) |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~56.0.0 | Framework |
| `react-native` | 0.85.3 | UI runtime |
| `@shopify/react-native-skia` | 2.6.2 | 2D graphics / shaders |
| `react-native-reanimated` | ~4.3.1 | UI-thread animations |
| `react-native-gesture-handler` | ~2.31.1 | Touch gesture system |
| `@react-navigation/native` | ^7.2.5 | Navigation (stack + tabs) |
| `expo-sqlite` | ~56.0.4 | Local SQLite database |
| `expo-file-system` | ^56.0.7 | File read/write + document picker |
| `expo-sharing` | ~56.0.0 | Native share sheet |
| `expo-image` | ~56.0.9 | Optimized image loading |
| `expo-document-picker` | — | System file picker (import) |
| `zustand` | ^5.0.14 | State management |
| `react-native-vision-camera` | ^4.6.0 | Camera / OCR scanning |
| `expo-dev-client` | ^56.0.18 | Development builds |

---

## License

MIT
