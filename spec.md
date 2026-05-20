# Project Specification: Random Ticket

## Goal
A web application that generates a random "ticket" to a local place using Google Maps data. The UI features a clean, elegant, editorial style using Times New Roman and Arial fonts. Users can interactively "tear" the ticket to archive it, unlocking the ability to add a personal memo after visiting the location.

## Core Value
The surprise and delight of a random local destination presented as a beautiful, physical-feeling ticket.

## Architecture & Tech Stack
- **Frontend Framework:** React (using Vite for fast build tooling).
- **Testing:** Vitest.
- **Styling:** Vanilla CSS or CSS Modules to strictly control the elegant, editorial typography and layout without heavy framework overhead. with smooth animation
- **Data Source:** Google Maps Places API for place fetching and metadata (name, address, distance, type).
- **Storage:** 
  - Phase 1 & 2: LocalStorage via an abstracted data layer. 
  - Phase 4 (Future): Cloud Database (e.g., Supabase) - the abstraction ensures an easy swap later without rewriting UI logic.

## Core Features & Data Flow

### A. Location & Criteria Input
- **Starting Point:** Users can choose between "Current Location" (browser GPS) or "Manual Entry" (typing a city/zip code).
- **Radius:** A slider to set the search radius distance.
- **Place Types:** Checkboxes/toggles allowing users to specify desired categories (e.g., Food & Drink, Attractions, Everything).

### B. Ticket Generation & Customization
- The app fetches a matching random place from Google Maps using the `searchNearby` endpoint and client-side randomization.
- The place is presented as a visual "Ticket".
- **Visual Styles:** Users can toggle the ticket's aesthetic between different styles (e.g., "Classic Editorial" and "Modern Minimalist").

### C. Interaction & Archiving
- **The Tear:** An interactive UI mechanism where the user clicks or drags to "tear" the ticket stub.
- **Archiving:** Tearing the ticket moves it to an "Archived Tickets" list.
- **Memos:** Within the archive, users can write and save a post-visit memo to reflect on their experience at that place.

## Design Guidelines
- Strictly adhere to Times New Roman and Arial for all typography.
- Emphasize whitespace, thin borders, and high contrast (black and white with minimal accent colors) to achieve the editorial aesthetic.
- Components should be isolated: Storage layer, Map API layer, and UI layer must remain separate to facilitate future cloud migration.
