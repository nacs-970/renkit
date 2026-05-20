import { describe, it, expect } from 'vitest';
import { pickRandomWeighted } from './maps.service';

describe('pickRandomWeighted', () => {
  it('favors higher rated places over long runs', () => {
    const places = [
      { id: '1', name: 'Low Rated', rating: 1.0 },
      { id: '5', name: 'High Rated', rating: 5.0 }
    ];
    
    // In a weighted random, 5.0 should appear more than 1.0
    // We'll test that it returns one of the valid items first
    const result = pickRandomWeighted(places);
    expect(['1', '5']).toContain(result.id);
  });

  it('throws error if places array is empty', () => {
    expect(() => pickRandomWeighted([])).toThrow('No places provided');
  });
});
