import { TearableTicket, type TicketStyle } from '../TearableTicket/TearableTicket';
import styles from './Settings.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  ticketStyle: TicketStyle;
  onSetTicketStyle: (style: TicketStyle) => void;
  timeFormat: '12h' | '24h';
  onToggleTimeFormat: () => void;
}

export const Settings = ({ 
  isOpen, 
  onClose, 
  theme, 
  onToggleTheme, 
  ticketStyle, 
  onSetTicketStyle,
  timeFormat,
  onToggleTimeFormat
}: Props) => {
  if (!isOpen) return null;

  const handleAccentChange = (color: string) => {
    document.documentElement.style.setProperty('--accent', color);
    // Rough estimate for accent-bg (15% opacity)
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
  };

  const styles_list: { id: TicketStyle; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'mono', label: 'Mono' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </header>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>Ticket Style Preview</span>
          <div className={styles.previewWrapper}>
            <TearableTicket 
              ticket={{
                name: 'Preview Spot',
                address: '123 Discovery Lane',
                type: 'Cafe & Culture',
                distance: '1.2 km',
                time: new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: timeFormat === '12h' 
                })
              }}
              ticketStyle={ticketStyle}
              className={styles.previewTicket}
            />
          </div>
          <div className={styles.styleGrid}>
            {styles_list.map((s) => (
              <button 
                key={s.id}
                className={`${styles.styleButton} ${ticketStyle === s.id ? styles.styleButtonActive : ''}`}
                onClick={() => onSetTicketStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>Preferences</span>
          <div className={styles.settingRow}>
            <span className={styles.label}>Theme</span>
            <button 
              className={styles.toggle}
              onClick={onToggleTheme}
            >
              {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <div className={styles.settingRow}>
            <span className={styles.label}>Time Format</span>
            <button 
              className={styles.toggle}
              onClick={onToggleTimeFormat}
            >
              {timeFormat === '12h' ? '🕒 12-Hour' : '🕒 24-Hour'}
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>Appearance</span>
          <div className={styles.settingRow}>
            <span className={styles.label}>Accent Color</span>
            <input 
              type="color" 
              className={styles.colorPicker}
              onChange={(e) => handleAccentChange(e.target.value)}
              defaultValue="#AFE876"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
