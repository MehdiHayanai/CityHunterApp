"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatService } from "../services/chat";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardContext } from "../context/DashboardContext";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const STORAGE_KEY = "cityhunter_active_session";
const SESSION_ID_KEY = "cityhunter_chat_session_id";

export default function ChatInterface({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  // 1. Load active session on open (mount)
  useEffect(() => {
    // Load messages
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }

    // Load or Create Session ID
    const savedSessionId = localStorage.getItem(SESSION_ID_KEY);
    if (savedSessionId) {
        setSessionId(savedSessionId);
    } else {
        // Init new session if user is logged in, or generic one
        initSession();
    }

    isLoaded.current = true;
  }, []);

  const initSession = async () => {
      try {
          // Use user ID or a temp ID if guest
          const userId = user?.id ? String(user.id) : "guest_" + Date.now();
          const session = await ChatService.createSession(userId);
          setSessionId(session.session_id);
          localStorage.setItem(SESSION_ID_KEY, session.session_id);
      } catch (e) {
          console.error("Failed to init chat session", e);
      }
  };

  // 2. Save active session on every message update
  useEffect(() => {
    if (!isLoaded.current) return;
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-focus input on mount
  useEffect(() => {
    const inputElement = document.getElementById("chat-input");
    if (inputElement) inputElement.focus();
  }, []);

    const { questState, mapCenter } = useDashboardContext();
    const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Ensure we have a session
    if (!sessionId) {
        await initSession();
    }

    const currentInput = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
        const userId = user?.id ? String(user.id) : "guest";
        const currentSessionId = sessionId || localStorage.getItem(SESSION_ID_KEY) || "temp_session";
        
        // Contextual Fallback: GPS -> Map Center
        let userLocation = undefined;

        if (questState.userLocation) {
            userLocation = { lat: questState.userLocation.lat, lon: questState.userLocation.lng };
        } else if (mapCenter) {
            userLocation = { lat: mapCenter.lat, lon: mapCenter.lng };
        }

        const response = await ChatService.sendMessage(currentSessionId, currentInput, userId, userLocation);
        
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: response.response,
        };
        setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
        console.error("Failed to send message", error);
        
        let errorMessage = "Sorry, I'm having trouble connecting to the server. Please check your connection.";
        
        if (error.message.includes("timed out")) {
            errorMessage = "The server is taking too long to respond (Timeout). Please try again or check if the backend is running.";
        } else if (error.message.includes("API Error")) {
            errorMessage = `Server Error: ${error.message}`;
        }

        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: errorMessage,
        };
        setMessages((prev) => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]); // Clear UI
    localStorage.removeItem(STORAGE_KEY); // Clear Storage
    localStorage.removeItem(SESSION_ID_KEY); // Clear Session ID
    setSessionId(null);
    initSession(); // Start fresh
    console.log("Session reset and storage cleared.");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Dropped files:", files);
    }
  };

  return (
    <div className="flex h-full w-full bg-surface border border-divider/10 text-primary overflow-hidden relative flex-col shadow-2xl rounded-3xl">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-divider/10 bg-surface/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <i className="fa-solid fa-robot"></i>
          </div>
          <span className="text-base font-bold tracking-tight">CityHunter AI</span>
        </div>
        <div className="flex items-center gap-2">
            {/* Reset Button */}
            <button
                onClick={handleReset}
                className={`w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 rounded-full transition-colors cursor-pointer text-secondary hover:text-accent tooltip ${messages.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                title="Reset Session (Delete Memory)"
            >
                <i className="fa-solid fa-arrow-rotate-right text-sm"></i>
            </button>

            <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-white/10 rounded-full transition-colors cursor-pointer text-secondary hover:text-primary"
            >
            <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center pb-10 opacity-100 animate-in fade-in duration-500">
            {/* Logo CH - Green BG */}
            <div className="w-16 h-16 bg-accent text-black flex items-center justify-center rounded-2xl font-black text-2xl tracking-tighter mb-4 shadow-lg shadow-accent/20">
               CH
            </div>
            <p className="text-secondary font-medium text-lg">How can I help you explore?</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed animate-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === "user"
                      ? "bg-accent text-black font-medium"
                      : "bg-white/5 text-primary border border-divider/10"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-accent">{children}</strong>,
                        em: ({ children }) => <em className="italic text-secondary">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                        li: ({ children }) => <li className="text-primary">{children}</li>,
                        code: ({ inline, children, ...props }: any) =>
                          inline ? (
                            <code className="bg-black/30 px-1.5 py-0.5 rounded text-accent font-mono text-xs" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-black/30 p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs" {...props}>
                              {children}
                            </code>
                          ),
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex w-full justify-start">
                    <div className="bg-white/5 text-primary border border-divider/10 rounded-2xl p-4 flex gap-1">
                        <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full p-4 bg-surface shrink-0">
        <div
          className={`
              relative bg-canvas/50 rounded-2xl border transition-all duration-300 overflow-hidden
              ${
                isDragOver
                  ? "border-accent ring-2 ring-accent/20 bg-accent/5"
                  : "border-divider/10"
              }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-2xl">
              <div className="flex flex-col items-center gap-2 text-accent">
                <i className="fa-solid fa-cloud-arrow-up text-2xl animate-bounce"></i>
                <span className="font-bold text-sm">Drop files here</span>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full bg-transparent border-none text-primary placeholder:text-secondary/50 px-4 pt-3 pb-2 focus:ring-0 focus:outline-none resize-none h-12 text-sm"
              rows={1}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-secondary hover:text-primary transition-colors tooltip"
                  title="Upload image"
                >
                  <i className="fa-regular fa-image text-xs"></i>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => console.log(e.target.files)}
                />
              </div>

              <button
                onClick={handleSend}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                  input.trim() && !isLoading
                    ? "bg-accent text-black"
                    : "bg-white/10 text-secondary cursor-not-allowed"
                }`}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <i className="fa-solid fa-spinner fa-spin text-xs"></i> : <i className="fa-solid fa-arrow-up text-xs"></i>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
