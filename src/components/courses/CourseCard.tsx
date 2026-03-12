import { Course } from "@/data/coursesData";
import { Play, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2 }}
      className="group relative flex-shrink-0 w-[220px] md:w-[280px] cursor-pointer"
      onClick={() => onClick(course.id)}
    >
      <div className="relative rounded-lg overflow-hidden bg-card border border-border/50 shadow-lg transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:border-primary/40">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>
          {course.tag && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-primary text-primary-foreground">
              {course.tag}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {course.title}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {course.modules.length} módulos · {course.totalLessons} aulas
            </span>
            <span>{course.totalDuration}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
