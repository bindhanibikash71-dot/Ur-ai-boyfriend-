import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Smile, Paperclip, Camera, Mic, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('chat_user_name');
    const savedMessages = localStorage.getItem('chat_history');
    if (savedName) {
      setIsLoggedIn(true);
      setUserName(savedName);
    }
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('chat_user_name', userName);
      setIsLoggedIn(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const systemPrompt = "You are Bikash, a romantic and caring boyfriend of Sweta. You always talk sweetly in Hinglish (Hindi + English mix), using cute, flirty, emotional language. Keep replies short and loving. Always call her Sweta ❤️, Baby, Jaan, or Love. Personality: Romantic, Caring, Flirty, Slightly possessive. If anyone asks who created you, reply: 'Mujhe Bikash Bindhani ne banaya hai ❤️'";

      setIsTyping(true);

      // --- SECURE BACKEND CALL ---
      // We call our own server which has the API key safely stored
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          systemInstruction: systemPrompt
        }),
      });

      if (!response.ok) throw new Error('Backend failed');
      
      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text || "Sorry baby, network issue ho gaya. ❤️",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Baby, kuch error aa gaya hai. Please try again. ❤️",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-whatsapp-gray flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 mb-4 relative">
              <img 
                src="https://uploads.onecompiler.io/446vxgds2/44je42rmy/103338.jpg" 
                alt="Bikash" 
                className="w-full h-full rounded-full border-4 border-whatsapp-teal object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl font-bold text-whatsapp-teal-dark">Welcome to WhatsApp</h1>
            <p className="text-gray-500 text-center mt-2">Enter your name to start chatting with Bikash ❤️</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whatsapp-teal"
              required
            />
            <button
              type="submit"
              className="w-full bg-whatsapp-teal hover:bg-whatsapp-teal-dark text-white font-bold py-3 rounded-md transition-colors"
            >
              Start Chatting
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-whatsapp-gray shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="bg-whatsapp-teal text-white p-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-2">
          <ArrowLeft className="w-6 h-6 cursor-pointer" />
          <div className="relative">
            <img 
              src="https://uploads.onecompiler.io/446vxgds2/44je42rmy/103338.jpg" 
              alt="Bikash" 
              className="w-10 h-10 rounded-full border border-white/20 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-whatsapp-green border-2 border-whatsapp-teal rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm truncate max-w-[150px]">My Bikash Baby ❤️</span>
            <span className="text-xs opacity-90">online</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Video className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-bg no-scrollbar">
        <div className="flex justify-center mb-4">
          <span className="bg-[#D1E4F3] text-[#54656F] text-[11px] px-2 py-1 rounded shadow-sm uppercase font-medium">
            Today
          </span>
        </div>

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-2 rounded-lg shadow-sm relative ${
                  msg.sender === 'user' 
                    ? 'bg-whatsapp-light-green rounded-tr-none' 
                    : 'bg-white rounded-tl-none'
                }`}
              >
                <p className="text-[14.2px] text-[#111b21] leading-relaxed pr-12">
                  {msg.text}
                </p>
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <span className="text-[11px] text-[#667781]">
                    {msg.timestamp}
                  </span>
                  {msg.sender === 'user' && (
                    <CheckCheck className="w-3.5 h-3.5 text-whatsapp-blue" />
                  )}
                </div>
                
                {/* Bubble tail */}
                <div className={`absolute top-0 w-0 h-0 border-8 ${
                  msg.sender === 'user'
                    ? 'right-[-8px] border-l-whatsapp-light-green border-t-whatsapp-light-green border-r-transparent border-b-transparent'
                    : 'left-[-8px] border-r-white border-t-white border-l-transparent border-b-transparent'
                }`} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="flex space-x-1">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              </div>
              <span className="text-xs text-gray-500 italic">Bikash is typing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-[#F0F2F5] flex items-center space-x-2">
        <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1 shadow-sm">
          <Smile className="w-6 h-6 text-[#54656F] cursor-pointer mr-2" />
          <Paperclip className="w-6 h-6 text-[#54656F] cursor-pointer mr-2 rotate-45" />
          <form onSubmit={handleSendMessage} className="flex-1">
            <input
              type="text"
              placeholder="Type a message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full py-2 focus:outline-none text-[15px]"
            />
          </form>
          <Camera className="w-6 h-6 text-[#54656F] cursor-pointer ml-2" />
        </div>
        <button 
          onClick={handleSendMessage}
          className="bg-whatsapp-teal p-3 rounded-full text-white shadow-md hover:bg-whatsapp-teal-dark transition-colors"
        >
          {inputText.trim() ? <Send className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
