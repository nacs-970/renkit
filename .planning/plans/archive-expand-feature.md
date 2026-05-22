# Plan: Add Expand Feature to Archive Tab

## Objective
Enable users to view archived tickets in full detail by clicking on them in the grid.

## Proposed Changes

### 1. Update `ArchiveBook.tsx`
- Add `expandedTicketId` state.
- Implement `handleExpand` and `handleCloseExpand` functions.
- Wrap `TearableTicket` in the grid with a clickable container.
- Render a `Lightbox` overlay when `expandedTicketId` is set.
- Pass the selected ticket data to the lightbox.

### 2. Update `ArchiveBook.module.css`
- Add styles for `.lightboxOverlay`:
  - `fixed`, `top: 0`, `left: 0`, `width/height: 100%`.
  - `background: rgba(0, 0, 0, 0.8)`.
  - `display: flex`, `justify-content/align-items: center`.
  - `z-index: 2000`.
- Add styles for `.lightboxContent`:
  - `background: var(--bg)`.
  - `padding: 40px`.
  - `position: relative`.
  - `animation: scaleUp 0.3s ease-out`.
- Add `.closeLightbox` button styles.

## Verification
- Click a ticket in the archive grid -> Lightbox opens with full-size ticket.
- Click the 'X' or outside the ticket -> Lightbox closes.
- Verify staggered entrance animation still works.
- Verify memo editing still works and is not triggered when clicking the ticket to expand.
