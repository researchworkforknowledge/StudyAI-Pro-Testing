import React, { useEffect, useRef } from "react";

interface WorkspaceAtmosphereProps {
  theme: "light" | "dark";
}

export default function WorkspaceAtmosphere({ theme }: WorkspaceAtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Track state of the mouse
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovering: false,
      pressure: 0,
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleGlobalMouseLeave = () => {
      mouse.isHovering = false;
    };

    // Clicking initiates a soft interactive shockwave wave
    interface CircularWave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      speed: number;
    }
    const waves: CircularWave[] = [];

    const handleGlobalMouseDown = (e: MouseEvent) => {
      waves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: isMobile ? 120 : 280,
        alpha: 0.35,
        speed: 3.5,
      });
      mouse.pressure = 1.0;
    };

    const handleGlobalMouseUp = () => {
      mouse.pressure = 0.0;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove, { passive: true });
    window.addEventListener("mousedown", handleGlobalMouseDown, { passive: true });
    window.addEventListener("mouseup", handleGlobalMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleGlobalMouseLeave, { passive: true });

    // Premium micro-particles representing futuristic stardust
    class Spec {
      x: number;
      y: number;
      baseSize: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      baseAlpha: number;
      pulseSpeed: number;
      color: string;
      depth: number; // 1 = deep (slow), 2 = mid, 3 = near (interactive)
      offsetX: number = 0;
      offsetY: number = 0;

      constructor() {
        const dRand = Math.random();
        if (dRand < 0.6 || isMobile) {
          this.depth = 1;
          this.baseSize = Math.random() * 0.7 + 0.3;
          this.vx = (Math.random() - 0.5) * 0.04;
          this.vy = -(Math.random() * 0.05 + 0.01);
          this.baseAlpha = Math.random() * 0.2 + 0.05;
        } else if (dRand < 0.9) {
          this.depth = 2;
          this.baseSize = Math.random() * 1.1 + 0.6;
          this.vx = (Math.random() - 0.5) * 0.12;
          this.vy = -(Math.random() * 0.15 + 0.04);
          this.baseAlpha = Math.random() * 0.35 + 0.1;
        } else {
          this.depth = 3;
          this.baseSize = Math.random() * 1.6 + 1.1;
          this.vx = (Math.random() - 0.5) * 0.25;
          this.vy = -(Math.random() * 0.22 + 0.06);
          this.baseAlpha = Math.random() * 0.5 + 0.2;
        }

        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = this.baseSize;
        this.alpha = this.baseAlpha;
        this.pulseSpeed = Math.random() * 0.003 + 0.001;

        const particleColors = [
          "rgba(0, 240, 230, 0.6)",   // cyan
          "rgba(124, 107, 239, 0.4)", // lavender indigo
          "rgba(244, 114, 182, 0.3)", // soft pink
          "rgba(255, 255, 255, 0.55)" // stardust white
        ];
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
      }

      update() {
        this.y += this.vy;
        
        // Offset interpolation back to normal
        this.offsetX += (0 - this.offsetX) * 0.06;
        this.offsetY += (0 - this.offsetY) * 0.06;

        // Repelled by cursor positions
        if (mouse.isHovering && !isMobile) {
          const dx = (this.x + this.offsetX) - mouse.x;
          const dy = (this.y + this.offsetY) - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = this.depth === 3 ? 200 : 100;

          if (dist < repelRadius && dist > 1) {
            const force = (repelRadius - dist) / repelRadius;
            const push = this.depth === 3 ? 15 : 6;
            this.offsetX += (dx / dist) * force * push;
            this.offsetY += (dy / dist) * force * push;
          }
        }

        // Loop screen bounds cleanly
        if (this.y < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;

        // Soft visual shimmer
        this.alpha += this.pulseSpeed;
        if (this.alpha > this.baseAlpha + 0.15 || this.alpha < this.baseAlpha - 0.15 || this.alpha < 0.02 || this.alpha > 0.9) {
          this.pulseSpeed = -this.pulseSpeed;
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        const renderX = this.x + this.offsetX;
        const renderY = this.y + this.offsetY;

        c.globalAlpha = Math.max(0.01, Math.min(1, this.alpha));
        if (this.depth === 3 && !isMobile) {
          c.shadowBlur = 4;
          c.shadowColor = this.color;
        }

        c.beginPath();
        c.arc(renderX, renderY, this.size, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
      }
    }

    const particleCount = isMobile ? 15 : 45;
    const particles = Array.from({ length: particleCount }).map(() => new Spec());

    // Slow drifting custom nebula colors
    interface NebulaField {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      radius: number;
      color: string;
      angle: number;
      speed: number;
    }

    const nebulas: NebulaField[] = [
      {
        x: width * 0.15,
        y: height * 0.2,
        targetX: width * 0.15,
        targetY: height * 0.2,
        radius: isMobile ? 220 : 500,
        color: "rgba(74, 16, 138, 0.11)", // Midnight violet glow
        angle: 0,
        speed: 0.18,
      },
      {
        x: width * 0.85,
        y: height * 0.4,
        targetX: width * 0.85,
        targetY: height * 0.4,
        radius: isMobile ? 240 : 580,
        color: "rgba(13, 27, 74, 0.13)", // Deep indigo cobalt
        angle: Math.PI / 4,
        speed: 0.12,
      },
      {
        x: width * 0.45,
        y: height * 0.8,
        targetX: width * 0.45,
        targetY: height * 0.8,
        radius: isMobile ? 260 : 640,
        color: "rgba(3, 37, 42, 0.11)", // Muted cyan cloud
        angle: Math.PI / 2,
        speed: 0.1,
      },
      {
        x: width * 0.75,
        y: height * 0.15,
        targetX: width * 0.75,
        targetY: height * 0.15,
        radius: isMobile ? 180 : 420,
        color: "rgba(172, 11, 236, 0.045)", // Soft lilac magenta hint
        angle: Math.PI * 1.5,
        speed: 0.15,
      }
    ];

    let timer = 0;

    const renderLoop = () => {
      timer++;
      
      if (theme === "light") {
        // High contrast beautiful minimal grey/blue background for light mode
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        // Extremely soft gray-blue layout glow
        ctx.save();
        ctx.globalCompositeOperation = "multiply";
        const lightGrad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, width);
        lightGrad.addColorStop(0, "#f1f5f9");
        lightGrad.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // 1. Light-mode cursor glow
        if (mouse.isHovering && !isMobile) {
          ctx.save();
          const lightGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
          lightGlow.addColorStop(0, "rgba(224, 242, 254, 0.4)"); // sky blue accent
          lightGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = lightGlow;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 300, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // DARK MODE: Obsidian trillion-dollar design system canvas
        ctx.fillStyle = "#030307";
        ctx.fillRect(0, 0, width, height);

        // Track and smooth mouse coordinates
        mouse.x += (mouse.targetX - mouse.x) * 0.055;
        mouse.y += (mouse.targetY - mouse.y) * 0.055;

        // 1. Volumetric Nebula Fields
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let idx = 0; idx < nebulas.length; idx++) {
          const n = nebulas[idx];
          n.angle += 0.00045 * n.speed;
          
          const curX = n.targetX + Math.cos(n.angle) * 128;
          const curY = n.targetY + Math.sin(n.angle) * 88;
          const pulsingRadius = n.radius + Math.sin(timer * 0.0006 + idx) * 30;

          const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, pulsingRadius);
          grad.addColorStop(0, n.color);
          grad.addColorStop(0.4, n.color.replace("0.1", "0.04").replace("0.2", "0.08"));
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, pulsingRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 2. Cinematic Micro-Adjusted Perspectival Matrix Tech Grid
        if (!isMobile) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.strokeStyle = "rgba(0, 240, 230, 0.02)";
          ctx.lineWidth = 0.5;

          const gridSize = 45;
          const horizonDepth = height * 0.35; // perspective height point

          // Horizontal gridlines that scale using perspective formula
          for (let yPos = horizonDepth; yPos < height; yPos += gridSize * 0.75) {
            const distanceRatio = (yPos - horizonDepth) / (height - horizonDepth);
            const intensity = Math.pow(distanceRatio, 1.4) * 0.95;
            
            // Add grid responsive pulsing light waves from active shockwaves
            let dynamicWarp = 0;
            waves.forEach(w => {
              const dY = Math.abs(yPos - w.y);
              if (dY < 50) {
                dynamicWarp += (1 - dY / 50) * w.alpha * 4;
              }
            });

            ctx.strokeStyle = `rgba(0, 240, 230, ${intensity * 0.035})`;
            ctx.beginPath();
            ctx.moveTo(0, yPos + dynamicWarp);
            ctx.lineTo(width, yPos + dynamicWarp);
            ctx.stroke();
          }

          // Converging vertical lines extending from perspective point
          const colsCount = 28;
          for (let c = 0; c <= colsCount; c++) {
            const screenX = (width / colsCount) * c;
            ctx.strokeStyle = "rgba(0, 240, 230, 0.015)";
            ctx.beginPath();
            ctx.moveTo(width / 2 + (screenX - width / 2) * 0.08, horizonDepth);
            ctx.lineTo(screenX, height);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 3. Luxurious Cybernetic Laser Star Coordinates & Connective Network Cables
        if (!isMobile) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          
          for (let pAIdx = 0; pAIdx < particles.length; pAIdx++) {
            const sA = particles[pAIdx];
            if (sA.depth !== 3) continue;

            const rAX = sA.x + sA.offsetX;
            const rAY = sA.y + sA.offsetY;

            // Draw link strings to near mouse proximity
            if (mouse.isHovering) {
              const mxDistX = rAX - mouse.x;
              const myDistY = rAY - mouse.y;
              const cursorMDist = Math.sqrt(mxDistX * mxDistX + myDistY * myDistY);
              const cursorWireRadius = 180;

              if (cursorMDist < cursorWireRadius) {
                const connAlpha = (1 - cursorMDist / cursorWireRadius) * 0.12;
                ctx.strokeStyle = `rgba(0, 240, 230, ${connAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(rAX, rAY);
                ctx.stroke();
              }
            }

            // Draw link strings between close foreground particles
            for (let pBIdx = pAIdx + 1; pBIdx < particles.length; pBIdx++) {
              const sB = particles[pBIdx];
              if (sB.depth !== 3) continue;

              const rBX = sB.x + sB.offsetX;
              const rBY = sB.y + sB.offsetY;

              const partDistX = rAX - rBX;
              const partDistY = rAY - rBY;
              const doubleDist = partDistX * partDistX + partDistY * partDistY;
              const starWireRadius = 140;

              if (doubleDist < starWireRadius * starWireRadius) {
                const sDist = Math.sqrt(doubleDist);
                const linkAlpha = (1 - sDist / starWireRadius) * 0.06 * sA.alpha;
                ctx.strokeStyle = `rgba(124, 107, 239, ${linkAlpha})`;
                ctx.lineWidth = 0.45;
                ctx.beginPath();
                ctx.moveTo(rAX, rAY);
                ctx.lineTo(rBX, rBY);
                ctx.stroke();
              }
            }
          }
          ctx.restore();
        }

        // 4. Cursor Follower Aurora Core Spotlight Atmosphere
        if (mouse.isHovering && !isMobile) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          const magneticGlowRad = 460 + mouse.pressure * 90;
          const radialAtmosphere = ctx.createRadialGradient(
            mouse.x,
            mouse.y,
            0,
            mouse.x,
            mouse.y,
            magneticGlowRad
          );

          radialAtmosphere.addColorStop(0, "rgba(0, 240, 230, 0.055)"); // Electric Cyan highlight
          radialAtmosphere.addColorStop(0.35, "rgba(124, 107, 239, 0.03)"); // Midground Lavender Indigo
          radialAtmosphere.addColorStop(0.7, "rgba(224, 20, 254, 0.005)"); // Ultraviolet
          radialAtmosphere.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = radialAtmosphere;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, magneticGlowRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw active micro-stardust particles on screen
      for (const p of particles) {
        p.update();
        p.draw(ctx);
      }

      // 5. Active Interactive Click Shockwave Ripples
      if (waves.length > 0 && theme === "dark") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let waveIdx = waves.length - 1; waveIdx >= 0; waveIdx--) {
          const w = waves[waveIdx];
          w.radius += w.speed;
          w.alpha = (1 - w.radius / w.maxRadius) * 0.35;

          ctx.strokeStyle = `rgba(0, 240, 230, ${w.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(0, 240, 230, 0.5)";
          ctx.lineWidth = 1.3;

          ctx.beginPath();
          ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (w.radius >= w.maxRadius) {
            waves.splice(waveIdx, 1);
          }
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mousedown", handleGlobalMouseDown);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-[0]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: theme === "light" ? "normal" : "screen", opacity: theme === "light" ? 1.0 : 0.9 }}
      />
      {/* Layer 3 - Ultra premium noise/grain surface texture */}
      {theme === "dark" && (
        <div 
          className="absolute inset-0 w-full h-full mix-blend-overlay opacity-[0.035] pointer-events-none select-none bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/></svg>')]" 
        />
      )}
    </div>
  );
}
