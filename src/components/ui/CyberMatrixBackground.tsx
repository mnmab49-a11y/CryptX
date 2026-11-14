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

interface FloatingBinary {
  x: number;
  y: number;
  vy: number;
  vx: number;
  text: string;
  alpha: number;
  size: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface BinaryColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  fontSize: number;
  alpha: number;
  glowColor: string;
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
      initElements();
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

    // --- 1. Constellation Particles ---
    let particles: Particle[] = [];
    // --- 2. Floating Rising/Falling Binary Snippets (01, 10, 0101, etc.) ---
    let floatingBinaries: FloatingBinary[] = [];
    // --- 3. Matrix Digital Stream Columns ---
    let columns: BinaryColumn[] = [];

    const binaryPresets = [
      '01', '10', '00', '11', '0101', '1010', '1100', '0011',
      '0110', '1001', '0x1F', '0xFF', 'AES', '256', 'SHA', 'GCM', '100101', '011010'
    ];

    const cyberColors = ['#00D4FF', '#38BDF8', '#10B981', '#6366F1', '#A855F7'];

    const initElements = () => {
      // Particles
      const particleCount = Math.min(45, Math.floor((width * height) / 25000));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.4 + 0.2,
          color: cyberColors[Math.floor(Math.random() * cyberColors.length)],
        });
      }

      // Floating Rising & Falling Binary Digits (01 10 0101)
      const binaryCount = Math.min(28, Math.floor(width / 50));
      floatingBinaries = [];
      for (let i = 0; i < binaryCount; i++) {
        const isRising = Math.random() > 0.35; // 65% rise, 35% fall
        floatingBinaries.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: isRising ? -(Math.random() * 0.6 + 0.25) : (Math.random() * 0.6 + 0.25),
          vx: (Math.random() - 0.5) * 0.2,
          text: binaryPresets[Math.floor(Math.random() * binaryPresets.length)],
          alpha: Math.random() * 0.35 + 0.15,
          size: Math.floor(Math.random() * 5 + 11),
          color: Math.random() > 0.4 ? '#00D4FF' : '#10B981',
          pulseSpeed: Math.random() * 0.03 + 0.015,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Matrix Digital Streams (Falling 01 columns)
      const colSpacing = 65;
      const colCount = Math.floor(width / colSpacing);
      columns = [];
      for (let i = 0; i < colCount; i++) {
        const charCount = Math.floor(Math.random() * 8 + 6);
        const chars: string[] = [];
        for (let j = 0; j < charCount; j++) {
          chars.push(Math.random() > 0.5 ? '1' : '0');
        }
        columns.push({
          x: i * colSpacing + Math.random() * 20,
          y: Math.random() * height - height,
          speed: Math.random() * 1.2 + 0.6,
          chars,
          fontSize: Math.floor(Math.random() * 3 + 11),
          alpha: Math.random() * 0.28 + 0.08,
          glowColor: Math.random() > 0.5 ? '#00D4FF' : '#10B981',
        });
      }
    };

    initElements();

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // --- 1. Render Matrix Vertical 01 Falling Columns ---
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed;

        // Reset column if it rolls past screen
        if (col.y > height + 150) {
          col.y = -150 - Math.random() * 200;
          col.x = Math.random() * width;
          // Randomize characters
          for (let c = 0; c < col.chars.length; c++) {
            col.chars[c] = Math.random() > 0.5 ? '1' : '0';
          }
        }

        // Periodically mutate a random digit
        if (frameCount % 18 === 0 && Math.random() > 0.7) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] = col.chars[randIdx] === '1' ? '0' : '1';
        }

        ctx.font = `${col.fontSize}px 'JetBrains Mono', Consolas, monospace`;

        for (let j = 0; j < col.chars.length; j++) {
          const charY = col.y + j * (col.fontSize + 4);
          if (charY < -20 || charY > height + 20) continue;

          // Head digit is brighter, tail digits fade out
          const isHead = j === col.chars.length - 1;
          const tailFade = (j + 1) / col.chars.length;

          if (isHead) {
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = col.glowColor;
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = col.glowColor;
            ctx.shadowBlur = 0;
          }

          ctx.globalAlpha = isHead ? Math.min(1, col.alpha * 2) : col.alpha * tailFade;
          ctx.fillText(col.chars[j], col.x, charY);
        }
        ctx.shadowBlur = 0;
      }

      // --- 2. Render Floating Rising / Falling 01 & Hex Badges ---
      for (let i = 0; i < floatingBinaries.length; i++) {
        const fb = floatingBinaries[i];
        fb.y += fb.vy;
        fb.x += fb.vx;
        fb.pulsePhase += fb.pulseSpeed;

        // Wrap around vertically
        if (fb.vy < 0 && fb.y < -30) {
          fb.y = height + 30;
          fb.x = Math.random() * width;
          fb.text = binaryPresets[Math.floor(Math.random() * binaryPresets.length)];
        } else if (fb.vy > 0 && fb.y > height + 30) {
          fb.y = -30;
          fb.x = Math.random() * width;
          fb.text = binaryPresets[Math.floor(Math.random() * binaryPresets.length)];
        }

        // Pulsing opacity
        const pulseAlpha = fb.alpha * (0.8 + 0.3 * Math.sin(fb.pulsePhase));

        ctx.font = `600 ${fb.size}px 'JetBrains Mono', Consolas, monospace`;
        ctx.fillStyle = fb.color;
        ctx.globalAlpha = pulseAlpha;
        ctx.shadowColor = fb.color;
        ctx.shadowBlur = 6;
        ctx.fillText(fb.text, fb.x, fb.y);
      }
      ctx.shadowBlur = 0;

      // --- 3. Render Constellation Network Particles & Links ---
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on borders
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Mouse interaction (repel gently)
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 110) {
          const force = (110 - distMouse) / 110;
          p1.x -= (dxMouse / distMouse) * force * 1.4;
          p1.y -= (dyMouse / distMouse) * force * 1.4;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const linkAlpha = (1 - dist / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${linkAlpha})`;
            ctx.lineWidth = 0.7;
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
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ willChange: 'transform' }}
    />
  );
};
