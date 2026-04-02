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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        onContextMenu={(e) => onContextMenu(e, msg)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all duration-150 ${
          isMe
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-bl-none"
        } ${isHovered ? "opacity-80" : "opacity-100"} cursor-context-menu`}
      >
        <p>{msg.text}</p>
        <p className={`mt-1 text-[10px] opacity-70 ${isMe ? "text-right" : "text-left"}`}>
          {new Date(msg.created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};
