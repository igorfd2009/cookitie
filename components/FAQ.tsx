import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Posso pagar antecipado?",
      answer: "Não, os pagamentos serão feitos apenas no dia do evento por PIX ou em dinheiro no stand."
    },
    {
      question: "Tem embalagem para presente?",
      answer: "Sim! Peça no Instagram @cookite_oficial que preparamos uma embalagem especial."
    },
    {
      question: "Posso alterar meu pedido depois?",
      answer: "Sim, entre em contato pelo Instagram @cookite_oficial até 48h antes do evento."
    },
    {
      question: "Como funciona o desconto de 20%?",
      answer: "O desconto é aplicado automaticamente para pedidos feitos até 10 de setembro de 2025 via Instagram."
    },
    {
      question: "E se eu não conseguir retirar no horário combinado?",
      answer: "Você pode retirar em qualquer horário entre 09:00 e 16:00 no dia do evento."
    },
    {
      question: "Os doces são feitos por vocês?",
      answer: "Sim! Todos os doces são feitos artesanalmente pelos alunos participantes do JEPP com muito carinho."
    }
  ];

  return (
    <section className="py-12 md:py-16 px-4 bg-[var(--color-cookite-gray)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="mb-3 md:mb-4 text-gray-800 text-2xl md:text-3xl">Perguntas Frequentes</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Tire suas dúvidas sobre os produtos e o processo de pedido
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-xl md:rounded-2xl px-4 md:px-6 shadow-sm border-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AccordionTrigger className="text-left hover:no-underline py-4 md:py-6 text-sm md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 md:pb-6 text-sm md:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}