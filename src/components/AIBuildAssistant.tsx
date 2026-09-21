"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight
} from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actionButtons?: { label: string; href?: string; query?: string }[];
}

export default function AIBuildAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Welcome to ModularHome.com. I am your architectural housing advisor. What kind of home or building project are you envisioning?",
      timestamp: "Just now",
      actionButtons: [
        { label: "Modular & Prefab Homes", query: "Tell me about your modular and prefab homes" },
        { label: "Modern Barndominiums", query: "Tell me about your residential barndominiums" },
        { label: "Cabins & ADUs", query: "What options do you have for cabins and ADUs?" },
        { label: "Estimate Build Cost", href: "/quote" },
        { label: "Upload Custom Floor Plan", href: "/upload-floor-plan" },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateBotReply = (userQuery: string): { reply: string; actionButtons?: { label: string; href?: string; query?: string }[] } => {
    const q = userQuery.toLowerCase();

    if (q.includes("cabin") || q.includes("tiny") || q.includes("snow") || q.includes("mountain") || q.includes("off-grid")) {
      return {
        reply: "Our featured cabins and tiny homes include 'The Homestead Cabin' (1,200 sq ft, starting at $49,900) and 'The Retreat' luxury tiny home (650 sq ft, starting at $39,900), both factory engineered with precision.",
        actionButtons: [
          { label: "The Homestead Cabin", href: "/models/the-homestead-cabin" },
          { label: "The Retreat Tiny Home", href: "/models/the-retreat" },
          { label: "The Yellowstone Ranch", href: "/models/the-yellowstone" },
        ],
      };
    }

    if (q.includes("barndominium") || q.includes("residential") || q.includes("living") || q.includes("house")) {
      return {
        reply: "Our Barndominiums blend steel-reinforced framing with open Scandinavian luxury interiors. Our top residential designs include 'The Lancaster' (2,200 sq ft, starting at $64,500) and 'The Hawthorne' (2,400 sq ft with wraparound porch).",
        actionButtons: [
          { label: "View The Lancaster", href: "/models/the-lancaster" },
          { label: "View The Hawthorne", href: "/models/the-hawthorne" },
          { label: "Calculate Quote", href: "/quote" },
        ],
      };
    }

    if (q.includes("quote") || q.includes("cost") || q.includes("price") || q.includes("estimate") || q.includes("sq ft")) {
      return {
        reply: "Modular home packages typically range from $25 to $45 per sq ft for factory-engineered components, with finished home packages ranging from $120 to $180 per sq ft. You can calculate a customized breakdown using our interactive tool:",
        actionButtons: [
          { label: "Launch Instant Quote Tool →", href: "/quote" },
          { label: "Submit Floor Plan For Exact Bids", href: "/upload-floor-plan" },
        ],
      };
    }

    if (q.includes("workshop") || q.includes("commercial") || q.includes("shop") || q.includes("storage") || q.includes("crane") || q.includes("shed")) {
      return {
        reply: "For workshops, commercial space, and multi-purpose buildings, take a look at 'The Timberline Workshop' (3,000 sq ft clear-span) and 'The Artisan Shed' (480 sq ft versatile studio kit).",
        actionButtons: [
          { label: "Explore The Timberline", href: "/models/the-timberline-workshop" },
          { label: "Explore The Artisan Shed", href: "/models/the-artisan-shed" },
        ],
      };
    }

    return {
      reply: "Thank you for reaching out to ModularHome.com. We offer factory-built housing solutions from 650 sq ft cabins to 5,000+ sq ft custom estates. Would you like to explore existing models or build a custom quote?",
      actionButtons: [
        { label: "Browse All Models", href: "/models" },
        { label: "Request a Quote", href: "/quote" },
        { label: "Contact Us", href: "/contact" },
      ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotReply(text);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        timestamp: "Just now",
        actionButtons: response.actionButtons,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <aside aria-label="AI Build Assistant Widget">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Housing Assistant"
        className={`fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
          isOpen
            ? "bg-[#101114] text-[#fcb907] rotate-90"
            : "bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] hover:scale-105"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline-block pr-1">
              Housing Advisor
            </span>
          </>
        )}
      </button>

      {/* Slide-over Drawer / Chat Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[82vh] bg-white border border-[var(--line)] rounded-[22px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[var(--ink)] text-white px-5 py-4 border-b border-white/10 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 px-2.5 rounded-[8px] bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                <Image
                  src="/finallogo.avif"
                  alt="ModularHome.com"
                  width={80}
                  height={28}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Housing Advisor
                </div>
                <div className="text-[10px] text-white/70 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--r)] animate-pulse"></span>
                  Online • AI Building Advisor
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--soft)]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[16px] px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[var(--r)] text-white"
                      : "bg-white border border-[var(--line)] text-[var(--ink)]"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render quick Action Buttons if provided by the bot */}
                {msg.actionButtons && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.actionButtons.map((btn, idx) => (
                      btn.href ? (
                        <Link
                          key={idx}
                          href={btn.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold bg-white hover:bg-[var(--r)] text-[var(--ink)] hover:text-white border border-[var(--line)] rounded-full transition-colors shadow-2xs"
                        >
                          <span>{btn.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          key={idx}
                          onClick={() => handleSend(btn.query || btn.label)}
                          className="px-3 py-1.5 text-[11px] font-semibold bg-white hover:bg-[var(--soft)] text-[var(--ink)] border border-[var(--line)] rounded-full transition-colors text-left shadow-2xs cursor-pointer"
                        >
                          {btn.label}
                        </button>
                      )
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-[var(--muted)] mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 bg-white border border-[var(--line)] rounded-[14px] w-fit shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--r)] animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--r)] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--r)] animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions strip */}
          <div className="px-3 py-2 bg-white border-t border-[var(--line)] flex items-center gap-1.5 overflow-x-auto text-[10px] text-[var(--muted)] no-scrollbar">
            <span className="shrink-0 font-bold text-[var(--ink)]">Ask:</span>
            <button
              onClick={() => handleSend("Tell me about cabins")}
              className="px-2.5 py-1 rounded-full bg-[var(--soft)] border border-[var(--line)] hover:text-[var(--ink)] shrink-0 transition-colors cursor-pointer"
            >
              Cabins?
            </button>
            <button
              onClick={() => handleSend("Why steel over wood framing?")}
              className="px-2.5 py-1 rounded-full bg-[var(--soft)] border border-[var(--line)] hover:text-[var(--ink)] shrink-0 transition-colors cursor-pointer"
            >
              Steel vs Wood
            </button>
            <button
              onClick={() => handleSend("What does a cabin cost?")}
              className="px-2.5 py-1 rounded-full bg-[var(--soft)] border border-[var(--line)] hover:text-[var(--ink)] shrink-0 transition-colors cursor-pointer"
            >
              Cabin Pricing?
            </button>
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[var(--line)] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about cabins, models, pricing..."
              className="flex-1 bg-[var(--soft)] border border-[var(--line)] px-3.5 py-2.5 text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--r)] rounded-full"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="p-2.5 bg-[var(--r)] hover:bg-[var(--r-dark)] disabled:opacity-40 text-white rounded-full transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
