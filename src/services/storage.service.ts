export interface ArchivedTicket {
  id: string;
  name: string;
  tearPath: string;
  memo?: string;
  date: string;
}

const STORAGE_KEY = 'renkit_archive';

export const StorageService = {
  saveToArchive(ticket: Omit<ArchivedTicket, 'date'>) {
    const archive = this.getArchive();
    const newEntry: ArchivedTicket = { 
      ...ticket, 
      date: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...archive]));
  },

  getArchive(): ArchivedTicket[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateMemo(id: string, memo: string) {
    const archive = this.getArchive().map(t => 
      t.id === id ? { ...t, memo } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
  }
};
