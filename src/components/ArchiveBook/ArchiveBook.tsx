import { useState, useEffect, useRef, useMemo } from 'react';
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
  
  // Drag Selection State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const hasDragged = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setArchive(StorageService.getArchive());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a memo
      if (editingId) return;

      if (e.key === 'Escape') {
        if (expandedId) {
          setExpandedId(null);
        } else if (selectionMode) {
          setSelectionMode(false);
          setSelectedIds(new Set());
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (expandedId) {
          e.preventDefault();
          handleDeleteSingle(expandedId);
        } else if (selectionMode && selectedIds.size > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedId, selectionMode, selectedIds, editingId]);

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
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    
    if (selectionMode) {
      toggleSelection(id);
    } else {
      setExpandedId(id);
    }
  };

  // Drag Selection Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    hasDragged.current = false;
    if (!selectionMode || !gridRef.current) return;
    // Only start drag if clicking the grid background or a wrapper, not buttons
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    const rect = gridRef.current.getBoundingClientRect();
    setDragStart({ 
      x: e.clientX - rect.left + gridRef.current.scrollLeft, 
      y: e.clientY - rect.top + gridRef.current.scrollTop 
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left + gridRef.current.scrollLeft;
    const currentY = e.clientY - rect.top + gridRef.current.scrollTop;

    // Only start "dragging" if moved more than 5px to prevent jitter clicks
    if (!hasDragged.current) {
      const distance = Math.sqrt(
        Math.pow(currentX - dragStart.x, 2) + 
        Math.pow(currentY - dragStart.y, 2)
      );
      if (distance > 5) {
        hasDragged.current = true;
      } else {
        return;
      }
    }

    const left = Math.min(dragStart.x, currentX);
    const top = Math.min(dragStart.y, currentY);
    const width = Math.abs(dragStart.x - currentX);
    const height = Math.abs(dragStart.y - currentY);

    const newRect = { top, left, width, height };
    setDragRect(newRect);

    // Calculate intersections
    const items = gridRef.current.querySelectorAll(`.${styles.gridItem}`);
    const newSelection = new Set<string>();
    
    items.forEach((item) => {
      const itemRect = (item as HTMLElement).getBoundingClientRect();
      const relativeItemRect = {
        top: itemRect.top - rect.top + gridRef.current!.scrollTop,
        left: itemRect.left - rect.left + gridRef.current!.scrollLeft,
        bottom: itemRect.bottom - rect.top + gridRef.current!.scrollTop,
        right: itemRect.right - rect.left + gridRef.current!.scrollLeft
      };

      if (
        newRect.left < relativeItemRect.right &&
        newRect.left + newRect.width > relativeItemRect.left &&
        newRect.top < relativeItemRect.bottom &&
        newRect.top + newRect.height > relativeItemRect.top
      ) {
        const id = (item as HTMLElement).getAttribute('data-id');
        if (id) newSelection.add(id);
      }
    });

    setSelectedIds(newSelection);
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragRect(null);
  };

  const expandedTicket = useMemo(() => 
    archive.find(t => t.id === expandedId),
    [archive, expandedId]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Archive</h2>
        </div>

        <div className={styles.headerRight}>
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
        <div 
          className={styles.grid}
          ref={gridRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ position: 'relative' }}
        >
          {archive.map((ticket, index) => {
            const isSelected = selectedIds.has(ticket.id);
            return (
              <div 
                key={`${ticket.id}-${ticket.date}`} 
                data-id={ticket.id}
                className={`${styles.gridItem} ${isSelected ? styles.itemSelected : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
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

          {dragRect && (
            <div 
              className={styles.dragSelector}
              style={{
                top: dragRect.top,
                left: dragRect.left,
                width: dragRect.width,
                height: dragRect.height
              }}
            />
          )}
        </div>
      )}

      {expandedId && expandedTicket && (
        <div className={styles.lightboxOverlay} onClick={() => setExpandedId(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeLightbox} 
              onClick={() => setExpandedId(null)}
              aria-label="Close"
            >
              &times;
            </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
