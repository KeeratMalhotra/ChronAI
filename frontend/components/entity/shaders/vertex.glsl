uniform float uTime;
uniform vec2 uMouse;
uniform float uAudioFrequency;
uniform float uAudioBass;
uniform float uAudioTreble;

attribute float aRandom;
attribute float aPhase;

varying float vAlpha;
varying float vDistance;
varying vec3 vColor;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}

void main() {
  vec3 pos = position;
  
  // IMPORTANT: Normal reconstruction assumes torus lies in XY plane.
  // All displacement (undulation, audio, repulsion) must happen BEFORE rotation.
  // Moving rotation earlier would break the atan(pos.y, pos.x) normal calculation.
  
  // Compute torus normal direction (radial from center ring)
  float angle = atan(pos.y, pos.x);
  vec2 ringCenter = vec2(cos(angle), sin(angle)) * 2.0;
  vec3 torusNormal = normalize(pos - vec3(ringCenter, 0.0));
  
  // Idle undulation - waves along the torus that morph over time
  float undulation = sin(angle * 5.0 + uTime * 0.8) * 0.06 
                   + sin(angle * 13.0 + uTime * 1.2) * 0.03
                   + sin(angle * 7.0 - uTime * 0.5) * 0.04;
  pos += torusNormal * undulation;
  
  // Audio reactivity - dramatic displacement along normal
  float audioDisplace = uAudioBass * 1.8 + uAudioFrequency * 1.2;
  float audioWave = sin(angle * 8.0 + uTime * 3.0) * uAudioTreble * 0.8;
  pos += torusNormal * (audioDisplace + audioWave) * (0.5 + aRandom * 0.5);
  
  // Mouse REPULSION - particles near cursor get pushed away
  vec3 mouseWorld = vec3(uMouse.x * 4.0, uMouse.y * 4.0, 0.0);
  vec3 fromMouse = pos - mouseWorld;
  float distToMouse = length(fromMouse);
  float repulsionStrength = 0.6 * smoothstep(2.0, 0.0, distToMouse);
  pos += normalize(fromMouse) * repulsionStrength;
  
  // Breathing - subtle radius pulsing
  float breathe = sin(uTime * 0.8) * 0.03;
  pos *= 1.0 + breathe;
  
  // Slow rotation
  float rotSpeed = uTime * 0.1;
  float cosR = cos(rotSpeed);
  float sinR = sin(rotSpeed);
  vec3 rotatedPos = vec3(
    pos.x * cosR - pos.y * sinR,
    pos.x * sinR + pos.y * cosR,
    pos.z
  );
  pos = rotatedPos;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Distance-based alpha
  vDistance = length(pos) / 3.0;
  vAlpha = 0.5 + 0.5 * (1.0 - vDistance * 0.3) + uAudioFrequency * 0.4;
  vAlpha = clamp(vAlpha, 0.2, 1.0);
  
  // Color gradient: magenta to cyan based on angle (stored in aPhase)
  vec3 magenta = vec3(1.0, 0.0, 0.8);
  vec3 cyan = vec3(0.0, 0.9, 1.0);
  float colorT = aPhase;
  vColor = mix(magenta, cyan, colorT);
  
  // Add subtle audio color shift
  vColor += vec3(0.1, 0.0, 0.1) * uAudioBass;
  
  // Smaller, sharper particles
  gl_PointSize = (2.0 + aRandom * 1.5 + uAudioBass * 2.0) * (250.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
