"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useT, useLocale } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import {
  type AgentType,
  type AgentMessage,
  type AgentContext,
  generateAIResponse,
  getAgentDisplayName,
  getAgentIcon,
  routeToAgent,
} from "@/lib/ai/agents";

interface AIAssistantProps {
  context?: Partial<AgentContext>;
}

export default function AIAssistant({ context = {} }: AIAssistantProps) {
  const t = useT();
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType>("support");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fullContext: AgentContext = {
    language: locale === "ln" ? "ln" : locale === "pt" ? "pt" : locale === "en" ? "en" : "fr",
    ...context,
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: t("ai.welcome"),
        agent: "support",
        timestamp: Date.now(),
      }]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: AgentMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Route to the right agent
    const targetAgent = routeToAgent(userMsg.content);
    setCurrentAgent(targetAgent);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    const response = await generateAIResponse(
      [...messages, userMsg],
      targetAgent,
      fullContext
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: response.content,
        agent: response.agent,
        timestamp: Date.now(),
      },
    ]);
    setIsTyping(false);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentAgent("support");
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300">$1</a>')
      .replace(/\n/g, "<br />");
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-cyan-lg hover:shadow-cyan transition-shadow group"
          >
            <Bot size={24} className="text-white group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-pulse-cyan" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-50 ${
              isExpanded
                ? "inset-4 md:inset-8"
                : "bottom-6 right-6 w-[380px] h-[560px] max-h-[80vh]"
            } flex flex-col rounded-2xl overflow-hidden transition-all duration-300`}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0A0E1A]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    {t("ai.title")}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/20">
                      {t("ai.multi_agent")}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 flex items-center gap-1">
                    {getAgentIcon(currentAgent)} {getAgentDisplayName(currentAgent)} {t("ai.active")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-colors">
                  <RotateCcw size={14} />
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-colors">
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Agent pills */}
            <div className="relative flex gap-1.5 px-4 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-hide">
              {(["support", "fx_advisor", "compliance", "transfer"] as AgentType[]).map((agent) => (
                <button
                  key={agent}
                  onClick={() => setCurrentAgent(agent)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    currentAgent === agent
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20"
                      : "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
                  }`}
                >
                  {getAgentIcon(agent)} {getAgentDisplayName(agent)}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                      {msg.agent ? getAgentIcon(msg.agent) : "🤖"}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-br-md"
                        : "bg-white/[0.06] text-white/80 rounded-bl-md border border-white/[0.06]"
                    }`}
                  >
                    {msg.role === "assistant" && msg.agent && (
                      <div className="text-[9px] text-cyan-400/60 font-medium mb-1 uppercase tracking-wider">
                        {getAgentDisplayName(msg.agent)}
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-xs shrink-0">
                    {getAgentIcon(currentAgent)}
                  </div>
                  <div className="bg-white/[0.06] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce"
                          style={{ animationDelay: `${j * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && (
              <div className="relative px-4 pb-2 flex flex-wrap gap-1.5">
                {[
                  "💸 " + t("ai.quick.send_rdc"),
                  "📊 " + t("ai.quick.rate_aoa"),
                  "🛡️ " + t("ai.quick.kyc"),
                  "💬 " + t("ai.quick.how"),
                ].map((qa) => (
                  <button
                    key={qa}
                    onClick={() => {
                      setInput(qa.replace(/^[^\s]+\s/, ""));
                      setTimeout(() => handleSend(), 50);
                    }}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    {qa}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative px-4 py-3 border-t border-white/[0.06]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/40 transition-colors"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white disabled:opacity-30 hover:shadow-cyan transition-shadow"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-white/20">
                <Sparkles size={8} /> {t("ai.powered")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
