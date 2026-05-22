import { useState, useEffect } from 'react';
import { StorageService, type ArchivedTicket } from '../../services/storage.service';
import styles from './ArchiveBook.module.css';

interface Props {
  onClose: () => void;
}

export const ArchiveBook = ({ onClose }: Props) => {
  const [archive, setArchive] = useState<ArchivedTicket[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempMemo, setTempMemo] = useState('');

  useEffect(() => {
    setArchive(StorageService.getArchive());
  }, []);

  const handleSaveMemo = (id: string) => {
    StorageService.updateMemo(id, tempMemo);
    setArchive(StorageService.getArchive());
    setEditingId(null);
  };

  const startEditing = (ticket: ArchivedTicket) => {
    setEditingId(ticket.id);
    setTempMemo(ticket.memo || '');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>The Archive</h2>
        <button onClick={onClose} className={styles.closeButton}>Return</button>
      </header>

      {archive.length === 0 ? (
        <div className={styles.emptyState}>
          No memories collected yet. Tear a ticket to begin.
        </div>
      ) : (
        <div className={styles.list}>
          {archive.map((ticket) => (
            <div key={ticket.id} className={styles.ticketItem}>
              <div className={styles.ticketHeader}>
                <h3 className={styles.name}>{ticket.name}</h3>
                <span className={styles.date}>
                  {new Date(ticket.date).toLocaleDateString()}
                </span>
              </div>

              {editingId === ticket.id ? (
                <div>
                  <textarea
                    className={styles.memoInput}
                    value={tempMemo}
                    onChange={(e) => setTempMemo(e.target.value)}
                    placeholder="Write a memory..."
                    autoFocus
                  />
                  <button 
                    onClick={() => handleSaveMemo(ticket.id)}
                    className={styles.closeButton}
                    style={{ marginTop: '5px' }}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div onClick={() => startEditing(ticket)} style={{ cursor: 'pointer' }}>
                  {ticket.memo ? (
                    <p className={styles.memo}>{ticket.memo}</p>
                  ) : (
                    <p className={styles.date}>Click to add memo...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
