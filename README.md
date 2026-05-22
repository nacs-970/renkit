# Renkit

**Renkit** is a minimalist, aesthetic local discovery service that helps you "Go somewhere." Discover hidden gems, cafes, and experiences nearby with a satisfying, tactile digital experience.

## ✨ Features

- **Local Discovery**: Powered by Photon OSM (OpenStreetMap), finding nearby points of interest based on your location.
- **Dynamic Tickets**: Tickets grow to fit long names and show metadata like distance, type, and collection time.
- **Tactile Interactions**:
  - **Mail-Slot Archive**: Tickets slide into a sharp mailbox slot to be saved.
  - **Print-Out Animation**: New discoveries "print out" from the slot like a receipt.
- **Customizable Experience**:
  - **Styles**: Choose between **Classic** (Serif), **Modern** (Sans-serif), and **Mono** (Brutalist).
  - **Branding**: Dynamic accent color selector (try `#AFE876` for the signature look).
  - **Themes**: Full support for Light and Dark modes.
- **Archive Grid**: Browse your collection in a staggered responsive grid with unique entry persistence and memo support.
- **Keyboard Power**: Navigate and manage your tickets entirely via shortcuts.

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Tab** | Switch between Generator and Archive |
| **Space** | Get Another Option (Repick) |
| **Enter** | Archive current ticket |
| **Esc** | Start over / Close Settings / Cancel Selection |
| **Backspace/Del** | Delete selected ticket(s) in Archive |

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules (Vanilla CSS)
- **API**: Photon OSM (OpenStreetMap)
- **State**: Local Storage for persistent archive
- **Testing**: Vitest

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## 📝 Project Structure

- `src/components/TearableTicket`: The core ticket component with dynamic scaling and styles.
- `src/components/ArchiveBook`: The grid-based gallery for collected tickets.
- `src/components/LocationScanner`: Location entry and radius control.
- `src/components/Settings`: Global preferences and appearance customization.
- `src/services`: Maps integration and LocalStorage management.

---

*Go somewhere.*
