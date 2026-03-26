import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Como funciona o acesso às ferramentas?", a: "Após a assinatura, você recebe acesso imediato ao painel com todas as ferramentas inclusas no seu plano. Basta clicar e começar a usar." },
  { q: "É seguro utilizar a plataforma?", a: "Sim! Utilizamos criptografia de ponta e protocolos de segurança enterprise para proteger seus dados e acessos." },
  { q: "Posso cancelar a qualquer momento?", a: "Absolutamente. Não há fidelidade. Cancele quando quiser diretamente pelo painel, sem burocracia." },
  { q: "As ferramentas são atualizadas?", a: "Sim, mantemos todas as ferramentas sempre nas versões mais recentes e adicionamos novas regularmente." },
  { q: "Tenho suporte se precisar de ajuda?", a: "Sim! Oferecemos suporte personalizado via WhatsApp e e-mail para todos os planos." },
  { q: "Existe garantia?", a: "Sim! Oferecemos garantia incondicional de 7 dias. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro, sem perguntas e sem burocracia." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-12 md:py-16 px-3 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Perguntas <span className="text-white/70">Frequentes</span>
          </h2>
        </div>

        <div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/5 rounded-lg px-4 md:px-5 hover:border-white/10 transition-colors purple-hover-glow"
                style={{ background: "rgba(10, 10, 10, 0.5)" }}
              >
                <AccordionTrigger className="text-white/70 text-sm md:text-xs font-medium hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/30 text-sm md:text-xs leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
