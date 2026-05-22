import { useState, useEffect } from 'react';
import { LocationScanner } from './components/LocationScanner/LocationScanner';
import { TearableTicket } from './components/TearableTicket/TearableTicket';
import { ArchiveBook } from './components/ArchiveBook/ArchiveBook';
import { Settings } from './components/Settings/Settings';
import { MapsService, pickRandomWeighted, type Place } from './services/maps.service';
import { StorageService } from './services/storage.service';
import './App.css';

function App() {
  const [currentTicket, setCurrentTicket] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'main' | 'archive'>('main');
  const [showToast, setShowToast] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !isSettingsOpen) {
        e.preventDefault();
        setView(prev => prev === 'main' ? 'archive' : 'main');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

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

  const handleArchive = () => {
    if (!currentTicket || isArchiving) return;
    
    setIsArchiving(true);
    
    // Animate archiving (slide into mail slot)
    setTimeout(() => {
      StorageService.saveToArchive({
        id: currentTicket.id,
        name: currentTicket.name,
        tearPath: ''
      });
      
      setCurrentTicket(null);
      setIsArchiving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  return (
    <div className="app-container">
      {showToast && <div className="toast">Ticket Archived</div>}
      
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="top-nav">
        <button className="nav-button" onClick={() => setView(view === 'main' ? 'archive' : 'main')}>
          {view === 'main' ? '📜 Archive' : '🎫 Generator'}
        </button>
        <button className="nav-button" onClick={() => setIsSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </div>

      <main>
        {view === 'archive' ? (
          <ArchiveBook onClose={() => setView('main')} />
        ) : (
          <>
            {!currentTicket && !isGenerating && (
              <div className="welcome-screen">
                <h1 className="logo-text">Renkit</h1>
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
                <div className="mail-system">
                  {isArchiving ? (
                    <div className="mail-slot" />
                  ) : (
                    <div className="tear-hint">Tap to Collect</div>
                  )}
                  
                  <TearableTicket 
                    ticket={{
                      name: currentTicket.name,
                      address: currentTicket.address || 'Local discovery',
                      type: currentTicket.type || 'Experience',
                      distance: currentTicket.distance || 'Nearby'
                    }} 
                    onClick={handleArchive}
                    className={isArchiving ? 'archiving' : ''}
                  />
                </div>

                {!isArchiving && (
                  <div className="stage-actions">
                    <button onClick={handleRepick} className="secondary-button">
                      Get Another Option
                    </button>
                    <button onClick={() => setCurrentTicket(null)} className="secondary-button">
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
