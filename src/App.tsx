import { useState, useEffect } from 'react';
import { LocationScanner } from './components/LocationScanner/LocationScanner';
import { TearableTicket, type TicketStyle } from './components/TearableTicket/TearableTicket';
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [ticketKey, setTicketKey] = useState(0);
  const [ticketStyle, setTicketStyle] = useState<TicketStyle>('classic');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }

      if (isSettingsOpen) return;

      // Tab: Switch View
      if (e.key === 'Tab') {
        e.preventDefault();
        setView(prev => prev === 'main' ? 'archive' : 'main');
      }

      // Only shortcut when in Generator view and ticket exists
      if (view === 'main' && currentTicket && !isArchiving && !isPrinting) {
        if (e.key === ' ') {
          e.preventDefault();
          handleRepick();
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleArchive();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setCurrentTicket(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, view, currentTicket, isArchiving, isPrinting]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = async (location: string, radius: number) => {
    setIsGenerating(true);
    try {
      const results = await MapsService.fetchNearbyPlaces(location, radius);
      setPlaces(results);
      const chosen = pickRandomWeighted(results);
      triggerPrint(chosen);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRepick = () => {
    if (places.length > 0) {
      const chosen = pickRandomWeighted(places);
      triggerPrint(chosen);
    }
  };

  const triggerPrint = (ticket: Place) => {
    setCurrentTicket(ticket);
    setTicketKey(Date.now());
    setIsPrinting(true);
    setTimeout(() => setIsPrinting(false), 800);
  };

  const handleArchive = () => {
    if (!currentTicket || isArchiving || isPrinting) return;
    
    setIsArchiving(true);
    
    const timeString = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: timeFormat === '12h' 
    });

    // Animate archiving (slide into mail slot)
    setTimeout(() => {
      StorageService.saveToArchive({
        id: currentTicket.id,
        name: currentTicket.name,
        address: currentTicket.address || 'Local discovery',
        type: currentTicket.type || 'Experience',
        distance: currentTicket.distance || 'Nearby',
        style: ticketStyle,
        time: timeString
      });
      
      setCurrentTicket(null);
      setIsArchiving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  return (
    <div className={`app-container ${view === 'archive' ? 'archive-view' : ''}`}>
      {showToast && <div className="toast">Ticket Archived</div>}
      
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme}
        onToggleTheme={toggleTheme}
        ticketStyle={ticketStyle}
        onSetTicketStyle={setTicketStyle}
        timeFormat={timeFormat}
        onToggleTimeFormat={() => setTimeFormat(prev => prev === '12h' ? '24h' : '12h')}
      />

      <div className="top-nav">
        <button className="nav-button" onClick={() => setView(view === 'main' ? 'archive' : 'main')}>
          {view === 'main' ? '📜 Archive' : '🎫 Generator'}
        </button>
        <button className="nav-button" onClick={() => setIsSettingsOpen(true)}>
          ⚙️ Settings
        </button>
      </div>

      <main className={view === 'archive' ? 'wide' : ''}>
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
                  {(isArchiving || isPrinting) ? (
                    <div className="mail-slot" />
                  ) : (
                    <div className="tear-hint">Tap to Collect</div>
                  )}
                  
                  <TearableTicket 
                    key={isPrinting ? `${currentTicket.id}-${Date.now()}` : `${currentTicket.id}-${ticketKey}`}
                    ticket={{
                      name: currentTicket.name,
                      address: currentTicket.address || 'Local discovery',
                      type: currentTicket.type || 'Experience',
                      distance: currentTicket.distance || 'Nearby',
                      time: new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: timeFormat === '12h' 
                      })
                    }} 
                    onClick={handleArchive}
                    className={`${isArchiving ? 'archiving' : ''} ${isPrinting ? 'printing' : ''}`}
                    ticketStyle={ticketStyle}
                  />
                </div>

                {!isArchiving && !isPrinting && (
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
