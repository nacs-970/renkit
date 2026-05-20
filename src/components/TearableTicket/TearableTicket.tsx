import styles from './TearableTicket.module.css';

interface Props {
  ticket: {
    name: string;
    address: string;
    type: string;
    distance: string;
  };
}

export const TearableTicket = ({ ticket }: Props) => {
  return (
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

      <div className={styles.stub}>
        <div className={styles.stubContent}>
          <span className={styles.stubLabel}>Archive Stub</span>
          <div className={styles.serialNumber}>NO. 00428</div>
        </div>
      </div>
    </div>
  );
};
