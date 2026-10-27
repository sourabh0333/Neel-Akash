"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/anim";

/**
 * A hand-written WebGL field — drifting fbm noise graded from night-sea
 * indigo up into a sunset ember horizon, with a soft mouse-following light.
 *
 * Deliberately NOT Three.js: this is ~4KB of shader instead of ~600KB of
 * library, which matters a great deal on a 4G connection in the delta.
 * If WebGL is unavailable the component renders nothing and the CSS
 * gradient underneath simply shows through.
 *
 * It is an ornament, so it never costs the visitor anything they'd notice:
 *   - it only runs on a desktop with a real GPU — not on phones or tablets,
 *     not with Save-Data on, not on low-memory devices, and not where the
 *     browser is drawing WebGL in software, where every frame would be
 *     computed on the main thread;
 *   - it starts once the page is idle, never competing with first paint;
 *   - it draws at 60% resolution and 30fps, which drifting noise doesn't
 *     show, for about a fifth of the work.
 */

/** Whether this device should run the live sky at all. */
function canAfford(gl: WebGLRenderingContext) {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches) return false;
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return false;
  return true;
}

/** Render scale and frame interval for the live sky. */
const SCALE = 0.6;
const FRAME_MS = 1000 / 30;

const VERT = `#version 100
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 100
precision mediump float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uIntensity;

// -- value noise + fbm -------------------------------------------------
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p  = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.045;

  // Two noise layers drifting against each other = slow water/cloud motion.
  float n1 = fbm(p * 2.1 + vec2(t, t * 0.6));
  float n2 = fbm(p * 3.4 - vec2(t * 0.8, t * 0.35) + n1 * 0.6);
  float n  = mix(n1, n2, 0.55);

  // Palette: abyss -> neel -> ember, keyed to height so a horizon forms.
  vec3 abyss = vec3(0.012, 0.020, 0.035);
  vec3 neel  = vec3(0.055, 0.130, 0.290);
  vec3 blue  = vec3(0.145, 0.330, 0.560);
  vec3 ember = vec3(0.890, 0.480, 0.180);

  float h = smoothstep(0.05, 0.95, uv.y + (n - 0.5) * 0.35);

  vec3 col = mix(abyss, neel, smoothstep(0.0, 0.55, h));
  col = mix(col, blue, smoothstep(0.45, 0.9, h) * 0.75);

  // Ember band sitting low — the sun already mostly gone.
  float horizon = exp(-pow((uv.y - 0.30) * 4.6, 2.0));
  col += ember * horizon * (0.28 + n * 0.30) * uIntensity;

  // Cursor light: a warm lift that follows the pointer.
  vec2 m = uMouse;
  m.x *= uRes.x / uRes.y;
  float d = distance(p, m);
  col += ember * exp(-d * 2.6) * 0.10 * uIntensity;

  // Filmic vignette — floor kept high enough that the corners still hold colour.
  float vig = smoothstep(1.3, 0.3, distance(uv, vec2(0.5)));
  col *= 0.62 + vig * 0.38;

  // Break up banding in the dark half.
  float dither = (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  col += dither;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", {
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
        depth: false,
      }) as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl || !canAfford(gl)) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    // Fullscreen triangle — cheaper than a quad, no seam.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uIntensity = gl.getUniformLocation(prog, "uIntensity");

    const reduced = prefersReducedMotion();
    const mouse = { x: 0.5, y: 0.42 };
    const target = { x: 0.5, y: 0.42 };

    const resize = () => {
      // Drawn small and scaled up by CSS: soft noise looks the same at 60%.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };

    let raf = 0;
    let running = false;
    let last = 0;
    const start = performance.now();

    const render = (now = performance.now()) => {
      if (!running) return;
      // 30fps: skip the frames in between.
      if (!reduced && now - last < FRAME_MS) {
        raf = requestAnimationFrame(render);
        return;
      }
      last = now;
      resize();
      const time = reduced ? 0 : (performance.now() - start) / 1000;

      mouse.x += (target.x - mouse.x) * 0.045;
      mouse.y += (target.y - mouse.y) * 0.045;

      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uIntensity, 1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (canvas.style.opacity !== "1") canvas.style.opacity = "1";

      // A static frame is enough when motion is not wanted.
      if (reduced) return;
      raf = requestAnimationFrame(render);
    };

    // Pause when the tab is hidden or the hero has scrolled away.
    let ready = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = ready && entry.isIntersecting && !document.hidden;
        if (shouldRun && !running) {
          running = true;
          render();
        } else if (!shouldRun) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (ready && !running) {
        running = true;
        render();
      }
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("webglcontextlost", onLost);

    // Start once the page has settled; until then the CSS sky shows.
    const begin = () => {
      ready = true;
      if (document.hidden) return;
      running = true;
      render();
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(begin, { timeout: 3000 })
      : window.setTimeout(begin, 1500);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      // Invisible until its first frame (the canvas is opaque, so before
      // that it would be a black box); devices that skip the live sky keep
      // it invisible over the CSS gradient.
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
    />
  );
}
