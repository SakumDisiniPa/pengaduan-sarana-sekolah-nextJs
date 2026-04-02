interface ChatInputProps {
  text: string;
  sending: boolean;
  onTextChange: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export const ChatInput = ({ text, sending, onTextChange, onSend, placeholder = "Tulis pesan..." }: ChatInputProps) => (
  <div className="p-4 border-t dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-full border dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
      />
      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  </div>
);
