import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { Chatbot } from './components/Chatbot';
import { AuthScreen } from './pages/Auth';
import { Orders } from './pages/Orders';

const MainInterface: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'chat' | 'orders'>('chat');

  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-400"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Chat View - Always mounted to preserve state, but hidden when inactive */}
      <div className={`h-full w-full ${currentView === 'chat' ? 'block' : 'hidden'}`}>
        <Chatbot 
          onOpenOrders={() => setCurrentView('orders')} 
          isVisible={currentView === 'chat'}
        />
      </div>

      {/* Orders View - Overlays the chat with an animation */}
      {currentView === 'orders' && (
        <div className="absolute inset-0 z-50 h-full w-full bg-gray-50 slide-in-right">
          <Orders onBack={() => setCurrentView('chat')} />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          {/* Desktop Container: Centers the "Mobile App" */}
          <div className="h-full w-full bg-zinc-900 sm:flex sm:items-center sm:justify-center p-0 sm:p-4 transition-all duration-500">
            
            {/* Mobile App Window */}
            {/* Increased size: h-[95vh] for vertical space, wider width tiers */}
            <div className="w-full h-full sm:h-[95vh] sm:max-h-[1100px] sm:w-[600px] md:w-[750px] bg-white sm:rounded-[2.5rem] sm:border-[8px] sm:border-gray-950 shadow-2xl overflow-hidden relative flex flex-col ring-8 ring-gray-900/50 transition-all duration-300">
              
              {/* iOS-style Status Bar Notch Simulation (Desktop only) */}
              <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-950 rounded-b-3xl z-50 pointer-events-none"></div>
              
              <MainInterface />
            </div>
          </div>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;