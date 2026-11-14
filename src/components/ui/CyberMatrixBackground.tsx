import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Glyph {
  x: number;
  y: number;
  vy: number;
  text: string;
  alpha: number;
  size: number;
}

export const CyberMatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for interactive field
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particleCount = Math.min(55, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];
    const colors = ['#00D4FF', '#38BDF8', '#818CF8', '#10B981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Floating cryptographic hex glyphs
    const glyphSymbols = ['0x', 'FF', 'AES', '256', 'SHA', 'GCM', '101', '010', 'KEK', 'DEK', '🔒', 'λ'];
    const glyphs: Glyph[] = [];
    const glyphCount = 14;

    for (let i = 0; i < glyphCount; i++) {
      glyphs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -(Math.random() * 0.35 + 0.15),
        text: glyphSymbols[Math.floor(Math.random() * glyphSymbols.length)],
        alpha: Math.random() * 0.18 + 0.05,
        size: Math.floor(Math.random() * 4 + 10),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating glyphs
      ctx.font = '10px monospace';
      for (const g of glyphs) {
        g.y += g.vy;
        if (g.y < -20) {
          g.y = height + 20;
          g.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(0, 212, 255, ${g.alpha})`;
        ctx.fillText(g.text, g.x, g.y);
      }

      // Draw constellation links
      const maxDist = 130;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse interaction
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 120) {
          const force = (120 - distMouse) / 120;
          p1.x -= (dxMouse / distMouse) * force * 1.5;
          p1.y -= (dyMouse / distMouse) * force * 1.5;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();

        // Connect with other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const linkAlpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${linkAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
      style={{ willChange: 'transform' }}
    />
  );
};
