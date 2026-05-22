import { useState, useEffect } from 'react';
import { LocationScanner } from './components/LocationScanner/LocationScanner';
import { TearableTicket } from './components/TearableTicket/TearableTicket';
import { ArchiveBook } from './components/ArchiveBook/ArchiveBook';
import { MapsService, pickRandomWeighted, type Place } from './services/maps.service';
import { StorageService } from './services/storage.service';
import './App.css';

function App() {
  const [currentTicket, setCurrentTicket] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'main' | 'archive'>('main');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
    }
  };

  return (
    <div className="app-container">
      <div className="top-nav">
        <button className="nav-button" onClick={() => setView(view === 'main' ? 'archive' : 'main')}>
          {view === 'main' ? '📜 Archive' : '🎫 Generator'}
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <main>
        {view === 'archive' ? (
          <ArchiveBook onClose={() => setView('main')} />
        ) : (
          <>
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
                    address: currentTicket.address || 'Local discovery',
                    type: currentTicket.type || 'Experience',
                    distance: currentTicket.distance || 'Nearby'
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;
