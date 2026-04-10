import Image from "next/image";
import { useState } from "react";
import type { User, Message } from "../types"; // Pastikan Message diimport
import { getInitial, getUserChatInfo } from "../utils/messageHelpers";
import { pb } from "@/lib/pocketbase"; // Import pb untuk cek ID admin

interface SidebarProps {
  users: User[];
  messages: Message[]; // Tambahkan props messages
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  placeholder?: string;
}

// Interface for type safety when calling pb.files.getURL
interface PocketBaseRecord {
  id: string;
  collectionId?: string;
  collectionName?: string;
  [key: string]: unknown;
}

export const ChatSidebar = ({ users, messages, selectedUser, onSelectUser, placeholder = "Search or start new chat" }: SidebarProps) => {
  const adminId = pb.authStore.model?.id;
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col border-r border-[#e9edef] dark:border-zinc-800 w-[30%] min-w-[300px] max-w-[400px] bg-white dark:bg-zinc-900 h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="bg-[#f0f2f5] dark:bg-zinc-800/50 p-3 flex justify-between items-center h-[59px]">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden ring-1 ring-black/5 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400">
            {pb.authStore.model?.name?.charAt(0) || "U"}
          </div>
        </div>
        <div className="flex items-center space-x-5 text-zinc-500">
          <button className="hover:text-zinc-700 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </button>
          <button className="hover:text-zinc-700 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#f0f2f5] dark:border-zinc-800 flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-1.5 bg-[#f0f2f5] dark:bg-zinc-800 border-none rounded-lg text-sm placeholder-zinc-500 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      
      {/* User List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const { lastText, unreadCount, lastTime } = getUserChatInfo(messages, user.id, adminId);
            const isSelected = selectedUser?.id === user.id;

            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center h-[72px] px-3 space-x-3 transition-colors border-b border-[#f0f2f5] dark:border-zinc-800/20 ${
                  isSelected ? "bg-[#f0f2f5] dark:bg-zinc-800" : "hover:bg-[#f5f6f6] dark:hover:bg-zinc-800/30"
                }`}
              >
                {/* Avatar */}
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 relative ring-1 ring-black/5">
                  {user.avatar ? (
                     <Image 
                        src={pb.files.getURL(user as unknown as PocketBaseRecord, user.avatar)} 
                        alt={user.name || "Avatar"} 
                        width={48}
                        height={48}
                        className="w-full h-full object-cover" 
                      />
                  ) : (
                    getInitial(user)
                  )}
                  {unreadCount > 0 && !isSelected && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className="text-[17px] font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {user.name || (user.email ? user.email.split('@')[0] : "User")}
                    </p>
                    {lastTime && (
                      <span className={`text-[12px] ${unreadCount > 0 && !isSelected ? "text-emerald-500 font-bold" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-[14px]">
                    <p className={`truncate ${unreadCount > 0 && !isSelected ? "font-bold text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}>
                      {lastText}
                    </p>
                    {unreadCount > 0 && !isSelected && (
                      <div className="ml-2 px-1.5 min-w-[20px] h-5 rounded-full bg-emerald-500 text-[11px] font-bold text-white flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic p-10 text-center">
            {search ? "No results found" : "No active chats yet"}
          </div>
        )}
      </div>
    </div>
  );
};