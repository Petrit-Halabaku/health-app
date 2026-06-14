import { useEffect, useRef, type DependencyList, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const EASE = 'power3.out';

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Scope a GSAP timeline to a container ref. The setup runs inside a gsap.context
 * (so all tweens/ScrollTriggers are reverted on unmount). Skipped entirely when the
 * user prefers reduced motion — elements then fall back to their CSS resting state.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (self: T) => void,
  deps: DependencyList = [],
): RefObject<T> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => setup(el), el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/**
 * Reveal direct/`data-reveal` descendants with a staggered rise as they scroll in.
 * Returns a ref to attach to the container.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  opts: { selector?: string; y?: number; stagger?: number; start?: string } = {},
): RefObject<T> {
  const { selector = '[data-reveal]', y = 22, stagger = 0.09, start = 'top 85%' } = opts;
  return useGsap<T>((self) => {
    const items = gsap.utils.toArray<HTMLElement>(self.querySelectorAll(selector));
    items.forEach((item) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: EASE,
          stagger,
          scrollTrigger: { trigger: item, start },
        },
      );
    });
  }, []);
}

/**
 * Animate an element's text from 0 to `end` when it scrolls into view.
 * Respects reduced motion (renders the final value immediately).
 */
export function countUp(
  el: HTMLElement,
  end: number,
  opts: { duration?: number; decimals?: number; prefix?: string; suffix?: string } = {},
): void {
  const { duration = 1.8, decimals = 0, prefix = '', suffix = '' } = opts;
  const format = (v: number) =>
    `${prefix}${v.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  if (prefersReducedMotion()) {
    el.textContent = format(end);
    return;
  }

  const obj = { v: 0 };
  gsap.to(obj, {
    v: end,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = format(obj.v);
    },
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  });
}
