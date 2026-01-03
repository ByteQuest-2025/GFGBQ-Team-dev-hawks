"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className = "" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your CivicPulse assistant. How can I help you today? You can ask me about submitting grievances, checking status, or general questions about our services.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat/", {
        message: input,
        conversation_id: "default",
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-[400px] h-[500px] shadow-2xl border-2 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  CivicPulse Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-blue-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.isUser
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-900 border border-slate-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isUser ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-3 bg-white">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

