// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves an archived ticket with a unique ID', () => {
    const ticket = { id: 'abc', name: 'Test Place', time: '10:00 AM' };
    StorageService.saveToArchive(ticket);
    const archive = StorageService.getArchive();
    expect(archive).toHaveLength(1);
    // The ID should now start with 'abc-' followed by a timestamp
    expect(archive[0].id).toMatch(/^abc-/);
    expect(archive[0].date).toBeDefined();
  });

  it('updates a memo for an existing ticket', () => {
    const ticket = { id: '123', name: 'Place', time: '10:00 AM' };
    StorageService.saveToArchive(ticket);
    const archiveBefore = StorageService.getArchive();
    const uniqueId = archiveBefore[0].id;
    
    StorageService.updateMemo(uniqueId, 'Great coffee!');
    const archiveAfter = StorageService.getArchive();
    expect(archiveAfter[0].memo).toBe('Great coffee!');
  });
});
