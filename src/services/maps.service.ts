export interface Place {
  id: string;
  name: string;
  rating: number;
}

/**
 * Picks a random place from the list, weighted by rating.
 * Higher rated places have a higher probability of being chosen.
 */
export function pickRandomWeighted(places: Place[]): Place {
  if (places.length === 0) {
    throw new Error('No places provided');
  }
  
  // Weights: rating^2 to emphasize higher quality.
  // Using Math.floor(rating * 2) as per plan to keep it simple but effective.
  const weightedList: Place[] = [];
  places.forEach(place => {
    // Ensure we have at least a weight of 1 even for low ratings
    const weight = Math.max(1, Math.floor((place.rating || 1) * 2)); 
    for (let i = 0; i < weight; i++) {
      weightedList.push(place);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  return weightedList[randomIndex];
}
