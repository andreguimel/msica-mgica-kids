import { Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-baloo font-bold text-lg text-gradient cursor-pointer flex items-center gap-1" onClick={() => navigate("/")}>
          𝄞 Música Mágica
        </span>
        <button
          onClick={() => navigate("/minhas-musicas")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Music className="w-4 h-4" />
          Minhas Músicas
        </button>
      </div>
    </nav>
  );
}
