import React from 'react';
import * as THREE from 'three';
import { INK, BRAND } from '../design/tokens';
import { prefersReducedMotion } from '../design/motion';

interface GlobeProps {
  className?: string;
}

/**
 * A lightweight, monochrome point-cloud globe — ink dots forming a sphere on the paper
 * canvas, with a handful of teal "data signals" pulsing on its surface. Raw three.js,
 * one geometry per layer, capped DPR, pointer parallax, paused when offscreen / hidden,
 * reduced detail on small screens and a single static frame under reduced-motion.
 */
export const Globe: React.FC<GlobeProps> = ({ className }) => {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    const isSmall = window.matchMedia('(max-width: 768px)').matches;
    const RADIUS = 1;
    const COUNT = isSmall ? 1400 : 2600;
    const SIGNALS = isSmall ? 9 : 16;
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.75 : 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // pivot eases toward the pointer (parallax); group carries the constant spin.
    const pivot = new THREE.Group();
    pivot.rotation.z = -0.38; // tilt the axis, editorial
    scene.add(pivot);
    const group = new THREE.Group();
    pivot.add(group);

    // ---- Fibonacci-sphere point positions ----
    const positions = new Float32Array(COUNT * 3);
    const golden = Math.PI * (1 + Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
      const theta = golden * i;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      positions[i * 3] = x * RADIUS;
      positions[i * 3 + 1] = y * RADIUS;
      positions[i * 3 + 2] = z * RADIUS;
    }

    // Depth-faded round points so the far side of the sphere reads dimmer.
    const dotVertex = /* glsl */ `
      uniform float uSize;
      uniform float uDpr;
      varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr * (1.0 / -mv.z);
      }
    `;
    const dotFragment = /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vDepth;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float edge = smoothstep(0.5, 0.36, d);
        float depthFade = smoothstep(4.7, 2.7, vDepth);
        gl_FragColor = vec4(uColor, edge * uOpacity * (0.18 + 0.82 * depthFade));
      }
    `;

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dotMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 8.5 },
        uDpr: { value: dpr },
        uColor: { value: new THREE.Color(INK) },
        uOpacity: { value: 0.9 },
      },
      vertexShader: dotVertex,
      fragmentShader: dotFragment,
      transparent: true,
      depthWrite: false,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    group.add(dots);

    // ---- Signal points (teal, pulsing) ----
    const sigPos = new Float32Array(SIGNALS * 3);
    const sigPhase = new Float32Array(SIGNALS);
    for (let i = 0; i < SIGNALS; i++) {
      const src = Math.floor((i / SIGNALS) * COUNT + COUNT * 0.137) % COUNT;
      sigPos[i * 3] = positions[src * 3];
      sigPos[i * 3 + 1] = positions[src * 3 + 1];
      sigPos[i * 3 + 2] = positions[src * 3 + 2];
      sigPhase[i] = (i * 1.7) % (Math.PI * 2);
    }
    const sigVertex = /* glsl */ `
      uniform float uSize;
      uniform float uDpr;
      uniform float uTime;
      attribute float aPhase;
      varying float vDepth;
      varying float vPulse;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        vPulse = 0.5 + 0.5 * sin(uTime * 1.8 + aPhase);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr * (0.7 + 0.6 * vPulse) * (1.0 / -mv.z);
      }
    `;
    const sigFragment = /* glsl */ `
      uniform vec3 uColor;
      varying float vDepth;
      varying float vPulse;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        float depthFade = smoothstep(4.7, 2.7, vDepth);
        gl_FragColor = vec4(uColor, core * (0.45 + 0.55 * vPulse) * (0.25 + 0.75 * depthFade));
      }
    `;
    const sigGeo = new THREE.BufferGeometry();
    sigGeo.setAttribute('position', new THREE.BufferAttribute(sigPos, 3));
    sigGeo.setAttribute('aPhase', new THREE.BufferAttribute(sigPhase, 1));
    const sigMat = new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: 26 },
        uDpr: { value: dpr },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(BRAND) },
      },
      vertexShader: sigVertex,
      fragmentShader: sigFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const signals = new THREE.Points(sigGeo, sigMat);
    group.add(signals);

    // ---- Faint equatorial ring ----
    const ringSegs = 128;
    const ringPos = new Float32Array((ringSegs + 1) * 3);
    for (let i = 0; i <= ringSegs; i++) {
      const a = (i / ringSegs) * Math.PI * 2;
      ringPos[i * 3] = Math.cos(a) * RADIUS * 1.32;
      ringPos[i * 3 + 1] = 0;
      ringPos[i * 3 + 2] = Math.sin(a) * RADIUS * 1.32;
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    const ringMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(INK),
      transparent: true,
      opacity: 0.14,
    });
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.5 - 0.35;
    group.add(ring);

    // ---- Sizing ----
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---- Pointer parallax ----
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true });

    // ---- Animation loop (paused offscreen / when tab hidden) ----
    let raf = 0;
    let visible = true;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      sigMat.uniforms.uTime.value = t;
      group.rotation.y += 0.0016;
      pivot.rotation.x += (target.y * 0.2 - pivot.rotation.x) * 0.045;
      pivot.rotation.y += (target.x * 0.28 - pivot.rotation.y) * 0.045;
      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf || reduced) return;
      clock.start();
      loop();
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(mount);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // First paint (also the only paint under reduced motion).
    renderer.render(scene, camera);
    if (!reduced) start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      dotGeo.dispose();
      dotMat.dispose();
      sigGeo.dispose();
      sigMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
};
