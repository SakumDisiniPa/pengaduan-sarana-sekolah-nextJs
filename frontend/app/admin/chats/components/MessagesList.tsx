import type { GroupedMessages, Message } from "../types";
import { MessageBubble } from "./MessageBubble";

interface MessagesListProps {
  groupedMessages: GroupedMessages;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onContextMenu?: (e: React.MouseEvent, message: Message) => void;
}

export const MessagesList = ({ groupedMessages, messagesEndRef, onContextMenu }: MessagesListProps) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-6">
    {Object.keys(groupedMessages).map((date) => (
      <div key={date} className="space-y-4">
        <div className="flex justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded">
            {date === new Date().toDateString() ? "Hari Ini" : date}
          </span>
        </div>
        {groupedMessages[date].map((msg) => {
          const isMe = msg.expand?.sender?.isAdmin;
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={isMe || false}
              onContextMenu={onContextMenu || (() => {})}
            />
          );
        })}
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>
);
