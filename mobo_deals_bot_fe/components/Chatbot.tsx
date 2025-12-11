import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Package, Mic, ChevronLeft, MoreHorizontal, Bot, ShoppingBag, ArrowLeft, MicOff, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
// import { productsAPI, ordersAPI } from '../services/mockBackend';
import { productsAPI , ordersAPI , sendChat } from '@/services/apiBackend';
// import { generateBotResponse } from '../services/geminiService';
import { ChatMessage, Order } from '../types';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';

interface ChatbotProps {
  onOpenOrders?: () => void;
  isVisible?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ onOpenOrders, isVisible = true }) => {
  const { messages, addMessage, setMessages } = useChat();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  // const [showKeyInput, setShowKeyInput] = useState(!process.env.API_KEY);

  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting if empty
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Hi ${user?.name.split(' ')[0] || 'there'}! 👋 I'm Mobo. Ready to loot some deals? Ask me for "New Deals" or "Review Deals".`,
        timestamp: Date.now()
      }]);
    }
  }, [user, messages.length, setMessages]);

  // Scroll to bottom whenever messages change, typing state changes, or view becomes visible
  useEffect(() => {
    if (isVisible) {
       // Small timeout allows DOM to paint (handling animations/images) before scrolling
       const timeoutId = setTimeout(() => {
         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
       }, 100);
       return () => clearTimeout(timeoutId);
    }
  }, [messages, isTyping, isVisible]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // if (!inputText.trim() || (!apiKey && showKeyInput)) return;

    // if (showKeyInput && apiKey) {
    //     setShowKeyInput(false);
    // }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    addMessage(userMsg);
    setInputText('');
    setIsTyping(true);

    try {
      const allProducts = await productsAPI.getAll();
      let userOrders: Order[] | null = null;
      if (user) {
        userOrders = await ordersAPI.getUserOrders(user.id);
      }

      // const aiResponse = await generateBotResponse(
      //   apiKey,
      //   userMsg.text,
      //   allProducts,
      //   userOrders,
      //   user?.name || ''
      // );
      
      const aiResponse = await sendChat({
        userId: user?.id,
        userName: user?.name,
        message: userMsg.text,
      });

      console.log("res : " , aiResponse);


      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse.responseText,
        timestamp: Date.now()
      };

      if (aiResponse.recommendedProductIds && aiResponse.recommendedProductIds.length > 0) {
        botMsg.relatedProducts = await productsAPI.getByIds(aiResponse.recommendedProductIds);
      }
      
      if (aiResponse.intent === 'check_order' && userOrders && userOrders.length > 0) {
        botMsg.relatedOrders = [userOrders[0]]; 
      }

      addMessage(botMsg);

    } catch (error) {
      addMessage({
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your API key.",
        isError: true,
        timestamp: Date.now()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (text: string) => {
    if (text === "ORDERS_NAV" && onOpenOrders) {
        onOpenOrders();
        return;
    }
    setInputText(text);
  };

  const startListening = () => {
    // @ts-ignore - Vendor prefix handling
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please try Chrome or Safari.");
      return;
    }

    if (isListening) return; // Already listening

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F4F7] w-full relative font-sans">
      
      {/* App Header */}
      <div className="flex-none bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 flex items-center justify-between z-20 sticky top-0 border-b border-gray-200/50">
        <button onClick={logout} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors">
            <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500"></span>
                </span>
                <h3 className="font-bold text-lg text-gray-900 tracking-tight">Mobo Deal Bot</h3>
             </div>
             <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">Online</p>
        </div>

        <button 
            onClick={onOpenOrders}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors relative"
            title="Order History"
        >
            <History size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-40 space-y-6 scrollbar-hide">
        
        {/* Date Separator */}
        <div className="text-center mb-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200/50 px-3 py-1.5 rounded-full backdrop-blur-sm">Today</span>
        </div>

        {/* {showKeyInput && (
           <div className="mx-2 p-6 bg-zinc-900 rounded-[2rem] shadow-2xl text-center pop-in relative overflow-hidden group mb-8">
               <div className="absolute top-0 right-0 w-40 h-40 bg-lime-500/10 rounded-full blur-3xl transition-all duration-1000 group-hover:bg-lime-500/20"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-tr from-lime-300 to-lime-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-black shadow-lg shadow-lime-400/20">
                    <Sparkles size={24} />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">Power up AI</h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed max-w-[200px] mx-auto">Enter your Gemini API Key to activate the intelligence.</p>
                <input 
                    type="password" 
                    placeholder="Paste API Key..."
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-sm outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-all text-center mb-4 font-mono text-white placeholder:text-gray-600"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
           </div>
        )} */}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1.5 group ${msg.role === 'user' ? 'items-end pop-in-right' : 'items-start pop-in'}`}>
            
            <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3 items-end`}>
              
              {msg.role !== 'user' && (
                 <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-lime-200 to-lime-400 flex items-center justify-center flex-shrink-0 mb-1 shadow-md shadow-lime-200 border border-white">
                    <Bot size={18} className="text-black/80" />
                 </div>
              )}

              <div
                className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-line transition-all duration-200 ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-[1.3rem] rounded-br-sm shadow-lg shadow-black/5'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-[1.3rem] rounded-bl-sm shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
                } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}
              >
                {msg.text}
              </div>
            </div>

            {/* Horizontal Product Scroll */}
            {msg.relatedProducts && msg.relatedProducts.length > 0 && (
               <div className="w-full overflow-x-auto pl-12 pb-4 pt-2 scrollbar-hide snap-x">
                  <div className="flex gap-4 w-max pr-6">
                    {msg.relatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
               </div>
            )}

            {/* Order Cards */}
            {msg.relatedOrders && msg.relatedOrders.map(order => (
               <div key={order.id} className="ml-12 bg-white border border-gray-100 rounded-[1.5rem] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-[280px] animate-[fadeIn_0.5s_ease-out_0.2s_both]">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                             <div className="bg-lime-100 p-1.5 rounded-lg text-lime-700"><Package size={14}/></div>
                             <span className="text-xs font-bold text-gray-900">{order.status}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono tracking-wider">#{order.id.slice(-4)}</span>
                    </div>
                    
                    <div className="flex gap-3 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-50">
                        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                             <img src={order.items[0].image} className="w-full h-full object-cover mix-blend-multiply" alt=""/>
                        </div>
                        <div className="min-w-0">
                             <p className="text-xs font-bold text-gray-900 line-clamp-1">{order.items[0].title}</p>
                             <p className="text-[10px] text-gray-500 mt-0.5">Total: ₹{order.total}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                         <span className="text-[10px] text-gray-500 font-medium">Status: <b className="text-green-600">{order.paymentStatus}</b></span>
                         <button 
                            onClick={onOpenOrders}
                            className="py-1.5 px-3 bg-black text-white rounded-lg text-[10px] font-bold hover:bg-lime-400 hover:text-black transition-all shadow-lg shadow-black/10"
                         >
                            View
                        </button>
                    </div>
               </div>
            ))}

            <span className={`text-[10px] text-gray-400 font-medium px-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${msg.role === 'user' ? 'mr-2' : 'ml-12'}`}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start ml-11 pop-in">
             <div className="bg-white border border-gray-100 px-5 py-4 rounded-[1.3rem] rounded-bl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot [animation-delay:-0.32s]"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot [animation-delay:-0.16s]"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-6 left-0 w-full px-4 z-30">
        
        {/* Quick Actions - Always Visible Menu */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center px-2 mb-1 snap-x">
             <button onClick={() => handleQuickAction("Show me New Deals")} className="snap-start flex-shrink-0 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white text-gray-700 rounded-2xl text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 flex items-center gap-1.5 group">
                <span className="group-hover:animate-pulse">🔥</span> New Deals
            </button>
            <button onClick={() => handleQuickAction("ORDERS_NAV")} className="snap-start flex-shrink-0 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white text-gray-700 rounded-2xl text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 flex items-center gap-1.5">
                <span className="">📦</span> Orders
            </button>
            <button onClick={() => handleQuickAction("What is my payment status?")} className="snap-start flex-shrink-0 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white text-gray-700 rounded-2xl text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 flex items-center gap-1.5">
                <span className="">💳</span> Status
            </button>
            <button onClick={() => handleQuickAction("I need support")} className="snap-start flex-shrink-0 px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white text-gray-700 rounded-2xl text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 flex items-center gap-1.5">
                <span className="">💬</span> Other
            </button>
        </div>

        <div className={`bg-white/95 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-2 max-w-md mx-auto relative z-40 transition-all duration-300 ${isListening ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''}`}>
            <button 
                onClick={startListening}
                className={`p-3.5 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
                title={isListening ? "Listening..." : "Use voice input"}
            >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            
            <form onSubmit={handleSendMessage} className="flex-1">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask for 'Review Deals'..."}
                    className="w-full bg-transparent border-none focus:ring-0 text-[16px] font-medium text-gray-800 placeholder-gray-400 outline-none px-2 h-full"
                    // disabled={showKeyInput && !apiKey}
                />
            </form>
            
            <button 
                onClick={handleSendMessage}
                // disabled={!inputText.trim() || (showKeyInput && !apiKey)}
                disabled={!inputText.trim()}
                className="p-3.5 bg-black text-white rounded-full hover:bg-lime-400 hover:text-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed group"
            >
                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
        </div>
      </div>
      
      {/* Bottom Gradient overlay for smooth fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F2F4F7] via-[#F2F4F7]/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};