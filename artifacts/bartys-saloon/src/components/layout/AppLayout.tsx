import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}images/saloon-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <Navbar />
      
      <main className="flex-1 relative z-10 container mx-auto px-4 py-8 flex flex-col">
        {children}
      </main>
    </div>
  );
}
