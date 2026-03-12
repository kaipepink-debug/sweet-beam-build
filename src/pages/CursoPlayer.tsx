import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courses, Lesson } from "@/data/coursesData";
import CourseSidebar from "@/components/courses/CourseSidebar";
import CoursePlayer from "@/components/courses/CoursePlayer";
import { Menu, X } from "lucide-react";

export default function CursoPlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const course = courses.find((c) => c.id === courseId);

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  const [currentLessonId, setCurrentLessonId] = useState(() => allLessons[0]?.id || "");

  const currentFlatIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  const { currentModuleIndex, currentLessonIndex, totalLessonsInModule } = useMemo(() => {
    if (!course) return { currentModuleIndex: 0, currentLessonIndex: 0, totalLessonsInModule: 0 };
    for (let mi = 0; mi < course.modules.length; mi++) {
      const li = course.modules[mi].lessons.findIndex((l) => l.id === currentLessonId);
      if (li !== -1) {
        return { currentModuleIndex: mi, currentLessonIndex: li, totalLessonsInModule: course.modules[mi].lessons.length };
      }
    }
    return { currentModuleIndex: 0, currentLessonIndex: 0, totalLessonsInModule: 0 };
  }, [course, currentLessonId]);

  const currentLesson = allLessons[currentFlatIndex] || allLessons[0];

  const handleComplete = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      const newIndex = direction === "prev" ? currentFlatIndex - 1 : currentFlatIndex + 1;
      if (newIndex >= 0 && newIndex < allLessons.length) {
        setCurrentLessonId(allLessons[newIndex].id);
      }
    },
    [currentFlatIndex, allLessons]
  );

  const handleLessonSelect = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    setMobileSidebar(false);
  }, []);

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-foreground font-medium">Curso não encontrado</p>
          <button onClick={() => navigate("/cursos")} className="text-primary text-sm hover:underline">
            Voltar aos cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-[320px]" : "w-0"
        } overflow-hidden`}
      >
        <div className="w-[320px] h-screen sticky top-0 overflow-hidden">
          <CourseSidebar
            course={course}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            onLessonSelect={handleLessonSelect}
            onBack={() => navigate("/cursos")}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] animate-slide-in-right">
            <CourseSidebar
              course={course}
              currentLessonId={currentLessonId}
              completedLessons={completedLessons}
              onLessonSelect={handleLessonSelect}
              onBack={() => navigate("/cursos")}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileSidebar(true);
              } else {
                setSidebarOpen((p) => !p);
              }
            }}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs text-muted-foreground truncate">{course.title}</span>
        </div>

        <CoursePlayer
          course={course}
          currentLesson={currentLesson}
          currentModuleIndex={currentModuleIndex}
          currentLessonIndex={currentLessonIndex}
          totalLessonsInModule={totalLessonsInModule}
          completedLessons={completedLessons}
          onComplete={handleComplete}
          onNavigate={handleNavigate}
          hasPrev={currentFlatIndex > 0}
          hasNext={currentFlatIndex < allLessons.length - 1}
        />
      </div>
    </div>
  );
}
