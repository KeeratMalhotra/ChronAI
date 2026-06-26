"use client";

interface HudLabelsProps {
  isActive?: boolean;
}

export default function HudLabels({ isActive = false }: HudLabelsProps) {
  const labelClass = "font-mono text-[10px] tracking-wider uppercase text-white/50 border border-white/5 px-2 py-1 bg-white/[0.02] backdrop-blur-sm";
  
  return (
    <>
      {/* Top-left */}
      <div className={`absolute top-6 left-6 ${labelClass}`}>
        AI AUDIO FEEDBACK: {isActive ? "ACTIVE PULSING" : "IDLE"}
      </div>
      
      {/* Top-right */}
      <div className={`absolute top-6 right-6 ${labelClass}`}>
        PARTICLE CORE: Broken Circularity
      </div>
      
      {/* Bottom center */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${labelClass}`}>
        DEVELOPER VIEW: Three.js Particle Swarm (GLSL Modulated by Real-time Voice Data)
      </div>
    </>
  );
}
