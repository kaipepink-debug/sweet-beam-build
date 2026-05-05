export interface LessonCta {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  completed: boolean;
  cta?: LessonCta;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  modules: Module[];
  totalLessons: number;
  totalDuration: string;
  featured?: boolean;
  tag?: string;
}

const makeLessons = (moduleId: string, titles: string[]): Lesson[] =>
  titles.map((t, i) => ({
    id: `${moduleId}-l${i + 1}`,
    title: t,
    duration: `${4 + Math.floor(Math.random() * 15)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    description: `Nesta aula você vai aprender sobre ${t.toLowerCase()}.`,
    completed: false,
  }));

export const courses: Course[] = [
  {
    id: "vendas-consultivas",
    title: "Vendas Consultivas com IA",
    description: "Domine técnicas de vendas consultivas potencializadas por inteligência artificial. Aprenda a qualificar leads, construir rapport e fechar negócios de alto valor.",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    category: "Vendas",
    featured: true,
    tag: "Mais Popular",
    totalLessons: 12,
    totalDuration: "4h 30min",
    modules: [
      { id: "vc-m1", title: "Fundamentos de Vendas Consultivas", lessons: makeLessons("vc-m1", ["Introdução às Vendas Consultivas", "Mindset do Vendedor de Alta Performance", "O Processo de Venda Consultiva"]) },
      { id: "vc-m2", title: "Qualificação e Prospecção", lessons: makeLessons("vc-m2", ["Perfil de Cliente Ideal (ICP)", "Técnicas de Prospecção Ativa", "Qualificação com BANT e GPCT"]) },
      { id: "vc-m3", title: "IA Aplicada a Vendas", lessons: makeLessons("vc-m3", ["Usando ChatGPT para Scripts", "Automação de Follow-ups", "Análise Preditiva de Leads"]) },
      { id: "vc-m4", title: "Fechamento e Pós-Venda", lessons: makeLessons("vc-m4", ["Técnicas de Fechamento", "Gestão de Objeções", "Customer Success com IA"]) },
    ],
  },
  {
    id: "sdr-outbound",
    title: "SDR Outbound: Do Zero ao Agendamento",
    description: "Torne-se um SDR de elite dominando cadências multicanal, cold calls e estratégias de outbound com IA.",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
    category: "SDR",
    tag: "Novo",
    totalLessons: 10,
    totalDuration: "3h 45min",
    modules: [
      { id: "sdr-m1", title: "Fundamentos do SDR", lessons: makeLessons("sdr-m1", ["O que faz um SDR", "Métricas e KPIs", "Ferramentas Essenciais"]) },
      { id: "sdr-m2", title: "Cadências e Outreach", lessons: makeLessons("sdr-m2", ["Estrutura de Cadências", "Cold Email que Converte", "LinkedIn como Canal de Vendas"]) },
      { id: "sdr-m3", title: "Cold Call Avançado", lessons: makeLessons("sdr-m3", ["Script de Cold Call", "Passando pelo Gatekeeper", "Agendamento Eficaz", "Roleplay e Prática"]) },
    ],
  },
  {
    id: "engenharia-prompt",
    title: "Engenharia de Prompt Avançada",
    description: "Aprenda a criar prompts poderosos para ChatGPT, Claude e outras IAs generativas. Maximize resultados com técnicas avançadas.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    category: "Engenharia de Prompt",
    totalLessons: 15,
    totalDuration: "5h 20min",
    modules: [
      { id: "ep-m1", title: "Fundamentos de Prompt", lessons: makeLessons("ep-m1", ["O que é Prompt Engineering", "Anatomia de um Prompt Eficaz", "Tipos de Prompts"]) },
      { id: "ep-m2", title: "Técnicas Avançadas", lessons: makeLessons("ep-m2", ["Chain of Thought", "Few-Shot Learning", "Role Playing com IA", "Prompt Chaining"]) },
      { id: "ep-m3", title: "Aplicações Práticas", lessons: makeLessons("ep-m3", ["Prompts para Copywriting", "Prompts para Análise de Dados", "Prompts para Automação", "Prompts para Código"]) },
      { id: "ep-m4", title: "Projeto Final", lessons: makeLessons("ep-m4", ["Criando seu Toolkit de Prompts", "Automatizando Workflows", "Apresentação e Feedback", "Certificação"]) },
    ],
  },
  {
    id: "suporte-ia",
    title: "Suporte ao Cliente com IA",
    description: "Transforme seu atendimento com chatbots inteligentes, automação de tickets e análise de sentimento.",
    thumbnail: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=600&q=80",
    category: "Suporte",
    totalLessons: 8,
    totalDuration: "3h 10min",
    modules: [
      { id: "sup-m1", title: "Fundamentos do Suporte com IA", lessons: makeLessons("sup-m1", ["Evolução do Atendimento", "Chatbots vs Humanos", "Métricas de Satisfação"]) },
      { id: "sup-m2", title: "Implementação Prática", lessons: makeLessons("sup-m2", ["Configurando Chatbots", "Automação de Tickets", "Análise de Sentimento", "Escalação Inteligente", "Base de Conhecimento com IA"]) },
    ],
  },
  {
    id: "agendamento-inteligente",
    title: "Agendamento Inteligente",
    description: "Domine ferramentas e estratégias de agendamento automatizado para maximizar conversões e reduzir no-shows.",
    thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80",
    category: "Agendamento",
    totalLessons: 6,
    totalDuration: "2h 15min",
    modules: [
      { id: "ag-m1", title: "Estratégias de Agendamento", lessons: makeLessons("ag-m1", ["Funil de Agendamento", "Reduzindo No-Shows", "Follow-up Automatizado"]) },
      { id: "ag-m2", title: "Ferramentas e Automação", lessons: makeLessons("ag-m2", ["Calendly e Alternativas", "Integração com CRM", "Fluxos Automatizados"]) },
    ],
  },
  {
    id: "credenciais-ai",
    title: "Credenciais e Certificações em IA",
    description: "Guia completo sobre as principais certificações em IA do mercado e como se preparar para cada uma.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    category: "Credenciais",
    totalLessons: 7,
    totalDuration: "2h 50min",
    modules: [
      { id: "cr-m1", title: "Panorama das Certificações", lessons: makeLessons("cr-m1", ["Certificações mais Valorizadas", "Como Escolher sua Certificação", "Preparação e Estudos"]) },
      { id: "cr-m2", title: "Certificações Práticas", lessons: makeLessons("cr-m2", ["Google AI Certification", "Microsoft AI Fundamentals", "AWS Machine Learning", "HubSpot AI Marketing"]) },
    ],
  },
  {
    id: "bonus-automacao",
    title: "Bônus: Automação Total com N8N",
    description: "Curso bônus exclusivo sobre automação de processos comerciais utilizando N8N e integrações com IA.",
    thumbnail: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&q=80",
    category: "Bônus",
    tag: "Bônus",
    totalLessons: 5,
    totalDuration: "1h 40min",
    modules: [
      { id: "bn-m1", title: "Introdução ao N8N", lessons: makeLessons("bn-m1", ["O que é N8N", "Instalação e Setup"]) },
      { id: "bn-m2", title: "Automações Comerciais", lessons: makeLessons("bn-m2", ["Automação de Leads", "Integração com WhatsApp", "Dashboards Automatizados"]) },
    ],
  },
  {
    id: "social-selling",
    title: "Social Selling no LinkedIn",
    description: "Transforme seu LinkedIn em uma máquina de vendas com estratégias de conteúdo e prospecção social.",
    thumbnail: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=600&q=80",
    category: "Vendas",
    totalLessons: 9,
    totalDuration: "3h 30min",
    modules: [
      { id: "ss-m1", title: "Perfil que Vende", lessons: makeLessons("ss-m1", ["Otimização de Perfil", "Personal Branding", "Estratégia de Conteúdo"]) },
      { id: "ss-m2", title: "Prospecção Social", lessons: makeLessons("ss-m2", ["InMail Estratégico", "Engajamento que Converte", "Networking Digital"]) },
      { id: "ss-m3", title: "Automação no LinkedIn", lessons: makeLessons("ss-m3", ["Ferramentas de Automação", "Sequências de Conexão", "Métricas e Otimização"]) },
    ],
  },
];

export const categories = [
  "Todos",
  "Vendas",
  "SDR",
  "Suporte",
  "Agendamento",
  "Engenharia de Prompt",
  "Credenciais",
  "Bônus",
];
