import { useState } from 'react';
import { LocationScanner } from './components/LocationScanner/LocationScanner';
import { TearableTicket } from './components/TearableTicket/TearableTicket';
import { MapsService, pickRandomWeighted, type Place } from './services/maps.service';
import { StorageService } from './services/storage.service';
import './App.css';

function App() {
  const [currentTicket, setCurrentTicket] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (location: string, radius: number) => {
    setIsGenerating(true);
    try {
      const results = await MapsService.fetchNearbyPlaces(location, radius);
      setPlaces(results);
      const chosen = pickRandomWeighted(results);
      setCurrentTicket(chosen);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRepick = () => {
    if (places.length > 0) {
      const chosen = pickRandomWeighted(places);
      setCurrentTicket(chosen);
    }
  };

  const handleTearComplete = (tearPath: string) => {
    if (currentTicket) {
      StorageService.saveToArchive({
        id: currentTicket.id,
        name: currentTicket.name,
        tearPath: tearPath
      });
      console.log('Ticket archived!');
    }
  };

  return (
    <div className="app-container">
      <main>
        {!currentTicket && !isGenerating && (
          <div className="welcome-screen">
            <h1 className="logo-text">Random Ticket</h1>
            <p className="intro-text">Discover your next local destination with a simple tear.</p>
            <LocationScanner onGenerate={handleGenerate} />
          </div>
        )}

        {isGenerating && (
          <div className="loading-screen">
            <p>Scanning local discovery options...</p>
          </div>
        )}

        {currentTicket && (
          <div className="ticket-stage">
            <TearableTicket 
              ticket={{
                name: currentTicket.name,
                address: '124 Baker St, London', // Mocked for now
                type: 'Cafe & Culture', // Mocked for now
                distance: '1.2 km' // Mocked for now
              }} 
              onTearComplete={handleTearComplete}
            />
            <div className="stage-actions">
              <button onClick={handleRepick} className="secondary-button">
                Get Another Option
              </button>
              <button onClick={() => setCurrentTicket(null)} className="secondary-button">
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
