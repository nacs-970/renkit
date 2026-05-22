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
  
  // Selection Mode State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    if (selectionMode) return; // Don't edit in selection mode
    setEditingId(ticket.id);
    setTempMemo(ticket.memo || '');
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected tickets?`)) {
      StorageService.deleteTickets(Array.from(selectedIds));
      setArchive(StorageService.getArchive());
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleDeleteSingle = (id: string) => {
    if (window.confirm('Delete this ticket?')) {
      StorageService.deleteTickets([id]);
      setArchive(StorageService.getArchive());
      setExpandedId(null);
    }
  };

  const handleTicketClick = (id: string) => {
    if (selectionMode) {
      toggleSelection(id);
    } else {
      setExpandedId(id);
    }
  };

  const expandedTicket = archive.find(t => t.id === expandedId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>The Archive</h2>
          {archive.length > 0 && (
            <button 
              className={`${styles.navButton} ${selectionMode ? styles.activeNav : ''}`}
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedIds(new Set());
              }}
            >
              {selectionMode ? 'Cancel' : 'Select'}
            </button>
          )}
        </div>

        <div className={styles.headerRight}>
          {selectionMode && selectedIds.size > 0 && (
            <button className={styles.deleteButton} onClick={handleDeleteSelected}>
              Delete ({selectedIds.size})
            </button>
          )}
          <button onClick={onClose} className={styles.closeButton}>Return</button>
        </div>
      </header>

      {archive.length === 0 ? (
        <div className={styles.emptyState}>
          No memories collected yet. Collect a ticket to begin.
        </div>
      ) : (
        <div className={styles.grid}>
          {archive.map((ticket, index) => {
            const isSelected = selectedIds.has(ticket.id);
            return (
              <div 
                key={`${ticket.id}-${ticket.date}`} 
                className={`${styles.gridItem} ${isSelected ? styles.itemSelected : ''}`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div 
                  className={styles.ticketWrapper} 
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <TearableTicket 
                    ticket={{
                      name: ticket.name,
                      address: ticket.address || 'Local discovery',
                      type: ticket.type || 'Experience',
                      distance: ticket.distance || 'Nearby',
                      time: ticket.time
                    }}
                    className={styles.miniTicket}
                    ticketStyle={ticket.style as any || 'classic'}
                  />

                  {selectionMode && (
                    <div className={styles.selectionOverlay}>
                      <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`} />
                    </div>
                  )}
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
            );
          })}
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
                distance: expandedTicket.distance || 'Nearby',
                time: expandedTicket.time
              }}
              ticketStyle={expandedTicket.style as any || 'classic'}
            />
            <div className={styles.lightboxActions}>
              <button 
                className={styles.singleDelete}
                onClick={() => handleDeleteSingle(expandedTicket.id)}
              >
                Delete Ticket
              </button>
              <button className={styles.closeLightbox} onClick={() => setExpandedId(null)}>&times;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
