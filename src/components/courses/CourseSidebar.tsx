import { Course, Lesson } from "@/data/coursesData";
import { ChevronDown, CheckCircle2, Circle, PlayCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CourseSidebarProps {
  course: Course;
  currentLessonId: string;
  completedLessons: Set<string>;
  onLessonSelect: (lessonId: string) => void;
  onBack: () => void;
}

export default function CourseSidebar({
  course,
  currentLessonId,
  completedLessons,
  onLessonSelect,
  onBack,
}: CourseSidebarProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const m of course.modules) {
      if (m.lessons.some((l) => l.id === currentLessonId)) {
        initial.add(m.id);
      }
    }
    return initial;
  });

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completed = completedLessons.size;
  const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col bg-card border-r border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 space-y-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar aos cursos
        </button>
        <h2 className="text-sm font-bold text-foreground leading-tight">{course.title}</h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{completed}/{totalLessons} aulas concluídas</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="flex-1 overflow-y-auto">
        {course.modules.map((module, mi) => {
          const isOpen = openModules.has(module.id);
          const moduleCompleted = module.lessons.every((l) => completedLessons.has(l.id));

          return (
            <div key={module.id} className="border-b border-border/30">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                    moduleCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {mi + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground truncate">{module.title}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform flex-shrink-0", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="pb-2">
                  {module.lessons.map((lesson, li) => {
                    const isCurrent = lesson.id === currentLessonId;
                    const isCompleted = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onLessonSelect(lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors",
                          isCurrent
                            ? "bg-primary/10 border-l-2 border-primary"
                            : "hover:bg-muted/30 border-l-2 border-transparent"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : isCurrent ? (
                          <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-[11px] truncate", isCurrent ? "text-primary font-medium" : "text-foreground/80")}>
                            {li + 1}. {lesson.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{lesson.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
