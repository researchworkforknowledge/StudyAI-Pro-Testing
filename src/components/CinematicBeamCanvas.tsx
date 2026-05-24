import React, { useEffect, useRef } from "react";

interface CinematicBeamCanvasProps {
  side: "left" | "right";
  mousePos: { x: number; y: number };
}

export default function CinematicBeamCanvas({ side, mousePos }: CinematicBeamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 100);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 100;
      height = canvas.height = canvas.parentElement?.clientHeight || 800;
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Set colors based on the side for extreme premium cyber-aurora aesthetic
    const mainColor = side === "left" ? "#00f0e6" : "#7c6bef"; // Cyan vs Indigo-Purple
    const secondaryColor = side === "left" ? "#7c6bef" : "#00f0e6"; // Intercept color paths
    const accentColor = "#f472b6"; // Cosmic pink sparks

    // Particle state class
    class EnergyParticle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      driftX: number;
      driftSpeed: number;
      driftPhase: number;
      opacity: number;
      baseOpacity: number;
      color: string;
      customBlur: number;
      isSpark: boolean;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.6;
        
        // Liquid drift speeds
        this.speedY = (Math.random() * 0.4 + 0.15) * (Math.random() > 0.5 ? 1 : -1);
        this.driftX = Math.random() * 12 + 2;
        this.driftSpeed = Math.random() * 0.015 + 0.005;
        this.driftPhase = Math.random() * Math.PI * 2;
        this.baseOpacity = Math.random() * 0.5 + 0.25;
        this.opacity = this.baseOpacity;
        this.customBlur = Math.random() > 0.7 ? 4 : 0;
        
        // Randomly select premium gradients
        const roll = Math.random();
        this.color = roll < 0.5 ? mainColor : roll < 0.85 ? secondaryColor : accentColor;
        this.isSpark = Math.random() > 0.88;
      }

      update(time: number, actualMouse: { x: number; y: number }) {
        this.y += this.speedY;
        this.driftPhase += this.driftSpeed;

        // Base horizontal coordinate tracks center beam drift
        const beamCenter = width / 2 + Math.sin(time * 0.001 + (side === "left" ? 0 : Math.PI)) * 8;
        
        // Apply sine sway around the beam center
        let targetX = beamCenter + Math.sin(this.driftPhase) * this.driftX;

        // Magnetic Attraction: Calculate distance to user cursor
        const dx = actualMouse.x - targetX;
        const dy = actualMouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 180) {
          // Pull smoothly towards cursor if in magnet field
          const force = (180 - dist) / 180;
          targetX += dx * force * 0.35;
          this.opacity = Math.min(1.0, this.baseOpacity + force * 0.5);
          if (this.isSpark) {
            this.y += dy * force * 0.08; // subtle speed sync with cursor
          }
        } else {
          // fade smoothly back to base metrics
          if (this.opacity > this.baseOpacity) {
            this.opacity -= 0.01;
          }
        }

        this.x = targetX;

        // Recirculate top/bottom boundaries
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.opacity;
        if (this.customBlur > 0) {
          c.shadowBlur = this.customBlur;
          c.shadowColor = this.color;
        } else if (this.isSpark) {
          c.shadowBlur = 8;
          c.shadowColor = "#ffffff";
        }
        
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = this.isSpark ? "#ffffff" : this.color;
        c.fill();
        c.restore();
      }
    }

    // Interactive Pulsed Energy Wave (flowing through the beam line)
    class VerticalWaveBolt {
      y: number;
      speed: number;
      size: number;
      length: number;
      opacity: number;

      constructor(startY: number) {
        this.y = startY;
        this.speed = Math.random() * 2.5 + 2.0;
        this.size = Math.random() * 3 + 1.5;
        this.length = Math.random() * 120 + 80;
        this.opacity = Math.random() * 0.4 + 0.3;
      }

      update() {
        this.y += this.speed;
        if (this.y > height + 50) {
          this.y = -150;
          this.speed = Math.random() * 2.5 + 2.4;
          this.size = Math.random() * 3 + 1.5;
          this.length = Math.random() * 120 + 80;
        }
      }

      draw(c: CanvasRenderingContext2D, beamXFunc: (yVal: number) => number) {
        c.save();
        
        // Draw segment along the bending/drifting beam coordinate
        const segments = 12;
        const pts: { x: number; y: number }[] = [];
        
        for (let i = 0; i <= segments; i++) {
          const currY = this.y - (i / segments) * this.length;
          const currRefX = beamXFunc(currY);
          pts.push({ x: currRefX, y: currY });
        }

        // Generate glowing linear gradient
        const grad = c.createLinearGradient(0, this.y - this.length, 0, this.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, mainColor);
        grad.addColorStop(0.8, "#ffffff");
        grad.addColorStop(1, "transparent");

        c.lineCap = "round";
        c.lineWidth = this.size;
        c.strokeStyle = grad;
        c.shadowBlur = 18;
        c.shadowColor = mainColor;
        c.globalAlpha = this.opacity;

        c.beginPath();
        c.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          c.lineTo(pts[i].x, pts[i].y);
        }
        c.stroke();
        c.restore();
      }
    }

    // Instantiating elements
    const particleCount = 28;
    const particles: EnergyParticle[] = Array.from({ length: particleCount }).map(() => new EnergyParticle());
    const waveBolts: VerticalWaveBolt[] = [
      new VerticalWaveBolt(-100),
      new VerticalWaveBolt(height * 0.4),
      new VerticalWaveBolt(height * 0.75)
    ];

    // Local cursor interpolation for beautiful performance
    const localCursor = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      localCursor.targetX = e.clientX - rect.left;
      localCursor.targetY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal, { passive: true });

    let time = 0;

    // Fluid render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 16.67; // standard high-res iteration step

      // Spring interpolate cursor tracking
      localCursor.x += (localCursor.targetX - localCursor.x) * 0.08;
      localCursor.y += (localCursor.targetY - localCursor.y) * 0.08;

      // Mathematical reference for current beam center coordinate drift
      const getBeamXAtY = (yVal: number) => {
        const baseOffset = width / 2;
        
        // Organic sinusoidal drift over time
        const drift = Math.sin(time * 0.0012 + yVal * 0.001) * 8;
        
        // Micro-interaction with local cursor: apply magnetic curve
        const dy = localCursor.y - yVal;
        const dx = localCursor.x - baseOffset;
        const distY = Math.abs(dy);
        
        let magneticOffset = 0;
        if (distY < 185) {
          const force = (185 - distY) / 185;
          // Bend the beam line smoothly towards cursor
          magneticOffset = dx * force * 0.42;
        }

        return baseOffset + drift + magneticOffset;
      };

      // 1. Draw Multi-Layered Glowing Air-Bloom Pillars
      const beamSegments = 30;
      const stepY = height / beamSegments;

      // Set blend mode
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Outer volumetric soft glare (extremely broad)
      ctx.beginPath();
      for (let i = 0; i <= beamSegments; i++) {
        const currY = i * stepY;
        const currX = getBeamXAtY(currY);
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
      }
      ctx.lineWidth = 45;
      ctx.strokeStyle = side === "left" ? "rgba(0, 240, 230, 0.015)" : "rgba(124, 107, 239, 0.015)";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      // Medium bloom glow
      ctx.beginPath();
      for (let i = 0; i <= beamSegments; i++) {
        const currY = i * stepY;
        const currX = getBeamXAtY(currY);
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
      }
      ctx.lineWidth = 14;
      ctx.strokeStyle = side === "left" ? "rgba(0, 240, 230, 0.06)" : "rgba(124, 107, 239, 0.06)";
      ctx.stroke();

      // Sharp Core light stream
      ctx.beginPath();
      for (let i = 0; i <= beamSegments; i++) {
        const currY = i * stepY;
        const currX = getBeamXAtY(currY);
        if (i === 0) ctx.moveTo(currX, currY);
        else ctx.lineTo(currX, currY);
      }
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = side === "left" ? "rgba(130, 255, 250, 0.75)" : "rgba(210, 195, 255, 0.75)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = mainColor;
      ctx.stroke();
      ctx.restore();

      // Cinematic spinning double helix winding around the main core line
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const helixPoints = 40;
      const helixStepY = height / helixPoints;
      
      for (const offsetAngle of [0, Math.PI]) {
        ctx.beginPath();
        for (let i = 0; i <= helixPoints; i++) {
          const currY = i * helixStepY;
          const coreX = getBeamXAtY(currY);
          
          // Organic breath and twirl
          const radius = 12 + Math.sin(time * 0.0016 + currY * 0.005) * 2.5;
          const angle = time * 0.0022 + (currY * 0.01) + offsetAngle;
          const helixX = coreX + Math.cos(angle) * radius;
          
          if (i === 0) ctx.moveTo(helixX, currY);
          else ctx.lineTo(helixX, currY);
        }
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = side === "left" ? "rgba(0, 240, 230, 0.38)" : "rgba(124, 107, 239, 0.38)";
        ctx.shadowBlur = 6;
        ctx.shadowColor = mainColor;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Moving Glowing Wave Bolts along the beam
      for (const bolt of waveBolts) {
        bolt.update();
        bolt.draw(ctx, getBeamXAtY);
      }

      // 3. Update & Draw Ambient Floating Stardust Particles
      for (const p of particles) {
        p.update(time, localCursor);
        p.draw(ctx);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [side]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        mixBlendMode: "screen",
        willChange: "transform",
      }}
    />
  );
}
