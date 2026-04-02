import type { User, Message } from "../types"; // Pastikan Message diimport
import { getInitial, getUserChatInfo } from "../utils/messageHelpers";
import { pb } from "../../../../lib/pocketbase"; // Import pb untuk cek ID admin

interface SidebarProps {
  users: User[];
  messages: Message[]; // Tambahkan props messages
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export const ChatSidebar = ({ users, messages, selectedUser, onSelectUser }: SidebarProps) => {
  const adminId = pb.authStore.model?.id;

  return (
    <div className="flex flex-col border-r dark:border-zinc-800 lg:col-span-1 h-full min-h-0">
      <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Chats</h2>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-500">
          {users.length} Users
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {users.map((user) => {
          const { lastText, unreadCount } = getUserChatInfo(messages, user.id, adminId);
          const isSelected = selectedUser?.id === user.id;

          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full flex items-center space-x-3 rounded-xl p-3 transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 shadow-lg shadow-blue-500/20 translate-x-1"
                  : "hover:bg-gray-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              {/* Avatar */}
              <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-inner transition-colors ${
                isSelected ? "bg-white text-blue-600" : "bg-blue-600 text-white"
              }`}>
                {getInitial(user)}
              </div>
              
              <div className="flex-1 truncate text-left">
                <div className="flex justify-between items-center">
                  <p className={`text-sm font-bold truncate ${
                    isSelected ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                  }`}>
                    {user.name || user.email || "User Baru"}
                  </p>
                </div>
                
                <p className={`text-xs truncate mt-0.5 ${
                  isSelected ? "text-blue-100" : "text-gray-500 dark:text-zinc-400"
                }`}>
                  {lastText}
                </p>
              </div>

              {/* Badge Unread ala WA */}
              {!isSelected && unreadCount > 0 && (
                <div className="flex flex-col items-end space-y-1">
                  <div className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white animate-bounce-subtle">
                    {unreadCount}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};