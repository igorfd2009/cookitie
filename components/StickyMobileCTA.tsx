import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { ShoppingCart, Clock } from "lucide-react";

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar o CTA quando o usuário rolar para baixo (após o hero)
      const scrolled = window.scrollY > 400;
      const reservationSection = document.getElementById('reservation');
      const reservationTop = reservationSection?.offsetTop || 0;
      const reservationBottom = reservationTop + (reservationSection?.offsetHeight || 0);
      const currentScroll = window.scrollY + window.innerHeight;
      
      // Esconder quando estiver na seção de reserva
      const isInReservationSection = window.scrollY >= reservationTop - 100 && currentScroll <= reservationBottom + 100;
      
      setIsVisible(scrolled && !isInReservationSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white border-t-2 border-[var(--color-cookite-blue)] shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-1">
          <Clock size={14} className="text-[var(--color-cookite-blue)]" />
          <span>20% OFF até 10/09 - Reserve já!</span>
        </div>
        <Button 
          onClick={scrollToReservation}
          size="lg"
          className="w-full bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-2xl py-3 text-base animate-pulse-glow"
        >
          <ShoppingCart size={20} className="mr-2" />
          Fazer Reserva Online
        </Button>
      </div>
    </div>
  );
}