"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Dumbbell } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

interface CoachChatProps {
  onOpenBooking: (goal?: string) => void;
}

const actionChips = [
  "💪 Membership Plans",
  "🎯 Book Free Trial",
  "⏰ Gym Timings",
  "🏋️ Equipment",
  "🔥 Weight Loss",
  "💎 Muscle Gain",
];

// Helper to generate unique message IDs outside the component to satisfy purity checks
let idCounter = 0;
const generateMessageId = (sender: string) => {
  idCounter++;
  return `${sender}_${Date.now()}_${idCounter}`;
};

export const CoachChat: React.FC<CoachChatProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'coach',
      text: "WHAT'S UP! I'm your Ran Fitness AI Sales Coach. Ready to crush your goals? Ask me about our Aerofit equipment, pricing plans, Zumba schedules, or CrossFit training. Ready to get started? Tell me your fitness goals!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) setInputText('');

    const userMessage: Message = {
      id: generateMessageId('user'),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const coachMessage: Message = {
          id: generateMessageId('coach'),
          sender: 'coach',
          text: data.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, coachMessage]);

        // Check if the AI has flagged a booking trigger
        if (data.triggerBooking) {
          setTimeout(() => {
            onOpenBooking(data.suggestedGoal || 'CrossFit / Athletic Power');
          }, 1000);
        }
      } else {
        throw new Error('Chat API returned an error');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback response
      const coachMessage: Message = {
        id: generateMessageId('coach'),
        sender: 'coach',
        text: "Honestly, the best way to experience RAN Fitness is in person! Let me pull up the booking form so you can claim your free trial session.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMessage]);
      setTimeout(() => {
        onOpenBooking('General Mobility & Cardio');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: string) => {
    handleSend(chip);
  };

  return (
    <>
      {/* Floating Circular Toggle Button */}
      <div className="fixed bottom-24 right-6 z-[1000] flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
            className="bg-zinc-950/95 text-white border border-zinc-800 rounded-xl px-3 py-1.5 shadow-xl text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Coach Zeus AI Chatbot
          </motion.div>
        )}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={!isOpen ? {
            boxShadow: [
              '0 0 0 0 rgba(250, 204, 21, 0.4)',
              '0 0 0 10px rgba(250, 204, 21, 0)',
              '0 0 0 0 rgba(250, 204, 21, 0.4)'
            ]
          } : {}}
          transition={{
            boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
          }}
          className={`flex h-14 w-14 items-center justify-center rounded-full text-black shadow-lg transition-colors duration-300 ${
            isOpen ? 'bg-zinc-800 text-white' : 'bg-yellow-400 hover:bg-yellow-300'
          }`}
        >
          {isOpen ? <X size={24} /> : <Dumbbell size={24} />}
        </motion.button>
      </div>

      {/* Chat Box Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-40 right-6 z-[1000] flex h-[500px] w-[350px] sm:w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-black">
                    <Bot size={20} />
                  </div>
                  {/* Green status pulse */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-950 bg-green-500" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-black italic tracking-wide text-zinc-900 dark:text-white uppercase">
                    COACH ZEUS AI
                  </h4>
                  <p className="text-[10px] text-yellow-500 dark:text-yellow-400 uppercase tracking-widest font-mono">
                    Sales & Fitness Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      m.sender === 'user' 
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350' 
                        : 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className="max-w-[75%] space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-yellow-400 text-black font-semibold rounded-tr-none'
                          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-600 block px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Animated Typing Indicator — 3 bouncing dots */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400">
                    <Bot size={14} />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-zinc-500 dark:text-zinc-450 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="block h-2 w-2 rounded-full bg-yellow-400"
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                    <span>Coach Zeus is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Action Chips — persistent horizontal scrollable strip */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {actionChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    disabled={isLoading}
                    className="flex-shrink-0 rounded-full border border-white/20 dark:border-zinc-700/50 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm px-3 py-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 hover:border-yellow-400/60 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-400/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Coach Zeus..."
                className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:border-yellow-400 focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
