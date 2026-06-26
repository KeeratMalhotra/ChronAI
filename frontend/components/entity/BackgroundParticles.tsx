"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BG_PARTICLE_COUNT = 500;

const bgVertexShader = `
uniform float uTime;

attribute float aRandom;

varying float vAlpha;

void main() {
  vec3 pos = position;
  
  // Very slow drift
  float drift = uTime * 0.02;
  pos.x += sin(drift + aRandom * 6.28) * 0.3;
  pos.y += cos(drift * 0.7 + aRandom * 3.14) * 0.3;
  pos.z += sin(drift * 0.5 + aRandom * 9.42) * 0.2;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  vAlpha = 0.1 + aRandom * 0.1;
  
  gl_PointSize = (1.0 + aRandom * 1.0) * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const bgFragmentShader = `
varying float vAlpha;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  if (dist > 0.5) discard;
  
  float intensity = smoothstep(0.5, 0.1, dist);
  
  // White/very light cyan color
  vec3 color = vec3(0.85, 0.95, 1.0);
  
  float alpha = intensity * vAlpha;
  
  gl_FragColor = vec4(color, alpha);
}
`;

export default function BackgroundParticles() {
  const meshRef = useRef<THREE.Points>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const { positions, randoms } = useMemo(() => {
    const positions = new Float32Array(BG_PARTICLE_COUNT * 3);
    const randoms = new Float32Array(BG_PARTICLE_COUNT);

    for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Random distribution in a shell between radius 8 and 15
      const radius = 8 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      randoms[i] = Math.random();
    }

    return { positions, randoms };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value += delta;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
