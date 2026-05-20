# Design Specification: Random Ticket

**Date:** 2026-05-20
**Status:** Draft (Pending User Review)

## 1. Goal & Vision
A web application that generates a random "ticket" to a local destination using Google Maps data. The app focuses on the "surprise and delight" of discovery, wrapped in a high-contrast, editorial aesthetic.

## 2. Core Features
- **Location Discovery:** Manual entry with Google Places Autocomplete or browser GPS.
- **Weighted Randomization:** Fetches local places within a user-defined radius and picks one using a probabilistic weight toward higher-rated locations.
- **Realistic "Tear" Interaction:** A vertical ticket with a horizontal perforation. Users interactively tear the ticket using an SVG-masking technique that follows the cursor with a realistic "paper jitter."
- **Re-pick Capability:** Users can discard a ticket and generate a new one from the pre-fetched results without a new API call.
- **Archive & Memos:** Torn tickets are saved to LocalStorage. Users can view their archive and add personal memos after visiting.

## 3. Aesthetics & UI
- **Editorial Style:** Strictly Times New Roman (headings) and Arial (body/meta).
- **Color Palette:** Grayscale (High-contrast black, white, and subtle grays).
- **Vertical Layout:** Portrait-oriented ticket (approx. 280x450px) with the stub at the bottom.
- **Minimalist:** Heavy use of whitespace and thin borders.

## 4. Architecture
### 4.1 Frontend Components (React)
- `LocationScanner`: Input for location, radius slider, and place category toggles.
- `TicketStage`: Manages the lifecycle of a generated ticket (Display -> Interaction -> Archive).
- `TearableTicket`: The visual core. Handles the SVG mask and mouse/touch events for the realistic tear.
- `ArchiveBook`: Grid/List view of previously torn tickets.
- `MemoEditor`: Interface for adding reflections to archived tickets.

### 4.2 Services & Data
- `GoogleMapsService`:
    - `getAutocompleteSuggestions(input)`
    - `fetchNearbyPlaces(location, radius)`
    - `pickRandomWeighted(places)`: Logic to favor 4.0+ star ratings.
- `StorageService`:
    - `saveToArchive(ticketData)`: Saves ticket metadata + the generated SVG tear path.
    - `getArchive()`
    - `updateMemo(ticketId, text)`

## 5. Technical Implementation: The Realistic Tear
- **SVG Masking:** The ticket is rendered as a single HTML/CSS block. An SVG `mask` is applied to it.
- **Path Tracking:** As the user drags across the perforation line, mouse coordinates are captured.
- **Jitter Logic:** A small random offset (±2px) is added to each coordinate to simulate the rough edge of torn paper.
- **State Transition:** When the path reaches the full width of the ticket, the mask splits the ticket into two separate visual containers. The top part (main ticket) performs an "archiving" animation (e.g., sliding into the archive), while the bottom part (stub) remains in place.

## 6. Success Criteria
- The "Tear" interaction feels fluid and physically satisfying.
- The editorial aesthetic is maintained across all screen sizes.
- weighted randomization consistently provides high-quality local suggestions.
