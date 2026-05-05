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
    id: "afiliado-de-sucesso",
    title: "Afiliado de sucesso - Faça R$2500 há R$3000 por mês",
    description: "Aprenda na prática como se afiliar à RatarIA pela Naut e começar a faturar entre R$2.500 e R$3.000 por mês como afiliado oficial.",
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    category: "Afiliados",
    featured: true,
    tag: "Destaque",
    totalLessons: 2,
    totalDuration: "—",
    modules: [
      {
        id: "afs-m1",
        title: "Como se afiliar",
        lessons: [
          {
            id: "afs-m1-l1",
            title: "Como se afiliar no sistema - Método 1",
            duration: "—",
            videoUrl: "/aulas/aula-1.mp4",
            description: "Passo a passo para solicitar sua afiliação à RatarIA pela plataforma Naut.",
            completed: false,
            cta: {
              label: "Solicitar afiliação pela Naut",
              url: "https://navenaut.com/affiliates/products",
            },
          },
          {
            id: "afs-m1-l2",
            title: "Como se afiliar no sistema - Método 2",
            duration: "—",
            videoUrl: "/aulas/aula-2.mp4",
            description: "Nesse outro método ensinamos como se tornar um afiliado mais profissional, com seu próprio painel.",
            completed: false,
          },
        ],
      },
    ],
  },
];

export const categories = ["Todos", "Afiliados"];
