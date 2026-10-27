"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Shield,
  Bot,
  User,
  ExternalLink,
  Clock,
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
}

export function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      sender: "bot",
      text: "Namaste! I am Dr. Apex's virtual assistant for Apex Dental & Aesthetic Lounge, Pune. How can I help your smile or skincare today?",
      actionUrl: "/book",
      actionText: "Book Consultation",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    if (textToSend.length > 300) {
      setErrorMessage("Message is too long. Please keep under 300 characters.");
      return;
    }

    setErrorMessage("");

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to reach assistant. Please try again.");
      }

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: data.reply,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send message. Please try WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  }

  const quickPrompts = [
    { label: "🕒 Clinic Timings", query: "What are your clinic timings and working hours?" },
    { label: "💰 Treatment Fees", query: "What are the consultation and root canal fees?" },
    { label: "👩‍⚕️ Doctor Credentials", query: "Who are the doctors and what are their qualifications?" },
    { label: "🦷 Emergency Toothache", query: "I have acute toothache pain. What should I do?" },
    { label: "📅 Book Appointment", query: "How do I book an appointment?" },
  ];

  return (
    <div className="no-print floating-contact-widget fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* ----------------------------------------------------------- */}
      {/* 1. CHATBOT DIALOG POPUP                                     */}
      {/* ----------------------------------------------------------- */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 max-h-[540px] h-[520px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-teal-700/80 border border-teal-500/40 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-teal-200" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-900 absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>Dr. Apex Assistant</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-700/60 rounded text-teal-200 font-normal">
                    24/7 Verified
                  </span>
                </h3>
                <p className="text-[11px] text-teal-200/90">
                  Apex Dental & Aesthetic Lounge • Pune
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-1.5 shadow-xs ${
                    msg.sender === "user"
                      ? "bg-teal-800 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Attached Action Button */}
                  {msg.actionUrl && (
                    <div className="pt-1.5">
                      <Link
                        href={msg.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow-xs ${
                          msg.sender === "user"
                            ? "bg-white text-teal-900 hover:bg-teal-50"
                            : "bg-teal-800 text-white hover:bg-teal-900"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{msg.actionText || "View Details"}</span>
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit text-slate-500 shadow-xs">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-slate-600 ml-1">
                  Dr. Apex is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-[10px] font-medium transition border border-slate-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="px-3 py-1.5 bg-red-50 text-red-700 text-[11px] flex items-center gap-1.5 border-t border-red-100">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about treatments, fees, timings..."
              maxLength={300}
              disabled={isLoading}
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-teal-800 hover:bg-teal-900 text-white flex items-center justify-center transition shadow-xs disabled:opacity-40"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Disclaimer Footer */}
          <div className="px-3 py-1 bg-slate-100 border-t border-slate-200/80 text-[9px] text-slate-500 flex justify-between items-center">
            <span>🛡️ Rate-Limited & End-to-End Sanitized</span>
            <span>Emergency: +91 98230 45678</span>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 2. FLOATING ACTION BUTTONS ROW                              */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-3">
        {/* Button A: WhatsApp Direct Shortcut */}
        <a
          href="https://wa.me/919823045678?text=Hello%20Apex%20Dental%20%26%20Aesthetic%20Lounge%2C%20I%20would%20like%20to%20inquire%20about%20a%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105 active:scale-95"
          aria-label="Direct WhatsApp Contact with Clinic"
        >
          {/* WhatsApp Brand Icon SVG */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          {/* Desktop Hover Tooltip */}
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
            Direct WhatsApp Desk (+91 98230 45678)
          </span>
        </a>

        {/* Button B: Dr. Apex AI Chatbot Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-xl hover:shadow-2xl transition transform hover:scale-105 active:scale-95 ${
            isOpen ? "bg-slate-900" : "bg-teal-800 hover:bg-teal-900"
          }`}
          aria-label="Open Dr. Apex Virtual Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-6 h-6" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-800 absolute -top-1 -right-1 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-800 absolute -top-1 -right-1" />
            </div>
          )}

          {/* Desktop Hover Tooltip */}
          {!isOpen && (
            <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
              Ask Dr. Apex AI (24/7 Clinical Assistant)
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
