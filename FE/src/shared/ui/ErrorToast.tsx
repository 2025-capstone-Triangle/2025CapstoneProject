import { useEffect, useState } from "react";
import { subscribeErrorToast } from "../../lib/errorToastService";

export function ErrorToast() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeErrorToast((message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => {
        setMessages((prev) => prev.slice(1));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  if (!messages.length) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 flex flex-col items-center gap-2 px-4 z-[1000] pointer-events-none">
      {messages.map((message, index) => (
        <div
          key={`${message}-${index}`}
          className="bg-[#1f1f1f] text-white text-sm px-5 py-3 rounded-xl shadow-lg pointer-events-auto max-w-lg w-full border border-white/10"
        >
          {message}
        </div>
      ))}
    </div>
  );
}
