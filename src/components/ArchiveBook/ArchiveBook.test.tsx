import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchiveBook } from './ArchiveBook';
import { StorageService } from '../../services/storage.service';

vi.mock('../../services/storage.service', () => ({
  StorageService: {
    getArchive: vi.fn(),
    updateMemo: vi.fn(),
    deleteTickets: vi.fn(),
  },
}));

const mockArchive = [
  {
    id: '1',
    name: 'Ticket 1',
    address: 'Address 1',
    type: 'Type 1',
    time: '12:00',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ticket 2',
    address: 'Address 2',
    type: 'Type 2',
    time: '13:00',
    date: new Date().toISOString(),
  },
];

describe('ArchiveBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (StorageService.getArchive as any).mockReturnValue(mockArchive);
  });

  it('reproduces selection bug: click should select and stay selected', () => {
    render(<ArchiveBook onClose={() => {}} downloadQuality={2} />);
    
    // Enter selection mode
    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);

    // Find first ticket
    const gridItem1 = document.querySelector('[data-id="1"]');
    expect(gridItem1).toBeTruthy();
    const ticket1 = gridItem1?.querySelector('div'); // The ticketWrapper
    expect(ticket1).toBeTruthy();

    // Mock getBoundingClientRect for grid and items
    const gridElement = document.querySelector('[class*="grid"]');
    expect(gridElement).toBeTruthy();

    vi.spyOn(gridElement!, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 1000, height: 1000,
    } as any);
    vi.spyOn(gridItem1!, 'getBoundingClientRect').mockReturnValue({
      left: 5, top: 5, right: 15, bottom: 15, width: 10, height: 10
    } as any);
    
    // Check if it's selected in the UI
    // Since we don't know the exact class name, we check if ANY class containing "itemSelected" is present
    const hasSelectedClass = (el: Element | null) => 
      Array.from(el?.classList || []).some(cls => cls.includes('itemSelected'));
    
    // --- Case 1: Click with jitter (1px movement) ---
    fireEvent.mouseDown(gridElement!, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(gridElement!, { clientX: 11, clientY: 11 }); // 1px move
    
    // Should NOT be selected yet because < 5px threshold
    expect(hasSelectedClass(gridItem1)).toBe(false);

    fireEvent.mouseUp(gridElement!);
    fireEvent.click(ticket1!); // The actual click

    // Should BE selected now
    expect(hasSelectedClass(gridItem1)).toBe(true);

    // --- Case 2: Real drag (10px movement) ---
    // First, unselect it so we start fresh
    fireEvent.click(ticket1!);
    expect(hasSelectedClass(gridItem1)).toBe(false);

    fireEvent.mouseDown(gridElement!, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(gridElement!, { clientX: 20, clientY: 20 }); // ~14px move
    
    // Should BE selected by drag
    expect(hasSelectedClass(gridItem1)).toBe(true);

    fireEvent.mouseUp(gridElement!);
    fireEvent.click(ticket1!); // Click event that follows mouseUp

    // Should STILL be selected (click should have been ignored)
    expect(hasSelectedClass(gridItem1)).toBe(true);
  });
});
