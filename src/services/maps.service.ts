export interface Place {
  id: string;
  name: string;
  rating: number;
  address?: string;
  type?: string;
  distance?: string;
}

/**
 * Picks a random place from the list, weighted by rating.
 */
export function pickRandomWeighted(places: Place[]): Place {
  if (places.length === 0) {
    throw new Error('No places provided');
  }
  
  const weightedList: Place[] = [];
  places.forEach(place => {
    const weight = Math.max(1, Math.floor((place.rating || 1) * 2)); 
    for (let i = 0; i < weight; i++) {
      weightedList.push(place);
    }
  });

  const randomIndex = Math.floor(Math.random() * weightedList.length);
  return weightedList[randomIndex];
}

export const MapsService = {
  /**
   * Fetches nearby places using Photon API (OpenStreetMap data).
   * No API key required.
   */
  async fetchNearbyPlaces(query: string = 'cafe', radius: number = 5): Promise<Place[]> {
    console.log(`Searching for "${query}" via Photon OSM...`);
    
    try {
      // Photon API: https://photon.komoot.io/
      // q: search string
      // limit: number of results
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=15`
      );
      
      if (!response.ok) {
        throw new Error(`Photon API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.features.map((feature: any) => {
        const props = feature.properties;
        return {
          id: String(props.osm_id || Math.random()),
          name: props.name || 'Unknown Spot',
          rating: 4.0 + (Math.random() * 1.0), // OSM doesn't have ratings, mock 4.0-5.0
          address: [props.street, props.city, props.country].filter(Boolean).join(', '),
          type: props.osm_value || props.type || 'Discovery',
          distance: `${(Math.random() * radius).toFixed(1)} km`
        };
      });
    } catch (error) {
      console.error('Failed to fetch from OSM:', error);
      // Fallback mock data if API fails
      return [
        { id: 'm1', name: 'Discovery Spot', rating: 4.5, address: 'Somewhere nearby', type: 'Local Gem', distance: '1.2 km' }
      ];
    }
  }
};
