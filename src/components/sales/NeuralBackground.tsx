import { useEffect, useRef, useCallback } from "react";

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationId: number;
    const mouse = { x: -9999, y: -9999 };
    const MOUSE_RADIUS = 180;
    const PUSH_FORCE = 0.08;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 25 : 50;
    const CONNECTION_DIST = 120; // reduced from 150
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;

    const codeSnippets = [
      "const model = await tf.loadModel()",
      "neural.forward(input_tensor)",
      "loss = criterion(output, target)",
      "optimizer.step()",
      "pred = model.predict(X_test)",
      "embedding = encoder(tokens)",
      "attention = softmax(Q @ K.T)",
      "gradient = backward(loss)",
    ];

    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    let codeLines: { y: number; x: number; speed: number; text: string; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
      }));
      codeLines = Array.from({ length: 8 }, () => ({
        y: Math.random() * canvas.height,
        x: Math.random() * canvas.width,
        speed: Math.random() * 0.3 + 0.1,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        opacity: Math.random() * 0.1 + 0.03,
      }));
    };

    // Throttle mouse events
    let mouseThrottle = 0;
    const onMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - mouseThrottle < 16) return; // ~60fps
      mouseThrottle = now;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // Frame skip for lower-end devices
    let lastFrame = 0;
    const TARGET_FPS = 30;
    const FRAME_TIME = 1000 / TARGET_FPS;

    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw);

      const delta = timestamp - lastFrame;
      if (delta < FRAME_TIME) return;
      lastFrame = timestamp - (delta % FRAME_TIME);

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Code lines
      ctx.font = "13px monospace";
      for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        ctx.fillStyle = `rgba(150,150,150,${line.opacity})`;
        ctx.fillText(line.text, line.x, line.y);
        line.y += line.speed;
        if (line.y > h + 20) {
          line.y = -20;
          line.x = Math.random() * w;
          line.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
      }

      const mouseActive = mouse.x > 0 && mouse.y > 0;

      // Particles
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

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Simple dot — no radial gradient per particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,180,180,0.4)";
        ctx.fill();
      }

      // Connections — use squared distance to avoid sqrt
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST_SQ) {
            const alpha = 0.06 * (1 - Math.sqrt(distSq) / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(160,160,160,${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Mouse glow — simplified
      if (mouseActive) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        glow.addColorStop(0, "rgba(180,0,255,0.03)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    init();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: "#000000", willChange: "auto" }}
    />
  );
};

export default NeuralBackground;
