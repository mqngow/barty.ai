import { Link, useLocation } from 'wouter';
import { Beer, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [location] = useLocation();
  const { audioEnabled, toggleAudio } = useAppStore();

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href} className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
        "font-display text-lg tracking-wider",
        isActive 
          ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]" 
          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
      )}>
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center group-hover:bg-primary/30 transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                <Beer className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display text-amber-50 group-hover:text-primary transition-colors drop-shadow-md">
                Barty's Saloon
              </h1>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink href="/" icon={Beer} label="Belly Up" />
            <NavLink href="/menu" icon={BookOpen} label="Drink Menu" />
            
            <div className="w-px h-8 bg-border/50 mx-2"></div>
            
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={cn(
                "p-2 rounded-full transition-all duration-300 border",
                audioEnabled 
                  ? "bg-primary/20 text-primary border-primary/50 shadow-[0_0_10px_rgba(217,119,6,0.3)]" 
                  : "bg-card text-muted-foreground border-border hover:bg-card/80"
              )}
              title={audioEnabled ? "Mute Barty" : "Unmute Barty"}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
