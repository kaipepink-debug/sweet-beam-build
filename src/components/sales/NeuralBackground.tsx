import { useEffect, useRef } from "react";

const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    let codeLines: { y: number; x: number; speed: number; text: string; opacity: number }[] = [];

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
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
      }));
      codeLines = Array.from({ length: 12 }, () => ({
        y: Math.random() * canvas.height,
        x: Math.random() * canvas.width,
        speed: Math.random() * 0.3 + 0.1,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        opacity: Math.random() * 0.12 + 0.03,
      }));
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

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 180, 180, 0.5)";
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, "rgba(180, 180, 180, 0.1)");
        g.addColorStop(1, "rgba(180, 180, 180, 0)");
        ctx.fillStyle = g;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
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

      animationId = requestAnimationFrame(draw);
    };

    init();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
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
