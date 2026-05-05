import { Course, Lesson } from "@/data/coursesData";
import { CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CoursePlayerProps {
  course: Course;
  currentLesson: Lesson;
  currentModuleIndex: number;
  currentLessonIndex: number;
  totalLessonsInModule: number;
  completedLessons: Set<string>;
  onComplete: (lessonId: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function CoursePlayer({
  course,
  currentLesson,
  currentModuleIndex,
  currentLessonIndex,
  totalLessonsInModule,
  completedLessons,
  onComplete,
  onNavigate,
  hasPrev,
  hasNext,
}: CoursePlayerProps) {
  const [activeTab, setActiveTab] = useState<"materials" | "comments" | "transcript">("materials");
  const isCompleted = completedLessons.has(currentLesson.id);

  const tabs = [
    { id: "materials" as const, label: "Materiais", icon: Download },
    { id: "comments" as const, label: "Comentários", icon: MessageSquare },
    { id: "transcript" as const, label: "Transcrição", icon: FileText },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Video Player */}
      <div className="relative w-full bg-black aspect-video">
        <video
          key={currentLesson.id}
          className="w-full h-full"
          controls
          autoPlay
          src={currentLesson.videoUrl}
        >
          Seu navegador não suporta vídeos.
        </video>
      </div>

      {/* Lesson Info */}
      <div className="p-4 md:p-6 space-y-5 max-w-4xl">
        {/* Title & Meta */}
        <div className="space-y-2">
          <h1 className="text-lg md:text-xl font-bold text-foreground">{currentLesson.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Módulo {currentModuleIndex + 1} · {course.modules[currentModuleIndex].title}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>Aula {currentLessonIndex + 1} de {totalLessonsInModule}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{currentLesson.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{currentLesson.description}</p>

        {/* CTA personalizado da aula */}
        {currentLesson.cta && (
          <a
            href={currentLesson.cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 transition-opacity shadow-[0_0_20px_hsl(270_100%_55%/0.35)]"
          >
            {currentLesson.cta.label}
          </a>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onComplete(currentLesson.id)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isCompleted
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : "bg-green-600 text-white hover:bg-green-500 shadow-[0_0_20px_hsl(142_71%_45%/0.35)]"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? "Concluída" : "Marcar como Concluída"}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => onNavigate("prev")}
              disabled={!hasPrev}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => onNavigate("next")}
              disabled={!hasNext}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border/50 pt-4 space-y-4">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[120px]">
            {activeTab === "materials" && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Slides da Aula</p>
                    <p className="text-[10px] text-muted-foreground">PDF · 2.4 MB</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Material Complementar</p>
                    <p className="text-[10px] text-muted-foreground">PDF · 1.1 MB</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>Olá, bem-vindo à aula "{currentLesson.title}". Nesta aula vamos explorar conceitos fundamentais que vão transformar a forma como você trabalha.</p>
                <p>Vamos começar entendendo o contexto e a importância deste tema no mercado atual...</p>
                <p className="text-muted-foreground/50 italic">Transcrição completa disponível em breve.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
