import { useEffect, useRef } from "react";
import type { Message } from "../types";

interface ContextMenuProps {
  message: Message;
  isMe: boolean;
  position: { x: number; y: number };
  onDelete: (messageId: string, deleteForAll: boolean) => void;
  onEdit: (message: Message) => void;
  onClose: () => void;
}

export const ContextMenu = ({
  message,
  isMe,
  position,
  onDelete,
  onEdit,
  onClose,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-max rounded-lg bg-white shadow-lg ring-1 ring-black/10 dark:bg-zinc-900 dark:ring-white/10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="py-1">
        {isMe && (
          <>
            <button
              onClick={() => {
                onEdit(message);
                onClose();
              }}
              className="block w-full px-4 py-2 text-left text-sm transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-zinc-800 text-gray-900 dark:text-zinc-100"
            >
              ✏️ Edit Chat
            </button>
            <div className="my-1 border-t dark:border-zinc-800" />
          </>
        )}

        {isMe && (
          <button
            onClick={() => {
              onDelete(message.id, false);
              onClose();
            }}
            className="block w-full px-4 py-2 text-left text-sm transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            🗑️ Hapus untuk Saya
          </button>
        )}

        {isMe && (
          <button
            onClick={() => {
              onDelete(message.id, true);
              onClose();
            }}
            className="block w-full px-4 py-2 text-left text-sm transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
          >
            🗑️ Hapus untuk Semua
          </button>
        )}

        {!isMe && (
          <button
            onClick={() => {
              onDelete(message.id, false);
              onClose();
            }}
            className="block w-full px-4 py-2 text-left text-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-zinc-100"
          >
            🗑️ Hapus
          </button>
        )}
      </div>
    </div>
  );
};
