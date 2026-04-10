import Dexie, { Table } from "dexie";

export interface LocalUser {
  id: string;
  data: string; // Encrypted JSON
  lastUpdated: string;
}

export interface LocalComplaint {
  id: string;
  data: string; // Encrypted JSON
  lastUpdated: string;
}

export interface LocalCategory {
  id: string;
  data: string; // Encrypted JSON
}

export interface LocalMessage {
  id: string;
  roomId: string;
  data: string; // Encrypted JSON
  created: string;
}


export interface SyncMetadata {
  id: string; // Collection name
  lastSync: string;
}

export class AppDatabase extends Dexie {
  users!: Table<LocalUser>;
  complaints!: Table<LocalComplaint>;
  categories!: Table<LocalCategory>;
  chats!: Table<LocalMessage>;
  syncMetadata!: Table<SyncMetadata>;

  constructor() {
    super("SakumSchoolDB");
    this.version(1).stores({
      users: "id, lastUpdated",
      complaints: "id, lastUpdated",
      categories: "id",
      chats: "id, roomId, created",
      syncMetadata: "id"
    });
  }

  // Helper for dynamic table access
  getTable(name: string): Table<unknown, string> {
    const table = (this as Record<string, unknown>)[name]; 
    if (!table || typeof (table as { clear?: unknown }).clear !== "function") {
      throw new Error(`Invalid table name: ${name}`);
    }
    return table as Table<unknown, string>;
  }
}

export const db = new AppDatabase();
