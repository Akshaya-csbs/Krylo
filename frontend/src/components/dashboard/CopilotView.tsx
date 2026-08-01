"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, Zap, AlignLeft, BarChart2 } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function CopilotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hi there! I'm your Klyro Brand Copilot. I have deep semantic access to your brand's voice, guidelines, and historical campaigns. How can I help you synthesize or analyze today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const groqKey = localStorage.getItem("groq_api_key");
      
      const payload = {
        messages: [
          ...messages.filter(m => m.id !== "welcome").map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: text }
        ],
        groq_api_key: groqKey || "",
        brand_id: "66f4321949182390a845942d"
      };

      const response = await fetch("http://localhost:8000/api/v1/copilot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer mock_token_for_development"
        },
        body: JSON.stringify(payload)
      });

      let aiResponse = "";
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.reply) {
          aiResponse = result.data.reply;
        } else {
          aiResponse = "I'm sorry, I wasn't able to process that properly.";
        }
      } else {
        aiResponse = "I'm having trouble connecting to my neural core right now.";
      }

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Network error occurred while connecting to Klyro Copilot.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const suggestedPrompts = [
    { icon: AlignLeft, text: "Summarize my Brand Identity" },
    { icon: Zap, text: "Draft an Instagram campaign" },
    { icon: BarChart2, text: "What are the current trending topics?" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto glass-card overflow-hidden relative">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center border border-primary-200 shadow-sm relative">
            <Bot className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Klyro Copilot</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-500" /> Powered by LLaMA 3
            </p>
          </div>
        </div>
        <button className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors bg-slate-100 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
          Clear Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={clsx("flex gap-3 max-w-[80%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              
              {/* Avatar */}
              <div className="shrink-0">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={clsx(
                "p-4 rounded-2xl shadow-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-slate-800 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
              )}>
                <div className="whitespace-pre-wrap text-sm font-medium">
                  {/* Basic markdown rendering for the mock text */}
                  {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.role === "user" ? "text-white font-black" : "text-slate-900 font-black"}>{part}</strong> : part)}
                </div>
                <div className={clsx("text-[10px] mt-2", msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400")}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[52px]">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        
        {/* Suggested Prompts (hide if typing or lots of messages) */}
        {messages.length < 3 && !isTyping && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button 
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-full hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
                >
                  <Icon className="w-3 h-3" /> {prompt.text}
                </button>
              );
            })}
          </div>
        )}

        <div className="relative flex items-center">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot about your brand, campaigns, or trends..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          AI Copilot uses the Klyro Neural Engine to synthesize responses. May produce inaccurate information.
        </p>
      </div>

    </div>
  );
}
