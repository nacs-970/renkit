import styles from './Settings.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Settings = ({ isOpen, onClose, theme, onToggleTheme }: Props) => {
  if (!isOpen) return null;

  const handleAccentChange = (color: string) => {
    document.documentElement.style.setProperty('--accent', color);
    // Rough estimate for accent-bg (15% opacity)
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    document.documentElement.style.setProperty('--accent-bg', `rgba(${r}, ${g}, ${b}, 0.15)`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </header>

        <section className={styles.section}>
          <span className={styles.sectionTitle}>Preferences</span>
          <div className={styles.settingRow}>
            <span className={styles.label}>Theme</span>
            <button 
              className={styles.toggle}
              onClick={onToggleTheme}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
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
