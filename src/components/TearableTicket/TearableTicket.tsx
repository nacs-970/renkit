import { useState, useRef, useEffect } from 'react';
import styles from './TearableTicket.module.css';

interface Props {
  ticket: {
    name: string;
    address: string;
    type: string;
    distance: string;
  };
  onTearComplete?: (tearPath: string) => void;
}

export const TearableTicket = ({ ticket, onTearComplete }: Props) => {
  const [isTearing, setIsTearing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [path, setPath] = useState<string>('');
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const maskId = useRef(`ticket-mask-${Math.random().toString(36).substr(2, 9)}`);

  const PERFORATION_Y = 370; // Position of the dashed line from the top
  const TICKET_WIDTH = 280;

  useEffect(() => {
    if (points.length > 0) {
      const pathData = points.reduce((acc, p, i) => {
        return acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`);
      }, '');
      setPath(pathData);

      // Check for completion
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      if (maxX - minX >= TICKET_WIDTH - 10 && !isComplete) {
        setIsComplete(true);
        setIsTearing(false);
        onTearComplete?.(pathData);
      }
    }
  }, [points, isComplete, onTearComplete]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isComplete) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Only start tearing if near the perforation line
    if (Math.abs(y - PERFORATION_Y) < 30) {
      setIsTearing(true);
      setPoints([{ x, y: PERFORATION_Y + (Math.random() * 4 - 2) }]);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTearing || isComplete) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    const x = clientX - rect.left;
    const jitter = Math.random() * 4 - 2;
    const y = PERFORATION_Y + jitter;

    // Add point if it's far enough from the last one or covers new ground
    setPoints(prev => {
      const last = prev[prev.length - 1];
      if (Math.abs(x - last.x) > 2) {
        return [...prev, { x, y }].sort((a, b) => a.x - b.x);
      }
      return prev;
    });
  };

  const handleEnd = () => {
    setIsTearing(false);
  };

  return (
    <div 
      className={`${styles.wrapper} ${isComplete ? styles.completed : ''}`}
      ref={containerRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <mask id={maskId.current}>
            {/* Top part mask */}
            <rect x="0" y="0" width="280" height="450" fill="white" />
            {path && (
              <path 
                d={`${path} L${TICKET_WIDTH},450 L0,450 Z`} 
                fill="black" 
              />
            )}
          </mask>
          <mask id={`${maskId.current}-stub`}>
            {/* Bottom part mask */}
            <rect x="0" y="0" width="280" height="450" fill="black" />
            {path && (
              <path 
                d={`${path} L${TICKET_WIDTH},450 L0,450 Z`} 
                fill="white" 
              />
            )}
          </mask>
        </defs>
      </svg>

      <div className={styles.ticketLayer} style={{ maskImage: `url(#${maskId.current})`, WebkitMaskImage: `url(#${maskId.current})` }}>
        <div className={styles.container}>
          <div className={styles.main}>
            <header className={styles.header}>
              <h1>Random Ticket</h1>
              <span className={styles.tagline}>LOCAL DISCOVERY SERVICE</span>
            </header>
            <section className={styles.content}>
              <div className={styles.label}>Destination</div>
              <h2 className={styles.destinationName}>{ticket.name}</h2>
              <p className={styles.address}>{ticket.address}</p>
            </section>
            <footer className={styles.footer}>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>Distance</span>
                <p className={styles.metaValue}>{ticket.distance}</p>
              </div>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>Type</span>
                <p className={styles.metaValue}>{ticket.type}</p>
              </div>
            </footer>
          </div>
          <div className={styles.perforation}></div>
        </div>
      </div>

      <div className={styles.stubLayer} style={{ maskImage: `url(#${maskId.current}-stub)`, WebkitMaskImage: `url(#${maskId.current}-stub)` }}>
        <div className={styles.container} style={{ borderTop: 'none', height: 'auto' }}>
           <div style={{ height: '370px' }}></div>
           <div className={styles.stub}>
            <div className={styles.stubContent}>
              <span className={styles.stubLabel}>Archive Stub</span>
              <div className={styles.serialNumber}>NO. 00428</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual tear line while interaction is happening */}
      {isTearing && path && (
        <svg className={styles.tearLineOverlay} width="280" height="450">
          <path d={path} fill="none" stroke="var(--text-h)" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      )}
    </div>
  );
};

