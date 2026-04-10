import { useState } from "react";
import type { Message } from "../types";

interface MessageBubbleProps {
  msg: Message;
  isMe: boolean;
  onContextMenu: (e: React.MouseEvent, message: Message) => void;
}

export const MessageBubble = ({ msg, isMe, onContextMenu }: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"} mb-1`}>
      <div
        onContextMenu={(e) => onContextMenu(e, msg)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative max-w-[85%] sm:max-w-[70%] px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all duration-150 rounded-lg group ${
          isMe
            ? "bg-[#dcf8c6] dark:bg-[#056162] text-zinc-900 dark:text-zinc-100 rounded-tr-none"
            : "bg-white dark:bg-[#202c33] text-zinc-900 dark:text-zinc-100 rounded-tl-none"
        } ${isHovered ? "brightness-95" : "brightness-100"} cursor-default`}
      >
        {/* Tail effect would be here, but using clean rounded look for now */}
        
        <div className="flex flex-wrap items-end gap-x-2">
          <p className="text-[14.2px] leading-relaxed break-words whitespace-pre-wrap">
            {msg.text}
          </p>
          <div className="flex-1 flex justify-end items-center space-x-1 min-w-[50px] mt-1 self-end ml-auto">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              {new Date(msg.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isMe && (
               <span className="text-[14px] text-blue-400 leading-none">✓✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
