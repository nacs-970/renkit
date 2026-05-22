import { useState } from 'react';
import styles from './LocationScanner.module.css';

interface Props {
  onGenerate: (location: string, radius: number) => void;
}

export const LocationScanner = ({ onGenerate }: Props) => {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(address, radius);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Starting Point</label>
        <input
          type="text"
          placeholder="Enter city or area..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={styles.input}
        />
        <span className={styles.attribution}>Powered by OpenStreetMap</span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Radius: {radius} km
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <button 
        type="submit"
        disabled={!address}
        className={styles.submitButton}
      >
        Generate Ticket
      </button>
    </form>
  );
};
