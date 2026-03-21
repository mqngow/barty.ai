import { AppLayout } from '@/components/layout/AppLayout';
import { BartyPortrait } from '@/components/chat/BartyPortrait';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { RemedyPanel } from '@/components/chat/RemedyPanel';
import { useCreateGeminiConversation } from '@workspace/api-client-react';
import { useAppStore } from '@/store/use-app-store';
import { Beer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { activeConversationId, setActiveConversation } = useAppStore();
  const { mutateAsync: createConversation, isPending } = useCreateGeminiConversation();

  const handleStartTab = async () => {
    try {
      const convo = await createConversation({ data: { title: "Saloon Visit" } });
      setActiveConversation(convo.id);
    } catch (err) {
      console.error("Failed to start tab:", err);
    }
  };

  return (
    <AppLayout>
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        
        {!activeConversationId ? (
          <motion.div 
            className="max-w-2xl text-center space-y-8 p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(217,119,6,0.2)]">
              <Beer className="w-12 h-12 text-primary" />
            </div>
            
            <h2 className="font-display text-4xl sm:text-6xl text-amber-50 drop-shadow-lg">
              Welcome to Barty's.
            </h2>
            
            <p className="font-serif text-xl text-muted-foreground leading-relaxed">
              It's been a long dusty trail. Pull up a stool, tell old Barty what's weighing heavy on your mind, and he'll mix you something to cure what ails ya.
            </p>
            
            <button
              onClick={handleStartTab}
              disabled={isPending}
              className="mt-8 px-8 py-4 bg-gradient-to-b from-primary to-amber-700 hover:from-amber-400 hover:to-primary text-black font-display tracking-widest text-xl rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {isPending ? "Wiping the bar..." : "POUR ONE OUT"}
            </button>
          </motion.div>
        ) : (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-4">
            {/* Left: Barty portrait + live remedy */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
              <BartyPortrait />
              <RemedyPanel />
            </div>
            
            {/* Right: Chat */}
            <div className="lg:col-span-7">
              <ChatInterface conversationId={activeConversationId} />
            </div>
          </div>
        )}
        
      </div>
    </AppLayout>
  );
}
