"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { pb } from "@/lib/pocketbase";
import { notifyAdminsOfNewChat } from "@/app/admin/chats/hooks/useNotifications";
import {
  ChatSidebar,
  ChatHeader,
  MessagesList,
  ChatInput,
} from "@/app/admin/chats/components";
import type { User as ChatUser } from "@/app/admin/chats/types";
import { 
  getUniqueUsers, 
  filterMessagesByUser, 
  groupMessagesByDate 
} from "@/app/admin/chats/utils/messageHelpers";
import useSiswaChatSync from "@/hooks/useSiswaChatSync";
import { useSiswaChats } from "./hooks/useSiswaChats";

type User = ChatUser;

export default function ChatPage() {
  const router = useRouter();
  const user = pb.authStore.model as User | null;
  
  // 1. Sync & State Management via Dexie
  const { isReady } = useSiswaChatSync();
  const { messages, loading: chatLoading } = useSiswaChats(isReady);
  
  const [text, setText] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!user) {
      router.push("/siswa/login");
    }
  }, [user, router]);

  // Fetch Admin list for Contact List (This stays realtime from PB for metadata)
  useEffect(() => {
    if (!user) return;
    const fetchAdmins = async () => {
      try {
        const adminList = await pb.collection("users").getFullList({
          filter: "isAdmin = true",
        });
        setAdmins(adminList as unknown as User[]);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };
    fetchAdmins();
  }, [user]);

  // Merge Admins from history + Available Admins
  const allContacts = useMemo(() => {
    const historicalAdmins = getUniqueUsers(messages, { forAdmin: false });
    const adminMap = new Map<string, User>();
    
    // 1. Add available admins first
    admins.forEach(a => adminMap.set(a.id, a));
    
    // 2. Add historical admins (might have more details if sync'd)
    historicalAdmins.forEach(a => adminMap.set(a.id, a));
    
    // Return sorted by recent activity if possible
    return Array.from(adminMap.values()).sort((a, b) => {
        const aMsg = messages.filter(m => m.sender === a.id || m.recipient === a.id).pop();
        const bMsg = messages.filter(m => m.sender === b.id || m.recipient === b.id).pop();
        if (!aMsg) return 1;
        if (!bMsg) return -1;
        return new Date(bMsg.created).getTime() - new Date(aMsg.created).getTime();
    });
  }, [messages, admins]);

  // Filter messages for selected admin
  const filteredMessages = useMemo(
    () => filterMessagesByUser(messages, selectedAdmin),
    [messages, selectedAdmin]
  );

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(filteredMessages);
  }, [filteredMessages]);

  // Auto-scroll logic
  useEffect(() => {
    if (filteredMessages.length > 0) {
      setTimeout(() => scrollToBottom("auto"), 100);
    }
  }, [filteredMessages.length, selectedAdmin]);

  const send = async () => {
    if (!text.trim() || !user || !selectedAdmin) return;
    try {
      const data = {
        text: text.trim(),
        sender: user.id,
        recipient: selectedAdmin.id, // Explicitly target the selected admin
      };
      await pb.collection("chats").create(data);
      
      // Notify the specific admin
      await notifyAdminsOfNewChat(user, text.trim(), [selectedAdmin]).catch(console.warn);
      
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (chatLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f2f5] dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] dark:bg-zinc-950 overflow-hidden relative">
      {/* Container Utama: Full Screen Style ala Admin */}
      <div className="flex-1 flex overflow-hidden shadow-2xl">
        
        {/* Sidebar: Daftar Admin */}
        <ChatSidebar 
          users={allContacts}
          messages={messages}
          selectedUser={selectedAdmin}
          onSelectUser={setSelectedAdmin}
          placeholder="Cari admin sekolah..."
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-900 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none bg-[url('https://wallpaperaccess.com/full/1288076.jpg')] bg-repeat" />

          {selectedAdmin ? (
            <div className="flex flex-col h-full relative z-10">
              <ChatHeader selectedUser={selectedAdmin} />
              
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <MessagesList 
                  groupedMessages={groupedMessages} 
                  messagesEndRef={messagesEndRef}
                />
              </div>

              <ChatInput 
                text={text}
                onTextChange={setText}
                onSend={send}
                sending={false}
                placeholder={`Tulis pesan ke ${selectedAdmin.name || "Admin"}...`}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center p-8 space-y-4">
               <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              </div>
              <h2 className="text-2xl font-bold dark:text-white">Pilih Admin untuk Mengobrol</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">Daftar admin sekolah ada di sebelah kiri. Ketuk salah satu untuk memulai percakapan baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}