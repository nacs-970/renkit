// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves an archived ticket', () => {
    const ticket = { id: 'abc', name: 'Test Place', time: '10:00 AM' };
    StorageService.saveToArchive(ticket);
    const archive = StorageService.getArchive();
    expect(archive).toHaveLength(1);
    expect(archive[0].id).toBe('abc');
    expect(archive[0].date).toBeDefined();
  });

  it('updates a memo for an existing ticket', () => {
    const ticket = { id: '123', name: 'Place', time: '10:00 AM' };
    StorageService.saveToArchive(ticket);
    StorageService.updateMemo('123', 'Great coffee!');
    const archive = StorageService.getArchive();
    expect(archive[0].memo).toBe('Great coffee!');
  });
});
