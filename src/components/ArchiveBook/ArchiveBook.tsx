import { useState, useEffect } from 'react';
import { StorageService, type ArchivedTicket } from '../../services/storage.service';
import { TearableTicket } from '../TearableTicket/TearableTicket';
import styles from './ArchiveBook.module.css';

interface Props {
  onClose: () => void;
}

export const ArchiveBook = ({ onClose }: Props) => {
  const [archive, setArchive] = useState<ArchivedTicket[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempMemo, setTempMemo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setArchive(StorageService.getArchive());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedId) {
        setExpandedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedId]);

  const handleSaveMemo = (id: string) => {
    StorageService.updateMemo(id, tempMemo);
    setArchive(StorageService.getArchive());
    setEditingId(null);
  };

  const startEditing = (ticket: ArchivedTicket) => {
    setEditingId(ticket.id);
    setTempMemo(ticket.memo || '');
  };

  const expandedTicket = archive.find(t => t.id === expandedId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>The Archive</h2>
        <button onClick={onClose} className={styles.closeButton}>Return</button>
      </header>

      {archive.length === 0 ? (
        <div className={styles.emptyState}>
          No memories collected yet. Collect a ticket to begin.
        </div>
      ) : (
        <div className={styles.grid}>
          {archive.map((ticket, index) => (
            <div 
              key={`${ticket.id}-${ticket.date}`} 
              className={styles.gridItem}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className={styles.ticketWrapper} onClick={() => setExpandedId(ticket.id)}>
                <TearableTicket 
                  ticket={{
                    name: ticket.name,
                    address: ticket.address || 'Local discovery',
                    type: ticket.type || 'Experience',
                    distance: ticket.distance || 'Nearby'
                  }}
                  className={styles.miniTicket}
                  ticketStyle={ticket.style as any || 'classic'}
                />
              </div>
              
              <div className={styles.ticketInfo}>
                <span className={styles.date}>
                  {new Date(ticket.date).toLocaleDateString()}
                </span>

                {editingId === ticket.id ? (
                  <div className={styles.editArea}>
                    <textarea
                      className={styles.memoInput}
                      value={tempMemo}
                      onChange={(e) => setTempMemo(e.target.value)}
                      placeholder="Write a memory..."
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSaveMemo(ticket.id)}
                      className={styles.saveButton}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div onClick={() => startEditing(ticket)} className={styles.memoDisplay}>
                    {ticket.memo ? (
                      <p className={styles.memoText}>{ticket.memo}</p>
                    ) : (
                      <p className={styles.memoPlaceholder}>+ Add memory</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {expandedId && expandedTicket && (
        <div className={styles.lightboxOverlay} onClick={() => setExpandedId(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <TearableTicket 
              ticket={{
                name: expandedTicket.name,
                address: expandedTicket.address || 'Local discovery',
                type: expandedTicket.type || 'Experience',
                distance: expandedTicket.distance || 'Nearby'
              }}
              ticketStyle={expandedTicket.style as any || 'classic'}
            />
            <button className={styles.closeLightbox} onClick={() => setExpandedId(null)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};
