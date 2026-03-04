import { useEffect, useRef } from "react";

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; baseX: number; baseY: number }[] = [];
    let codeLines: { y: number; x: number; speed: number; text: string; opacity: number }[] = [];
    const mouse = { x: -9999, y: -9999 };
    const MOUSE_RADIUS = 180;
    const PUSH_FORCE = 0.08;

    const codeSnippets = [
      "const model = await tf.loadModel()",
      "neural.forward(input_tensor)",
      "loss = criterion(output, target)",
      "optimizer.step()",
      "pred = model.predict(X_test)",
      "embedding = encoder(tokens)",
      "attention = softmax(Q @ K.T)",
      "gradient = backward(loss)",
      "weights = layer.parameters()",
      "batch = DataLoader(dataset)",
      "transform = normalize(data)",
      "accuracy = evaluate(model)",
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 80 }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
        };
      });
      codeLines = Array.from({ length: 12 }, () => ({
        y: Math.random() * canvas.height,
        x: Math.random() * canvas.width,
        speed: Math.random() * 0.3 + 0.1,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        opacity: Math.random() * 0.12 + 0.03,
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw code lines flowing
      codeLines.forEach((line) => {
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(150, 150, 150, ${line.opacity})`;
        ctx.fillText(line.text, line.x, line.y);
        line.y += line.speed;
        if (line.y > canvas.height + 20) {
          line.y = -20;
          line.x = Math.random() * canvas.width;
          line.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
      });

      // Draw particles with mouse interaction
      particles.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * PUSH_FORCE;
          p.vy += Math.sin(angle) * force * PUSH_FORCE;
        }

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Gentle return to natural drift
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 180, 180, 0.5)";
        ctx.fill();

        // Glow - brighter when near mouse
        const glowIntensity = dist < MOUSE_RADIUS ? 0.15 + (1 - dist / MOUSE_RADIUS) * 0.15 : 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, `rgba(180, 180, 180, ${glowIntensity})`);
        g.addColorStop(1, "rgba(180, 180, 180, 0)");
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(160, 160, 160, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse glow
      if (mouse.x > 0 && mouse.y > 0) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        glow.addColorStop(0, "rgba(180, 0, 255, 0.03)");
        glow.addColorStop(0.5, "rgba(180, 0, 255, 0.01)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: "#000000" }}
    />
  );
};

export default NeuralBackground;
