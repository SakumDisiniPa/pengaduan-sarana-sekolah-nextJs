import Image from "next/image";
import { pb } from "@/lib/pocketbase";
import type { User } from "../types";
import { getInitial } from "../utils/messageHelpers";

interface ChatHeaderProps {
  selectedUser: User;
}

// Interface for type safety when calling pb.files.getURL
interface PocketBaseRecord {
  id: string;
  collectionId?: string;
  collectionName?: string;
  [key: string]: unknown;
}

export const ChatHeader = ({ selectedUser }: ChatHeaderProps) => (
  <div className="flex items-center justify-between px-4 h-[59px] border-b border-[#e9edef] dark:border-zinc-800 bg-[#f0f2f5] dark:bg-zinc-900/90 backdrop-blur-sm z-20">
    <div className="flex items-center space-x-3">
      {/* Avatar dengan foto asli */}
      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 ring-1 ring-black/5 overflow-hidden relative">
        {selectedUser.avatar ? (
          <Image 
            src={pb.files.getURL(selectedUser as unknown as PocketBaseRecord, selectedUser.avatar)} 
            alt={selectedUser.name || "Avatar"} 
            width={40}
            height={40}
            className="w-full h-full object-cover" 
          />
        ) : (
          getInitial(selectedUser)
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="font-semibold text-[16px] dark:text-zinc-100 leading-tight">
          {selectedUser.name || selectedUser.email.split('@')[0]}
        </span>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">Active</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center space-x-6 text-zinc-500">
      <button className="hover:text-zinc-700 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </button>
      <button className="hover:text-zinc-700 transition-colors">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
      </button>
    </div>
  </div>
);