import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { courses, categories } from "@/data/coursesData";
import FeaturedBanner from "@/components/courses/FeaturedBanner";
import CourseRow from "@/components/courses/CourseRow";

export default function Cursos() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    if (!localStorage.getItem("naut_subscription")) {
      navigate("/usuario?redirect=/cursos", { replace: true });
    }
  }, [navigate]);

  const featured = courses.find((c) => c.featured) || courses[0];

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === "Todos" || c.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/cursos/${courseId}`);
  };

  // Group by category for row display
  const grouped = useMemo(() => {
    const map: Record<string, typeof courses> = {};
    for (const c of filtered) {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    }
    return map;
  }, [filtered]);

  const isFiltering = search || activeCategory !== "Todos";

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Banner */}
      {!isFiltering && <FeaturedBanner course={featured} onPlay={handleCourseClick} />}

      {/* Search & Filters */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide w-full md:w-auto" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Rows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="py-6 space-y-8 pb-16"
      >
        {isFiltering ? (
          filtered.length > 0 ? (
            Object.entries(grouped).map(([category, categoryCourses]) => (
              <CourseRow
                key={category}
                title={category}
                courses={categoryCourses}
                onCourseClick={handleCourseClick}
              />
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhum curso encontrado.</p>
            </div>
          )
        ) : (
          <CourseRow title="Afiliados" courses={courses} onCourseClick={handleCourseClick} />
        )}
      </motion.div>
    </div>
  );
}
