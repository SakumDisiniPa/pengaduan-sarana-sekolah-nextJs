"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { pb } from "../../../lib/pocketbase";
import { useChats, useSendMessage } from "./hooks";
import {
  ChatSidebar,
  ChatHeader,
  MessagesList,
  ChatInput,
  EmptyState,
  LoadingState,
  ContextMenu,
} from "./components";
import {
  getUniqueUsers,
  filterMessagesByUser,
  groupMessagesByDate,
} from "./utils/messageHelpers";
import type { User, Message } from "./types";

import useSyncEngine from "@/hooks/useSyncEngine";
import SyncOverlay from "@/components/admin/SyncOverlay";

export default function AdminChatsPage() {
  // 1. Sync Engine
  const { isSyncing, progress, isReady, error: syncError } = useSyncEngine();

  const { messages, loading } = useChats(isReady);
  const [text, setText] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [contextMenu, setContextMenu] = useState<{ message: Message; x: number; y: number } | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const admin = pb.authStore.model as User | null;

  const { send: sendMessage, sending } = useSendMessage(admin);

  // 1. Memoized Data (Hanya hitung ulang jika messages berubah)
  const users = useMemo(() => getUniqueUsers(messages), [messages]);
  
  const filteredMessages = useMemo(
    () => filterMessagesByUser(messages, selectedUser),
    [messages, selectedUser]
  );
  
  const groupedMessages = useMemo(
    () => groupMessagesByDate(filteredMessages),
    [filteredMessages]
  );

  // 2. Scroll Logic
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Auto-scroll saat ganti user atau pesan baru masuk
  useEffect(() => {
    if (selectedUser) {
      const timer = setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scrollToBottom, messages.length, selectedUser]);

  // 3. Action Handlers
  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setContextMenu({
      message,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDeleteMessage = async (messageId: string, deleteForAll: boolean) => {
    try {
      if (deleteForAll) {
        // Hapus untuk semua - hapus dari database
        await pb.collection("chats").delete(messageId);
      } else {
        // Hapus untuk sendiri - bisa di-soft delete atau hide
        // Untuk sekarang, kita hapus juga (bergantung implementasi backend)
        await pb.collection("chats").delete(messageId);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Gagal menghapus pesan");
    }
  };

  const handleEditMessage = (message: Message) => {
    setText(message.text);
    setEditingMessage(message);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    
    if (editingMessage) {
      // Edit existing message
      try {
        await pb.collection("messages").update(editingMessage.id, { text: text.trim() });
        setText("");
        setEditingMessage(null);
      } catch (error) {
        console.error("Failed to edit message:", error);
        alert("Gagal mengedit pesan");
      }
    } else {
      // Send new message
      const success = await sendMessage(text, selectedUser);
      if (success) {
        setText("");
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="relative h-screen bg-[#f0f2f5] dark:bg-zinc-950 overflow-hidden flex flex-col">
      <SyncOverlay 
        isSyncing={isSyncing} 
        progress={progress} 
        isReady={isReady} 
        error={syncError} 
      />
      
      {/* Container Utama: Full Screen Style */}
      <div className="flex-1 flex overflow-hidden shadow-2xl">
        
        {/* Sidebar */}
        <ChatSidebar 
          users={users}
          messages={messages}
          selectedUser={selectedUser} 
          onSelectUser={setSelectedUser} 
        />

        {/* Chat Area */}
        <div className="flex flex-col flex-1 bg-[#efeae2] dark:bg-zinc-900 relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none bg-[url('https://wallpaperaccess.com/full/1288076.jpg')] bg-repeat" />

          {selectedUser ? (
            <div className="flex flex-col h-full relative z-10">
              <ChatHeader selectedUser={selectedUser} />
              
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <MessagesList 
                  groupedMessages={groupedMessages} 
                  messagesEndRef={messagesEndRef}
                  onContextMenu={handleContextMenu}
                />
              </div>

              {/* Edit indicator */}
              {editingMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    ✏️ Editing: &quot;{editingMessage.text.substring(0, 50)}&quot;...
                  </span>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setText("");
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
                
              {/* Input */}
              <ChatInput 
                text={text} 
                sending={sending} 
                onTextChange={setText} 
                onSend={handleSend}
                placeholder={editingMessage ? "Edit pesan..." : "Tulis pesan..."}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <EmptyState />
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          message={contextMenu.message}
          isMe={contextMenu.message.expand?.sender?.isAdmin || false}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onDelete={handleDeleteMessage}
          onEdit={handleEditMessage}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}