"use client";

import { useEffect, useRef, useState } from "react";

import { Chat, Close, Send } from "@/components/ui/Icons";

type Message = { id: number; from: "bot" | "user"; text: string };

const quickReplies = [
  {
    label: "How do I register?",
    answer:
      "Tap Register on the top menu (or the app), enter your name, email and phone number, then verify the code we send you. It takes about 60 seconds.",
  },
  {
    label: "How do I fund my wallet?",
    answer:
      "Open the ESB app, go to Wallet → Top up, then pay with debit card, bank transfer, USSD or a voucher. Your balance updates instantly.",
  },
  {
    label: "Where do I get a smart card?",
    answer:
      "Smart cards are available at ESB station counters and authorised partner outlets. Link the card to your account and you can tap to board right away.",
  },
  {
    label: "Talk to a human",
    answer:
      "Our team is available every day, 9:00–20:00 WAT on +234 803 319 6377 or support@enugusmartbus.com. I can also take a message on the contact page.",
  },
];

const greeting: Message = {
  id: 0,
  from: "bot",
  text: "Hi, I'm Ijeoma — your Enugu Smart Bus assistant. Ask me about registration, wallet top-ups, smart cards or live tracking.",
};

export function AskIjeoma() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  const reply = (question: string, answer?: string) => {
    setMessages((current) => [
      ...current,
      { id: current.length, from: "user", text: question },
      {
        id: current.length + 1,
        from: "bot",
        text:
          answer ??
          "Thanks for that! A support agent will follow up by email. For anything urgent call +234 803 319 6377 (9:00–20:00 WAT, daily).",
      },
    ]);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="ask-ijeoma-panel"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-grass-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lift transition hover:bg-grass-600"
      >
        {open ? <Close className="h-5 w-5" /> : <Chat className="h-5 w-5" />}
        <span>{open ? "Close" : "Ask Ijeoma"}</span>
      </button>

      <div
        id="ask-ijeoma-panel"
        hidden={!open}
        className="fixed bottom-24 right-5 z-40 w-[min(370px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-lift"
      >
        <div className="flex items-center gap-3 bg-navy-900 px-5 py-4 text-white">
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-display font-semibold">
            IJ
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy-900 bg-grass-400" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Ask Ijeoma</span>
            <span className="block text-xs text-white/60">
              Online • replies instantly
            </span>
          </span>
        </div>

        <div
          ref={listRef}
          className="max-h-[300px] space-y-3 overflow-y-auto bg-sand px-4 py-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.from === "bot"
                  ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-navy-900/80 shadow-card"
                  : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-navy-600 px-4 py-3 text-sm text-white"
              }
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-navy-100 px-4 py-3">
          {quickReplies.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => reply(item.label, item.answer)}
              className="rounded-full border border-navy-100 px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:border-grass-400 hover:bg-grass-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;
            reply(draft.trim());
            setDraft("");
          }}
          className="flex items-center gap-2 border-t border-navy-100 px-3 py-3"
        >
          <label htmlFor="ijeoma-input" className="sr-only">
            Message Ijeoma
          </label>
          <input
            id="ijeoma-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your question…"
            className="w-full rounded-full bg-sand px-4 py-2.5 text-sm outline-none placeholder:text-navy-900/40"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grass-500 text-white transition hover:bg-grass-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
