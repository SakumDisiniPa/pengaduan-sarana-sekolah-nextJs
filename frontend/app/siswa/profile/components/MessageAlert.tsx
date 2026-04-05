import { Message } from "../types";

interface MessageAlertProps {
  message: Message | null;
}

export function MessageAlert({ message }: MessageAlertProps) {
  if (!message) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-xl backdrop-blur-md border shadow-lg flex items-start gap-3 animate-fade-in-up ${
        message.type === "success"
          ? "bg-green-500/10 border-green-500/20 text-green-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      <span className="mt-0.5">
        {message.type === "success" ? "✓" : "⚠"}
      </span>
      <p>{message.text}</p>
    </div>
  );
}
