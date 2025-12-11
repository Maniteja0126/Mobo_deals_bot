import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bot, ArrowRight, Mail, Lock, User, Sparkles, Phone } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [view, setView] = useState<'splash' | 'login' | 'register'>('splash');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (view === 'login') {
        await login(email, password);
      } else {
        await register(name, email, mobile, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  // 1. Splash Screen (Dark Theme)
  if (view === 'splash') {
    return (
      <div className="flex-1 flex flex-col bg-black text-white relative overflow-hidden h-full">
        {/* Background Effects */}
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-lime-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-8 pt-20 pb-12">
          
          <div className="flex flex-col items-center">
             <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-green-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(132,204,22,0.4)] mb-10 rotate-3 border-t border-white/20">
                <Bot size={40} className="text-black" />
             </div>
             
             <h1 className="text-5xl font-bold leading-[1.1] text-center tracking-tight mb-6">
                Best Personal <br/>
                <span className="text-lime-400">AI Assistant</span>
             </h1>
             
             <p className="text-gray-400 text-center max-w-[260px] leading-relaxed text-sm">
                Experience the future of shopping with your own intelligent companion.
             </p>
          </div>

          <div className="w-full space-y-4">
             <button 
                onClick={() => setView('login')}
                className="w-full bg-white text-black font-bold py-5 rounded-[2rem] shadow-xl hover:bg-gray-100 transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
                Start a new chat
            </button>
            <p className="text-center text-xs text-gray-500 font-medium">v1.2.0 • Powered by Gemini</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Login / Register Form
  return (
    <div className="flex-1 flex flex-col bg-white h-full relative p-8 overflow-y-auto scrollbar-hide">
      <div className="mt-8 mb-8">
        <button 
            onClick={() => setView('splash')} 
            className="mb-8 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
        >
            <ArrowRight className="rotate-180" size={24} />
        </button>
        <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 text-lg">
            {view === 'login' ? 'Let\'s get you signed in.' : 'Join ShopGenie today.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 fade-in">
        {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl text-center font-medium">
            {error}
            </div>
        )}

        {view === 'register' && (
            <>
              <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors">
                      <User size={22} />
                  </div>
                  <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[1.5rem] text-base font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400 transition-all placeholder:text-gray-400 text-gray-900"
                      required 
                  />
              </div>
              <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors">
                      <Phone size={22} />
                  </div>
                  <input 
                      type="tel" 
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[1.5rem] text-base font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400 transition-all placeholder:text-gray-400 text-gray-900"
                      required 
                  />
              </div>
            </>
        )}

        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors">
                <Mail size={22} />
            </div>
            <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[1.5rem] text-base font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400 transition-all placeholder:text-gray-400 text-gray-900"
                required 
            />
        </div>

        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors">
                <Lock size={22} />
            </div>
            <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[1.5rem] text-base font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-lime-400 transition-all placeholder:text-gray-400 text-gray-900"
                required 
            />
        </div>

        <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white font-bold py-5 rounded-[2rem] shadow-xl hover:bg-gray-800 transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-3 text-lg"
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
                <>
                 {view === 'login' ? 'Sign In' : 'Sign Up'}
                 <div className="bg-lime-400 rounded-full p-1 text-black">
                    <ArrowRight size={16} />
                 </div>
                </>
            )}
        </button>
      </form>

      <div className="mt-auto text-center pb-6">
        <p className="text-gray-500 font-medium">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
                onClick={() => {
                    setView(view === 'login' ? 'register' : 'login');
                    setError('');
                }}
                className="text-lime-600 font-bold hover:underline ml-1"
            >
                {view === 'login' ? 'Register' : 'Login'}
            </button>
        </p>
      </div>
    </div>
  );
};