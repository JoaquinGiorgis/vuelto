"use client";

import { useEffect, useRef } from "react";

// Gradiente de campo suave (papel, verde y sol) con grano. Un solo quad, sin librerías.
// Corre a media resolución, a ~30fps, se pausa fuera de pantalla y queda quieto con reduced-motion.
const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = uv * vec2(r.x / r.y, 1.0) * 1.6;
  float s = t * 0.035;
  float n = noise(p + vec2(s, -s * 0.7));
  n += 0.5 * noise(p * 2.0 - vec2(s * 1.3, s));

  vec3 paper  = vec3(0.961, 0.953, 0.933);
  vec3 forest = vec3(0.780, 0.875, 0.820);
  vec3 sol    = vec3(0.984, 0.910, 0.690);

  vec3 col = paper;
  col = mix(col, forest, smoothstep(0.55, 1.25, n) * (1.0 - uv.y * 0.4));
  col = mix(col, sol, smoothstep(0.75, 1.4, n + (uv.x - 0.5) * 0.6) * 0.8);
  col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}`;

export function ShaderBackdrop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false });
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}"));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");

    const resize = () => {
      const scale = 0.5; // media resolución: es un degradé, no necesita más
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    };
    const draw = (time: number) => {
      gl.uniform1f(uT, time / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    draw(12000);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return;
      last = now;
      draw(now + 12000);
    };
    if (!still) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`block h-full w-full ${className}`} />;
}
