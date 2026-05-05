import { useNavigate } from "react-router-dom";
import { GraduationCap, PlayCircle, Clock, ExternalLink } from "lucide-react";
import { courses } from "@/data/coursesData";

export default function DashboardAreaMembros() {
  const navigate = useNavigate();

  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  const totalCourses = courses.length;
  const categorias = Array.from(new Set(courses.map((c) => c.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1.5 font-light">
            Área de membros
          </p>
          <h1 className="text-3xl md:text-4xl font-extralight text-foreground tracking-tight">
            Cursos & Conteúdos
          </h1>
        </div>
        <button
          onClick={() => window.open("/cursos", "_blank")}
          className="flex items-center gap-2 px-4 h-10 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 text-sm transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
          Ver como cliente
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Cursos disponíveis", value: String(totalCourses), icon: GraduationCap, color: "hsl(270, 100%, 65%)" },
          { title: "Aulas totais", value: String(totalLessons), icon: PlayCircle, color: "hsl(142, 71%, 45%)" },
          { title: "Categorias", value: String(categorias.length), icon: Clock, color: "hsl(217, 91%, 60%)" },
        ].map((m) => (
          <div
            key={m.title}
            className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 relative overflow-hidden"
          >
            <div
              className="absolute inset-x-0 top-0 h-px opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
            />
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-light">
                {m.title}
              </p>
            </div>
            <p className="text-2xl font-extralight tracking-tight tabular-nums text-foreground">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de cursos */}
      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-light mb-4">
          Catálogo de cursos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => window.open(`/cursos/${c.id}`, "_blank")}
              className="group rounded-xl border border-border/40 bg-background/40 overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(270_100%_55%/0.2)]"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                {c.tag && (
                  <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/80 text-primary-foreground font-medium backdrop-blur-sm">
                    {c.tag}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-primary/80 font-light">
                  {c.category}
                </p>
                <h3 className="text-sm font-medium text-foreground line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground/80 line-clamp-2 font-light">
                  {c.description}
                </p>
                <div className="flex items-center gap-3 pt-2 text-[11px] text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" strokeWidth={1.8} />
                    {c.totalLessons} aulas
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.8} />
                    {c.totalDuration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
