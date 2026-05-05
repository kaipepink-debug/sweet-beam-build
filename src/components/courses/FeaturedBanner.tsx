import { Course } from "@/data/coursesData";
import { Play, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedBannerProps {
  course: Course;
  onPlay: (courseId: string) => void;
}

export default function FeaturedBanner({ course, onPlay }: FeaturedBannerProps) {
  return (
    <div className="relative w-full h-[340px] md:h-[440px] overflow-hidden">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      <div className="relative z-10 h-full flex items-end pb-10 md:pb-14 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl space-y-4"
        >
          {course.tag && (
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded bg-primary text-primary-foreground">
              {course.tag}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
            {course.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {course.modules.length} módulos · {course.totalLessons} aulas
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {course.totalDuration}
            </span>
          </div>
          <button
            onClick={() => onPlay(course.id)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Assistir Agora
          </button>
        </motion.div>
      </div>
    </div>
  );
}
