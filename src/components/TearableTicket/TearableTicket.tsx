import styles from './TearableTicket.module.css';

export type TicketStyle = 'classic' | 'modern' | 'mono';

interface Props {
  ticket: {
    name: string;
    address: string;
    type: string;
    distance: string;
    time?: string;
  };
  onClick?: () => void;
  className?: string;
  ticketStyle?: TicketStyle;
}

export const TearableTicket = ({ ticket, onClick, className, ticketStyle = 'classic' }: Props) => {
  return (
    <div 
      className={`${styles.container} ${styles[ticketStyle]} ${className || ''}`}
      onClick={onClick}
    >
      <div className={styles.main}>
        <header className={styles.header}>
          <h1>Renkit</h1>
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
          {ticket.time && (
            <div className={styles.meta}>
              <span className={styles.metaLabel}>Time</span>
              <p className={styles.metaValue}>{ticket.time}</p>
            </div>
          )}
          <div className={styles.meta}>
            <span className={styles.metaLabel}>Type</span>
            <p className={styles.metaValue}>{ticket.type}</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
