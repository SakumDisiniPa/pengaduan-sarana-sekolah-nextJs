import type { User } from "../types";
import { getInitial } from "../utils/messageHelpers";

interface ChatHeaderProps {
  selectedUser: User;
}

export const ChatHeader = ({ selectedUser }: ChatHeaderProps) => (
  <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
    <div className="flex items-center space-x-3">
      {/* Inisial otomatis dari name/email via helper */}
      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
        {getInitial(selectedUser)}
      </div>
      
      <div className="flex flex-col">
        {/* Tampilkan Nama (yang pasti publik di expand) */}
        <span className="font-semibold text-sm dark:text-zinc-100 leading-none">
          {selectedUser.name || selectedUser.email || "User Baru"}
        </span>
        
        {/* Opsional: Kalau mau tetap nampilin email kecil di bawahnya (jika ada) */}
        {selectedUser.name && selectedUser.email && (
          <span className="text-[10px] text-gray-500 mt-0.5">
            {selectedUser.email}
          </span>
        )}
      </div>
    </div>
    
    {/* Indikator Online (Opsional/Dekorasi) */}
    <div className="flex items-center space-x-1.5">
      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-[10px] text-gray-400 font-medium">Aktif</span>
    </div>
  </div>
);