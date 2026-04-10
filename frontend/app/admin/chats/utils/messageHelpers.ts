import type { User, Message, GroupedMessages } from "../types";

export const getInitial = (u?: User) => {
  const display = u?.name || u?.email || "?";
  return display.charAt(0).toUpperCase();
};

export const getUniqueUsers = (messages: Message[], options: { forAdmin: boolean } = { forAdmin: true }): User[] => {
  const userMap = new Map<string, { user: User; lastTime: number }>();
  
  messages.forEach((msg) => {
    const s = msg.expand?.sender;
    const r = msg.expand?.recipient;
    const time = new Date(msg.created).getTime();

    const processUser = (u?: User) => {
      if (!u) return;
      
      // Jika kita admin, kita ingin lihat siswa (!isAdmin)
      // Jika kita siswa, kita ingin lihat admin (isAdmin)
      const shouldInclude = options.forAdmin ? !u.isAdmin : u.isAdmin;

      if (shouldInclude) {
        const existing = userMap.get(u.id);
        if (!existing || time > existing.lastTime) {
          userMap.set(u.id, { user: u, lastTime: time });
        }
      }
    };

    processUser(s);
    processUser(r);
  });

  return Array.from(userMap.values())
    .sort((a, b) => b.lastTime - a.lastTime)
    .map((item) => item.user);
};

// --- FUNGSI BARU ALA WHATSAPP ---
export const getUserChatInfo = (messages: Message[], userId: string, adminId?: string) => {
  // 1. Ambil semua pesan antara admin dan user spesifik ini
  const chatHistory = messages
    .filter((m) => m.sender === userId || m.recipient === userId)
    // Urutkan dari yang paling baru (created desc)
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const lastMessage = chatHistory[0];

  // 2. Hitung pesan yang belum dibalas (Unread)
  // Logikanya: Hitung berapa pesan dari USER yang masuk SETELAH pesan terakhir dari ADMIN
  let unreadCount = 0;
  for (const msg of chatHistory) {
    if (msg.sender === userId) {
      unreadCount++;
    } else if (msg.sender === adminId) {
      // Jika ketemu pesan dari admin, berarti pesan-pesan sebelumnya sudah dianggap "terbalas"
      break;
    }
  }

  return {
    lastText: lastMessage?.text || "Belum ada pesan",
    unreadCount: unreadCount,
    lastTime: lastMessage?.created,
  };
};
// -------------------------------

export const filterMessagesByUser = (messages: Message[], selectedUser: User | null): Message[] => {
  if (!selectedUser) return [];
  return messages.filter(
    (msg) =>
      // Check expanded data
      msg.expand?.sender?.id === selectedUser.id ||
      msg.expand?.recipient?.id === selectedUser.id ||
      // Fallback to raw IDs
      msg.sender === selectedUser.id ||
      msg.recipient === selectedUser.id
  );
};

export const groupMessagesByDate = (messages: Message[]): GroupedMessages => {
  const groups: GroupedMessages = {};
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
  });
  return groups;
};