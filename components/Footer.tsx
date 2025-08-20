import { ShoppingCart, Instagram, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-800 text-white py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* CTA Principal antes das informações */}
        <div className="text-center mb-8 md:mb-12">
          <div className="bg-[var(--color-cookite-blue)] rounded-2xl p-6 md:p-8">
            <h3 className="mb-3 md:mb-4 text-white text-xl md:text-2xl">Não perca o desconto!</h3>
            <p className="mb-4 md:mb-6 text-blue-100 text-sm md:text-base">
              Reserve online antes de 10/09 e ganhe 20% OFF automaticamente
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={scrollToReservation}
                size="lg"
                className="bg-white text-[var(--color-cookite-blue)] hover:bg-gray-100 rounded-2xl px-6 md:px-8 py-3 text-base md:text-lg"
              >
                <ShoppingCart size={20} className="mr-2" />
                Fazer Reserva Online
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[var(--color-cookite-blue)] rounded-2xl px-6 md:px-8 py-3 text-base md:text-lg"
              >
                <a 
                  href="https://instagram.com/cookite_oficial"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 text-white hover:text-[var(--color-cookite-blue)] transition-colors"
                >
                  <Instagram size={20} />
                  Ou pelo Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">
          <div>
            <h3 className="mb-3 md:mb-4 text-lg md:text-xl">Cookite</h3>
            <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">
              Doces artesanais feitos com carinho para adoçar o seu JEPP.
            </p>
            <a 
              href="https://instagram.com/cookite_oficial"
              target="_blank"
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-[var(--color-cookite-blue)] hover:text-[var(--color-cookite-blue-hover)] transition-colors text-sm md:text-base"
            >
              <Instagram size={18} />
              @cookite_oficial
            </a>
          </div>

          <div>
            <h4 className="mb-3 md:mb-4 text-base md:text-lg">Local do Evento</h4>
            <div className="space-y-2 md:space-y-3 text-gray-300 text-sm md:text-base">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin size={16} />
                <span>Escola Estadual Exemplo</span>
              </div>
              <p>Ginásio / Stand B</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Clock size={16} />
                <span>09:00 — 16:00</span>
              </div>
              <p className="text-xs md:text-sm">12 de setembro de 2025</p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 md:mb-4 text-base md:text-lg">Como Reservar</h4>
            <div className="space-y-2 text-gray-300 text-sm md:text-base">
              <p>✅ Reserva online no site</p>
              <p>📱 Ou pelo Instagram</p>
              <p>💰 Pague só na retirada</p>
              <p className="text-xs md:text-sm mt-3 md:mt-4 text-[var(--color-cookite-yellow)]">
                20% OFF até 10/09
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-gray-400 text-xs md:text-sm mb-2">
            Projeto JEPP — Sebrae
          </p>
          <div className="flex justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}