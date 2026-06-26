varying float vAlpha;
varying float vDistance;
varying vec3 vColor;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Sharp circular cutoff
  if (dist > 0.45) discard;
  
  // Tighter falloff for distinct particles
  float intensity = smoothstep(0.45, 0.05, dist);
  
  // Subtle bright core
  float core = smoothstep(0.2, 0.0, dist);
  
  vec3 finalColor = vColor * intensity;
  finalColor += vec3(1.0) * core * 0.1;
  
  float alpha = intensity * vAlpha;
  alpha = clamp(alpha, 0.0, 1.0);
  
  gl_FragColor = vec4(finalColor, alpha);
}
