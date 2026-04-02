"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { pb } from "../../lib/pocketbase";

type User = {
  id: string;
  email: string;
  isAdmin?: boolean;
};

type ChatRecord = {
  id: string;
  text: string;
  created: string;
  sender?: User;
  recipient?: User;
};

export default function ChatPage() {
  const router = useRouter();
  const user = pb.authStore.model as User | null;
  const [messages, setMessages] = useState<ChatRecord[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      const makeFilter = () => {
        if (user?.isAdmin) {
          return "";
        }
        return `sender="${user.id}" || recipient="${user.id}"`;
      };

      try {
        const list = await pb.collection("chats")
          .getFullList({
            sort: "-created",
            filter: makeFilter(),
            expand: "sender,recipient",
          });
        
        if (!mounted) return;
        
        setMessages(
          list.map((r) => ({
            id: r.id,
            text: r.text,
            created: r.created,
            sender: r.expand?.sender,
            recipient: r.expand?.recipient,
          }))
        );
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        const error = err as { isAbort?: boolean };
        if (mounted && error?.isAbort !== true) {
          setLoading(false);
        }
      }

      // Subscribe to realtime updates
      try {
        unsubscribe = await pb.collection("chats")
          .subscribe("*", (e) => {
            if (!mounted) return;
            
            if (e.action === "create") {
              const rec = e.record;
              if (user.isAdmin || rec.sender === user.id || rec.recipient === user.id) {
                pb.collection("chats")
                  .getOne(rec.id, { expand: "sender,recipient" })
                  .then((fullRec) => {
                    if (!mounted) return;
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: fullRec.id,
                        text: fullRec.text,
                        created: fullRec.created,
                        sender: fullRec.expand?.sender,
                        recipient: fullRec.expand?.recipient,
                      },
                    ]);
                    setTimeout(scrollToBottom, 100);
                  })
                  .catch(console.error);
              }
            }
          });
      } catch (err) {
        const error = err as { isAbort?: boolean };
        if (error?.isAbort !== true) {
          console.error("Subscribe error:", err);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user, router]);

  const send = async () => {
    if (!text.trim() || !user) return;
    try {
      const data = {
        text: text.trim(),
        sender: user.id,
      };
      await pb.collection("chats").create(data);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const groupedMessages: { [date: string]: ChatRecord[] } = {};
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created).toDateString();
    if (!groupedMessages[dateKey]) groupedMessages[dateKey] = [];
    groupedMessages[dateKey].push(msg);
  });

  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Elemen dekoratif latar */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-20 blur-3xl filter dark:bg-purple-800/20" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-20 blur-3xl filter dark:bg-blue-800/20" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md shadow-xl ring-1 ring-white/20 dark:bg-zinc-900/70">
          {/* Header chat */}
          <div className="border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chat dengan Admin
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tanyakan seputar pengaduan atau sarana sekolah
            </p>
          </div>

          {/* Area pesan */}
          <div className="h-[calc(100vh-300px)] min-h-[400px] overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="mb-4 h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>Belum ada pesan. Mulai percakapan dengan admin!</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <div className="sticky top-0 z-10 my-4 flex justify-center">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 backdrop-blur-sm dark:bg-zinc-800/80 dark:text-gray-300">
                        {formatDate(dateKey)}
                      </span>
                    </div>
                    {groupedMessages[dateKey].map((msg, index) => {
                      const isOwn = msg.sender?.id === user?.id;
                      const isAdmin = msg.sender?.isAdmin;
                      const showAvatar =
                        !isOwn &&
                        (index === 0 ||
                          groupedMessages[dateKey][index - 1]?.sender?.id !==
                            msg.sender?.id);
                      return (
                        <div
                          key={msg.id}
                          className={`mb-3 flex ${
                            isOwn ? "justify-end" : "justify-start"
                          } animate-fade-in-up-sm`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: "both",
                          }}
                        >
                          {!isOwn && showAvatar && (
                            <div className="mr-2 flex-shrink-0 self-end">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold text-white shadow-md">
                                {msg.sender?.email?.charAt(0).toUpperCase() ||
                                  "A"}
                              </div>
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] ${isOwn ? "order-2" : ""}`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-2 shadow-sm ${
                                isOwn
                                  ? "rounded-br-none bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                  : isAdmin
                                  ? "rounded-bl-none bg-gray-200 text-gray-900 dark:bg-zinc-700 dark:text-white"
                                  : "rounded-bl-none bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-white"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm">
                                {msg.text}
                              </p>
                            </div>
                            <div
                              className={`mt-1 flex text-xs text-gray-500 dark:text-gray-400 ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span>{formatTime(msg.created)}</span>
                              {isOwn && <span className="ml-1">✓</span>}
                            </div>
                          </div>
                          {!isOwn && !showAvatar && (
                            <div className="mr-2 w-8 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-white/20 bg-white/50 p-4 backdrop-blur-sm dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Tulis pesan..."
                className="flex-1 rounded-full border border-gray-300 bg-white/70 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-white"
              />
              <button
                onClick={send}
                disabled={!text.trim()}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 -translate-x-full skew-x-12 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}