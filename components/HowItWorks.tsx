import { ShoppingCart, CheckCircle, CreditCard, MapPin, Clock } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Reserve Online",
      description: "Escolha seus doces e complete sua reserva no site"
    },
    {
      icon: CheckCircle,
      title: "Confirmação",
      description: "Receba confirmação por WhatsApp"
    },
    {
      icon: MapPin,
      title: "Retire no Stand",
      description: "Escola Estadual Exemplo — Ginásio / Stand B"
    },
    {
      icon: CreditCard,
      title: "Pague na Retirada",
      description: "PIX ou dinheiro — 12/09 das 09:00 às 16:00"
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="mb-3 md:mb-4 text-gray-800 text-2xl md:text-3xl">Como funciona</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Processo simples e rápido para você garantir seus doces no JEPP
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center animate-fade-in-up bg-[var(--color-cookite-gray)] p-4 md:p-6 rounded-2xl relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connection Line for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-3 w-6 h-0.5 bg-[var(--color-cookite-blue)] opacity-30"></div>
              )}
              
              {/* Connection Line for Mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-[var(--color-cookite-blue)] opacity-30"></div>
              )}
              
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--color-cookite-blue)] rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <step.icon className="text-white" size={20} />
              </div>
              <div className="bg-white rounded-lg p-2 mb-2">
                <span className="text-xs text-[var(--color-cookite-blue)] font-medium">PASSO {index + 1}</span>
              </div>
              <h3 className="mb-2 text-gray-800 text-sm md:text-base">{step.title}</h3>
              <p className="text-xs md:text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 p-4 md:p-6 bg-[var(--color-cookite-yellow)] rounded-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock size={20} className="text-gray-800" />
            <h3 className="text-gray-800 text-base md:text-lg">Nota importante</h3>
          </div>
          <p className="text-gray-800 text-sm md:text-base">
            <strong>Reservas feitas até 10/09/2025 recebem 20% de desconto automático.</strong> 
            Pagamento apenas na retirada (PIX ou dinheiro).
          </p>
        </div>
      </div>
    </section>
  );
}