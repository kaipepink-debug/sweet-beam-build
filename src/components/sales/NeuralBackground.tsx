import { useEffect, useRef, useCallback } from "react";

interface NeuralBackgroundProps {
  variant?: "dark" | "light" | "dark-gray";
}

const NeuralBackground = ({ variant = "dark" }: NeuralBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const isLight = variant === "light";
    const isDarkGray = variant === "dark-gray";
    const bgColor = isLight ? "#f5f5f5" : isDarkGray ? "#151518" : "#000000";
    const fadeColor = isLight ? "rgba(245, 245, 245, 0.15)" : isDarkGray ? "rgba(21, 21, 24, 0.4)" : "rgba(0, 0, 0, 0.15)";
    const particleColor = isLight ? "rgba(180, 0, 255, 0.5)" : "rgba(180,180,180,0.4)";
    const connectionColor = isLight
      ? (alpha: number) => `rgba(180, 0, 255, ${alpha})`
      : (alpha: number) => `rgba(160,160,160,${alpha})`;
    const glowColor1 = isLight ? "rgba(180,0,255,0.18)" : isDarkGray ? "rgba(180,0,255,0.06)" : "rgba(180,0,255,0.12)";
    const glowColor2 = isLight ? "rgba(180,0,255,0.06)" : "rgba(180,0,255,0.02)";

    let animationId: number;
    const mouse = { x: -9999, y: -9999 };
    const MOUSE_RADIUS = 180;
    const PUSH_FORCE = 0.08;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 15 : 45;
    const CONNECTION_DIST = isMobile ? 100 : 120;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
    const TARGET_FPS = isMobile ? 20 : 30;
    const FRAME_TIME = 1000 / TARGET_FPS;

    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (canvas.width / canvas.height)));
      const rows = Math.ceil(PARTICLE_COUNT / cols);
      const cellW = canvas.width / cols;
      const cellH = canvas.height / rows;

      particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          x: cellW * (col + 0.2 + Math.random() * 0.6),
          y: cellH * (row + 0.2 + Math.random() * 0.6),
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 1.5 + 0.5,
        };
      });
    };

    let mouseThrottle = 0;
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - mouseThrottle < 32) return;
      mouseThrottle = now;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let lastFrame = 0;

    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw);

      const delta = timestamp - lastFrame;
      if (delta < FRAME_TIME) return;
      lastFrame = timestamp - (delta % FRAME_TIME);

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, w, h);

      const mouseActive = !isMobile && mouse.x > 0 && mouse.y > 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouseActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * PUSH_FORCE;
            p.vy += Math.sin(angle) * force * PUSH_FORCE;
          }
        }

        p.vx *= 0.995;
        p.vy *= 0.995;

        if (!isMobile) {
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed < 0.3) {
            const angle = Math.atan2(p.vy, p.vx);
            p.vx = Math.cos(angle) * 0.3;
            p.vy = Math.sin(angle) * 0.3;
          }
        }
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST_SQ) {
            const alpha = (isLight ? 0.12 : 0.06) * (1 - Math.sqrt(distSq) / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = connectionColor(alpha);
            ctx.stroke();
          }
        }
      }

      if (mouseActive) {
        const glowRadius = isDarkGray ? 100 : MOUSE_RADIUS;
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
        glow.addColorStop(0, glowColor1);
        glow.addColorStop(0.5, glowColor2);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    init();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    if (!isMobile) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("mouseleave", onMouseLeave);
    }
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [variant]);

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: variant === "light" ? "#f5f5f5" : variant === "dark-gray" ? "#151518" : "#000000", willChange: "auto" }}
    />
  );
};

export default NeuralBackground;
