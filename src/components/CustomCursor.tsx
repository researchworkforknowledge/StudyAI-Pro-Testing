import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  
  // Custom trail coordinates
  const TRAIL_LENGTH = 24;
  const trailRefs = useRef<HTMLDivElement[]>([]);
  
  // Shared positioning variables to bypass React re-renders (Pure high-perf animation loop)
  const coordsRef = useRef({
    // Raw cursor coordinates
    rawX: 0,
    rawY: 0,
    // Smooth lerp coordinates for dot and trail
    dotX: 0,
    dotY: 0,
    ringX: 0,
    ringY: 0,
    // Spring physics velocities
    dotVX: 0,
    dotVY: 0,
    ringVX: 0,
    ringVY: 0,
    // Speed tracking
    lastRingX: 0,
    lastRingY: 0,
    velocity: 0,
    angle: 0,
    // Hover details
    state: "default", // "default"|"button"|"magnetic"|"text"|"card"|"drag"
    label: "",
    // Target element tracking for magnetic snapping
    magneticTarget: null as HTMLElement | null,
    magneticCenter: { x: 0, y: 0 },
    // Card tilt tracking
    cardTarget: null as HTMLElement | null,
    cardReflection: null as HTMLDivElement | null,
    // Active text hover elements
    textTarget: null as HTMLElement | null,
  });

  const [cursorState, setCursorState] = useState("default");
  const [cursorLabel, setCursorLabel] = useState("");

  useEffect(() => {
    // Hidden on touchscreen devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      if (containerRef.current) {
        containerRef.current.style.display = "none";
      }
      return;
    }

    // Hide original mouse cursor globally for high immersive experience
    const styleElement = document.createElement("style");
    styleElement.id = "custom-cursor-hide-native";
    styleElement.innerHTML = `
      body, button, a, input, textarea, [role="button"], .interactive, .cursor-pointer {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    const handleMouseMove = (e: MouseEvent) => {
      const coords = coordsRef.current;
      coords.rawX = e.clientX;
      coords.rawY = e.clientY;
    };

    const handleMouseDown = () => {
      if (ringRef.current) {
        ringRef.current.style.transform += " scale(0.75)";
      }
    };

    const handleMouseUp = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = ringRef.current.style.transform.replace(" scale(0.75)", "");
      }
    };

    // Auto inspect element under the cursor on mouseover
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const coords = coordsRef.current;

      // 1. Traverse up ancestors to find special interactive structures
      let element: HTMLElement | null = target;
      let foundButton = false;
      let foundMagnetic = false;
      let foundText = false;
      let foundCard = false;
      let customLabel = "";

      while (element && element !== document.body) {
        const tagName = element.tagName.toLowerCase();
        
        // Scan for custom cursor labels
        if (element.getAttribute("data-cursor-label")) {
          customLabel = element.getAttribute("data-cursor-label") || "";
        }

        // Magnetic element check
        if (
          element.getAttribute("data-cursor") === "magnetic" ||
          element.classList.contains("magnetic") ||
          element.classList.contains("btn-magnetic") ||
          tagName === "button" ||
          element.classList.contains("sidebar-nav-item") ||
          (element.classList.contains("rounded-full") && element.tagName === "BUTTON")
        ) {
          foundMagnetic = true;
          coords.magneticTarget = element;
          const rect = element.getBoundingClientRect();
          coords.magneticCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          break;
        }

        // Button/Anchor interactive check
        if (
          tagName === "a" ||
          element.classList.contains("cursor-pointer") ||
          element.getAttribute("role") === "button"
        ) {
          foundButton = true;
          break;
        }

        // TextBox / Input elements check
        if (
          tagName === "input" ||
          tagName === "textarea" ||
          element.classList.contains("font-mono") ||
          element.getAttribute("contenteditable") === "true"
        ) {
          foundText = true;
          break;
        }

        // Card components check
        if (
          element.classList.contains("glass-panel") ||
          element.classList.contains("bg-white/[0.02]") ||
          element.classList.contains("bg-white/5") ||
          element.classList.contains("rounded-2xl") ||
          element.classList.contains("rounded-3xl") ||
          element.classList.contains("vibe-card") ||
          element.classList.contains("homework-row") ||
          element.getAttribute("data-cursor") === "card"
        ) {
          foundCard = true;
          coords.cardTarget = element;
          // Dynamically inject subtle light refraction shine overlay if doesn't exist
          if (!element.querySelector(".card-glow-reflection")) {
            const glowEl = document.createElement("div");
            glowEl.className = "card-glow-reflection pointer-events-none absolute inset-0 rounded-[inherit] z-[5] overflow-hidden";
            glowEl.style.transition = "opacity 0.5s ease";
            glowEl.style.opacity = "0";
            element.appendChild(glowEl);
            coords.cardReflection = glowEl;
          } else {
            coords.cardReflection = element.querySelector(".card-glow-reflection") as HTMLDivElement;
          }
          break;
        }

        element = element.parentElement;
      }

      if (customLabel) {
        coords.state = "label";
        coords.label = customLabel;
        setCursorState("label");
        setCursorLabel(customLabel);
      } else if (foundMagnetic) {
        coords.state = "magnetic";
        setCursorState("magnetic");
      } else if (foundButton) {
        coords.state = "button";
        setCursorState("button");
      } else if (foundText) {
        coords.state = "text";
        setCursorState("text");
      } else if (foundCard) {
        coords.state = "card";
        setCursorState("card");
        if (coords.cardReflection) {
          coords.cardReflection.style.opacity = "1";
        }
      } else {
        coords.state = "default";
        coords.label = "";
        setCursorState("default");
        setCursorLabel("");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const coords = coordsRef.current;
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Clean up dynamic transforms/shadows on exit
      if (coords.magneticTarget && (!relatedTarget || !coords.magneticTarget.contains(relatedTarget))) {
        coords.magneticTarget.style.transform = "";
        coords.magneticTarget.style.boxShadow = "";
        coords.magneticTarget = null;
        coords.state = "default";
        setCursorState("default");
      }

      if (coords.cardTarget && (!relatedTarget || !coords.cardTarget.contains(relatedTarget))) {
        coords.cardTarget.style.transform = "";
        coords.cardTarget.style.boxShadow = "";
        if (coords.cardReflection) {
          coords.cardReflection.style.opacity = "0";
          coords.cardReflection = null;
        }
        coords.cardTarget = null;
        coords.state = "default";
        setCursorState("default");
      }

      if (!relatedTarget) {
        coords.state = "default";
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    // Ultra-High FPS Animation Loop
    let animationFrameId = 0;
    
    // Setup initial positions
    const coords = coordsRef.current;
    
    // Trail particles state pools
    const trails = Array.from({ length: TRAIL_LENGTH }).map(() => ({ x: 0, y: 0 }));

    const animate = () => {
      // 1. Calculate main target based on whether hovering magnetic controls
      let targetX = coords.rawX;
      let targetY = coords.rawY;

      if (coords.state === "magnetic" && coords.magneticTarget) {
        const center = coords.magneticCenter;
        // Soft snap cursor towards button center, while letting it micro-jiggle (magnetic elastic pull)
        targetX = center.x + (coords.rawX - center.x) * 0.32;
        targetY = center.y + (coords.rawY - center.y) * 0.32;

        // Apply physical reactive pull/lift directly on the button
        const px = (coords.rawX - center.x) * 0.35;
        const py = (coords.rawY - center.y) * 0.35;
        // Boost button depth dynamically
        coords.magneticTarget.style.transform = `translate3d(${px}px, ${py}px, 0) scale(1.05)`;
        coords.magneticTarget.style.boxShadow = "rgba(124, 107, 239, 0.45) 0px 10px 25px";
        coords.magneticTarget.style.transition = "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease";
      }

      // 2. Real-time card tilt logic
      if (coords.state === "card" && coords.cardTarget) {
        const rect = coords.cardTarget.getBoundingClientRect();
        const cursorRelX = coords.rawX - rect.left;
        const cursorRelY = coords.rawY - rect.top;
        
        // Calculate tilt percentages from -0.5 to 0.5
        const pctX = (cursorRelX / rect.width) - 0.5;
        const pctY = (cursorRelY / rect.height) - 0.5;

        // Apply 3D tilt perspective + dynamic hover scale
        coords.cardTarget.style.transform = `perspective(1200px) rotateY(${pctX * 10}deg) rotateX(${-pctY * 10}deg) translate3d(0, -4px, 12px) scale(1.015)`;
        coords.cardTarget.style.boxShadow = "0 22px 45px rgba(0, 0, 0, 0.55), 0 0 30px rgba(99, 102, 241, 0.15)";
        coords.cardTarget.style.transition = "transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s";
        
        // Render dynamic lighting flash highlight overlay
        if (coords.cardReflection) {
          coords.cardReflection.style.background = `radial-gradient(350px circle at ${cursorRelX}px ${cursorRelY}px, rgba(255, 255, 255, 0.08) 0%, rgba(124, 107, 239, 0.04) 40%, transparent 80%)`;
        }
      }

      // 3. Coordinate interpolation (Advanced Spring-Mass-Damper Physics Integration)
      const ringStiffness = 0.12; 
      const ringDamping = 0.68;   

      const dotStiffness = 0.35;  
      const dotDamping = 0.76;    

      // Ring spring physics integration
      const ringForceX = (targetX - coords.ringX) * ringStiffness;
      const ringForceY = (targetY - coords.ringY) * ringStiffness;
      coords.ringVX = (coords.ringVX + ringForceX) * ringDamping;
      coords.ringVY = (coords.ringVY + ringForceY) * ringDamping;
      coords.ringX += coords.ringVX;
      coords.ringY += coords.ringVY;

      // Dot spring physics integration
      const dotForceX = (targetX - coords.dotX) * dotStiffness;
      const dotForceY = (targetY - coords.dotY) * dotStiffness;
      coords.dotVX = (coords.dotVX + dotForceX) * dotDamping;
      coords.dotVY = (coords.dotVY + dotForceY) * dotDamping;
      coords.dotX += coords.dotVX;
      coords.dotY += coords.dotVY;

      // 4. Calculate Ring velocity and angle of motion to implement fluid/liquid stretching
      const rx = coords.ringX - coords.lastRingX;
      const ry = coords.ringY - coords.lastRingY;
      const speed = Math.sqrt(rx * rx + ry * ry);
      
      coords.velocity = speed;
      coords.angle = Math.atan2(ry, rx);
      
      coords.lastRingX = coords.ringX;
      coords.lastRingY = coords.ringY;

      // Apply coordinates directly to DOM nodes for elite high performances (bypasses structural layout ticks)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${coords.dotX - 3}px, ${coords.dotY - 3}px, 0)`;
      }

      if (ringRef.current) {
        // Calculate dynamic stretch
        const stretchX = 1 + Math.min(speed * 0.035, 0.55);
        const stretchY = 1 - Math.min(speed * 0.022, 0.42);
        const rotationDegrees = (coords.angle * 180) / Math.PI;

        const baseTranslate = `translate3d(${coords.ringX - 16}px, ${coords.ringY - 16}px, 0)`;
        const baseRotateZ = `rotateZ(${rotationDegrees}deg)`;
        
        // Morph scales according to current target hovered interaction
        let stateScale = 1;
        if (coords.state === "button" || coords.state === "magnetic") {
          stateScale = 1.9;
        } else if (coords.state === "text") {
          stateScale = 0.5; // shrink ring when selecting text
        } else if (coords.state === "card") {
          stateScale = 1.35;
        } else if (coords.state === "label") {
          stateScale = 2.4;
        }

        const stretchScale = `scale3d(${stretchX * stateScale}, ${stretchY * stateScale}, 1)`;
        
        // Apply liquid stretch rotation transform
        ringRef.current.style.transform = `${baseTranslate} ${baseRotateZ} ${stretchScale}`;
        
        // Dynamically shift color or borders
        if (coords.state === "button" || coords.state === "magnetic") {
          ringRef.current.style.borderColor = "rgba(244, 114, 182, 0.75)"; // pink highlight
          ringRef.current.style.boxShadow = "0 0 20px rgba(244, 114, 182, 0.45)";
        } else if (coords.state === "card" || coords.state === "label") {
          ringRef.current.style.borderColor = "rgba(11, 182, 174, 0.8)"; // cyan neon
          ringRef.current.style.boxShadow = "0 0 15px rgba(11, 182, 174, 0.35)";
        } else {
          ringRef.current.style.borderColor = "rgba(255, 255, 255, 0.45)"; // soft white
          ringRef.current.style.boxShadow = "none";
        }
      }

      // 5. Update Particle Trail Dots (Smooth comet tail blur/liquid comet cascade)
      // First particle follows main dot directly with a delayed smooth drift
      trails[0].x += (coords.dotX - trails[0].x) * 0.28;
      trails[0].y += (coords.dotY - trails[0].y) * 0.28;

      // Rest follows their ahead coordinates creating liquid motion bleed
      for (let i = 1; i < TRAIL_LENGTH; i++) {
        trails[i].x += (trails[i - 1].x - trails[i].x) * 0.18;
        trails[i].y += (trails[i - 1].y - trails[i].y) * 0.18;
      }

      // Apply trails directly to pooled HTML trail elements
      trailRefs.current.forEach((ref, index) => {
        if (ref) {
          const sizeCoeff = 1 - (index / TRAIL_LENGTH);
          const opacityCoeff = 0.4 * (1 - (index / TRAIL_LENGTH));
          
          ref.style.transform = `translate3d(${trails[index].x - 3}px, ${trails[index].y - 3}px, 0) scale(${sizeCoeff})`;
          ref.style.opacity = coords.state === "text" ? "0" : `${opacityCoeff}`; // Hide trail in text mode
        }
      });

      // 6. Label display positioning following cursor dot
      if (labelRef.current && coords.state === "label") {
        labelRef.current.style.transform = `translate3d(${coords.dotX - 50}px, ${coords.dotY - 50}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      const hideElem = document.getElementById("custom-cursor-hide-native");
      if (hideElem) hideElem.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="quantum-cursor"
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
    >
      {/* 1. Subtle Trail Elements Pool (Motion Blur comet tail effect) */}
      {Array.from({ length: TRAIL_LENGTH }).map((_, idx) => (
        <div
          key={idx}
          ref={(el) => {
            if (el) trailRefs.current[idx] = el;
          }}
          className="absolute w-1.5 h-1.5 rounded-full will-change-transform"
          style={{
            transform: "translate3d(-100px, -100px, 0)",
            opacity: 0,
            filter: "blur(0.5px)",
            backgroundColor: idx % 3 === 0 ? "#0bb6ae" : idx % 3 === 1 ? "#7c6bef" : "#ec4899",
          }}
        />
      ))}

      {/* 2. Concentric Outer Elastic Interactive Ring */}
      <div
        ref={ringRef}
        className="absolute w-8 h-8 rounded-full border border-white/45 will-change-transform flex items-center justify-center transition-[scale,border-color,background-color] duration-300"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
          boxShadow: "none",
        }}
      >
        {/* Inside context indicator or glowing ring center when expanding */}
        {cursorState === "magnetic" && (
          <div className="w-1 h-1 rounded-full bg-pink-400 animate-ping" />
        )}
      </div>

      {/* 3. Core High-Contrast Target Dot or Beam */}
      <div
        ref={dotRef}
        className={`absolute rounded-full transition-[width,height,background-color,border-radius] duration-200 will-change-transform ${
          cursorState === "text"
            ? "w-0.5 h-4 bg-teal-400 rounded-sm" // Morph to vertical text insertion beam
            : cursorState === "button" || cursorState === "magnetic"
            ? "w-2.5 h-2.5 bg-pink-400" // Morph to highlighted action point
            : cursorState === "card"
            ? "w-2.5 h-2.5 bg-[#0bb6ae] shadow-[0_0_8px_rgba(11,182,174,0.6)]" // Cyan target glow
            : "w-1.5 h-1.5 bg-white" // Default sleek core dot
        }`}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      />

      {/* 4. Display Label when Hovering custom elements (Floating Badge) */}
      {cursorState === "label" && (
        <div
          ref={labelRef}
          className="absolute px-3 py-1 bg-gradient-to-r from-[#0bb6ae] to-indigo-600 rounded-full text-white text-[9px] font-bold font-mono tracking-widest leading-none shadow-[0_4px_12px_rgba(99,102,241,0.4)] flex items-center justify-center text-center w-[100px] h-[30px]"
          style={{
            transform: "translate3d(-200px, -200px, 0)",
          }}
        >
          {cursorLabel}
        </div>
      )}
    </div>
  );
}
