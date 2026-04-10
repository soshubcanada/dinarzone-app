"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDzRate } from "@/lib/engine/rates";
import { formatNumber } from "@/lib/utils/formatNumber";
import { triggerHaptic } from "@/lib/utils/haptics";

type MessageRole = "ai" | "user";

type Message = {
  id: number;
  type: MessageRole;
  text: string;
};

type Route = {
  keywords: readonly string[];
  respond: () => string;
};

const CAD_DZD_CORRIDOR = getDzRate("CA-DZ");
const CAD_DZD_DISPLAY_RATE = CAD_DZD_CORRIDOR?.dzRate ?? 100.3;

const FALLBACK_RESPONSE =
  "Je comprends. Je transmets cette information à votre tableau de bord.";

// DÉMO — routage NLP mocké, à remplacer par un appel LLM
const DEMO_ROUTES: readonly Route[] = [
  {
    keywords: ["taux", "change"],
    respond: () =>
      `Le taux de change actuel est de 1 CAD = ${formatNumber(CAD_DZD_DISPLAY_RATE, 2)} DZD. Souhaitez-vous effectuer une conversion immédiate ?`,
  },
  {
    keywords: ["bloquer", "perdu"],
    respond: () =>
      "J'ai gelé votre carte virtuelle par mesure de sécurité. Aucune transaction n'est possible. Voulez-vous commander une carte de remplacement ?",
  },
  {
    keywords: ["statut", "transfert"],
    respond: () =>
      "Votre dernier transfert (Réf. DÉMO) est arrivé à Alger. Il est prêt à être retiré par le bénéficiaire enregistré chez notre agent agréé.",
  },
];

const QUICK_ACTIONS = ["Taux du jour", "Statut transfert", "Bloquer ma carte"] as const;

const INITIAL_MESSAGE: Message = {
  id: 1,
  type: "ai",
  text: "Bonjour. Je suis votre assistant DinarZone. Comment puis-je vous aider aujourd'hui ?",
};

const MAX_MESSAGES = 100;
const NLP_DELAY_MS = 1500;
const FOCUS_DELAY_MS = 200;
const TYPING_DOT_DELAYS = [0, 0.2, 0.4] as const;

function routeQuery(text: string): string {
  const lower = text.toLowerCase();
  for (const route of DEMO_ROUTES) {
    if (route.keywords.some((kw) => lower.includes(kw))) {
      return route.respond();
    }
  }
  return FALLBACK_RESPONSE;
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-gray-700"
      aria-hidden="true"
    >
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M9 17h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export default function ConciergePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const nextIdRef = useRef<number>(2);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    chatEndRef.current?.scrollIntoView({
      behavior: messages.length > 20 ? "auto" : "smooth",
    });
  }, [messages.length, isOpen]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.length = 0;
    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeChat]);

  const handleSend = useCallback(
    (textOverride?: string) => {
      if (isTyping) return;
      const text = (textOverride ?? inputValue).trim();
      if (!text) return;

      const userMsg: Message = { id: nextIdRef.current++, type: "user", text };
      setMessages((prev) => [...prev, userMsg].slice(-MAX_MESSAGES));
      setInputValue("");
      setIsTyping(true);

      const timer = window.setTimeout(() => {
        const aiMsg: Message = {
          id: nextIdRef.current++,
          type: "ai",
          text: routeQuery(text),
        };
        setMessages((prev) => [...prev, aiMsg].slice(-MAX_MESSAGES));
        setIsTyping(false);
        triggerHaptic("light");
        timersRef.current = timersRef.current.filter((id) => id !== timer);
      }, NLP_DELAY_MS);

      timersRef.current.push(timer);
    },
    [inputValue, isTyping]
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    timersRef.current.push(focusTimer);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openChat}
        aria-label="Ouvrir le concierge IA"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 focus-visible:ring-2 focus-visible:ring-dz-primary transition-transform z-40"
      >
        <SparkleIcon />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="concierge"
            role="dialog"
            aria-modal="true"
            aria-labelledby="concierge-title"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden z-50 border border-gray-100"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
                  <BotIcon />
                </div>
                <div>
                  <h3 id="concierge-title" className="font-bold text-gray-900 leading-tight">
                    Concierge IA
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dz-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-dz-primary uppercase tracking-widest">
                      En ligne · DÉMO
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Fermer le concierge"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-dz-primary transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div
              role="log"
              aria-live="polite"
              aria-label="Historique de conversation"
              className="flex-1 overflow-y-auto p-6 bg-white space-y-6"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 text-sm ${
                      msg.type === "user"
                        ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm shadow-sm"
                        : "bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start" aria-label="Assistant en train d'écrire">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-tl-sm flex gap-1.5">
                    {TYPING_DOT_DELAYS.map((delay) => (
                      <motion.span
                        key={delay}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-6 py-3 bg-white flex gap-2 overflow-x-auto hide-scrollbar">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleSend(action)}
                  disabled={isTyping}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 hover:text-gray-900 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-dz-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                  placeholder="Posez votre question…"
                  aria-label="Votre question"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 outline-none focus:border-gray-300 focus-visible:ring-2 focus-visible:ring-dz-primary transition-colors placeholder:text-gray-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  aria-label="Envoyer"
                  className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 text-white disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 focus-visible:ring-2 focus-visible:ring-dz-primary transition-all"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
