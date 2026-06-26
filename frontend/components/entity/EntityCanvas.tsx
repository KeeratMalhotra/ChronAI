"use client";

import { Canvas } from "@react-three/fiber";
import ParticleSystem from "./ParticleSystem";
import BackgroundParticles from "./BackgroundParticles";

export default function EntityCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <BackgroundParticles />
      <ParticleSystem />
    </Canvas>
  );
}
