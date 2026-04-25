import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How does access to the tools work?", a: "After subscribing, you get instant access to the panel with all the tools included in your plan. Just click and start using." },
  { q: "Is the platform safe to use?", a: "Yes! We use top-grade encryption and enterprise security protocols to protect your data and accounts." },
  { q: "Can I cancel at any time?", a: "Absolutely. There's no commitment. Cancel whenever you want directly from the panel, with no bureaucracy." },
  { q: "Are the tools updated?", a: "Yes, we always keep all tools on the latest versions and add new ones regularly." },
  { q: "Do I have support if I need help?", a: "Yes! We offer personalized support via WhatsApp and email for all plans." },
  { q: "Is there a guarantee?", a: "Yes! We offer an unconditional 7-day guarantee. If for any reason you're not satisfied, we refund 100% of your money — no questions, no bureaucracy." },
];

const FAQSectionEN = () => {
  return (
    <section id="faq" className="relative py-12 md:py-16 px-3 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Frequently Asked <span className="text-white/70">Questions</span>
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

export default FAQSectionEN;
