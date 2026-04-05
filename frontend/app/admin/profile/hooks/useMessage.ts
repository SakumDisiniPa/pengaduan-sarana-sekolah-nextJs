import { useState } from "react";
import { Message, MessageType } from "../types";

interface UseMessageResult {
  message: Message | null;
  showMessage: (text: string, type: MessageType) => void;
  clearMessage: () => void;
}

const MESSAGE_DURATION = 5000; // 5 seconds

export const useMessage = (): UseMessageResult => {
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = (text: string, type: MessageType) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), MESSAGE_DURATION);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return {
    message,
    showMessage,
    clearMessage,
  };
};
