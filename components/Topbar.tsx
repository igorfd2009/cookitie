import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

export function Topbar() {
  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-cookite-blue)] text-white py-2 px-3 md:px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-center truncate">
            <span className="animate-pulse-glow">⚡</span> 
            <span className="hidden sm:inline">JEPP — Evento único | </span>
            Reserve com 20% OFF até 10/09
          </p>
        </div>
        <Button 
          onClick={scrollToReservation}
          size="sm"
          className="bg-white text-[var(--color-cookite-blue)] hover:bg-gray-100 rounded-xl ml-3 text-xs md:text-sm px-3 py-1.5 hidden sm:flex"
        >
          <ShoppingCart size={14} className="mr-1.5" />
          Fazer Reserva
        </Button>
        <Button 
          onClick={scrollToReservation}
          size="sm"
          className="bg-white text-[var(--color-cookite-blue)] hover:bg-gray-100 rounded-xl ml-2 p-2 sm:hidden"
          aria-label="Fazer Reserva"
        >
          <ShoppingCart size={16} />
        </Button>
      </div>
    </div>
  );
}