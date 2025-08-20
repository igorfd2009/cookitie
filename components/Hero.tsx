import { Button } from "./ui/button";
import { ShoppingCart, ArrowDown } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  const scrollToReservation = () => {
    document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-14 md:pt-16 pb-8 md:pb-12 px-4 bg-gradient-to-br from-[var(--color-cookite-gray)] to-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="text-center lg:text-left animate-fade-in-up order-2 lg:order-1">
            <h1 className="mb-4 md:mb-6 text-gray-800 text-2xl md:text-4xl lg:text-5xl leading-tight">
              Cookite — Doces artesanais para adoçar o JEPP
            </h1>
            <p className="mb-6 md:mb-8 text-gray-600 text-base md:text-lg">
              Palha italiana, cookie, cake pop e biscoito amantegado. Reserve online e garanta 20% de desconto.
            </p>
            <div className="flex flex-col gap-3 justify-center lg:justify-start">
              <Button 
                onClick={scrollToReservation}
                size="lg"
                className="bg-[var(--color-cookite-blue)] hover:bg-[var(--color-cookite-blue-hover)] text-white rounded-2xl py-3 md:py-4 text-base md:text-lg"
              >
                <ShoppingCart size={20} className="mr-2" />
                Fazer Reserva Online
              </Button>
              <Button 
                onClick={scrollToProducts}
                variant="outline"
                size="lg"
                className="border-2 border-[var(--color-cookite-yellow)] text-gray-700 hover:bg-[var(--color-cookite-yellow)] rounded-2xl py-3 md:py-4 text-base md:text-lg"
              >
                <ArrowDown size={20} className="mr-2" />
                Ver produtos
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end animate-fade-in-up order-1 lg:order-2">
            <div className="relative max-w-xs md:max-w-md lg:max-w-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1587736797692-7f0c8ab97fc1?w=500&h=400&fit=crop&crop=center"
                alt="Doces artesanais da Cookite - palha italiana, cookies, cake pops e biscoitos"
                className="rounded-3xl shadow-xl w-full"
                width={500}
                height={400}
              />
              <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-[var(--color-cookite-yellow)] text-gray-800 p-2 md:p-3 rounded-full shadow-lg animate-pulse-glow">
                <p className="text-sm md:text-base font-medium">20% OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}