// src/utils/magnetic.ts
// Shared magnetic button attraction effect.
// Returns a cleanup function — call it on astro:before-swap or whenever
// the element is removed from the DOM.

interface MagneticOptions {
  /** How far the element moves toward the pointer (0–1). Default 0.38 */
  strength?: number;
  /** Activation zone = max(width, height) × this multiplier. Default 1.6 */
  radiusMultiplier?: number;
}

export function initMagnetic(
  el: HTMLElement,
  { strength = 0.38, radiusMultiplier = 1.6 }: MagneticOptions = {},
): () => void {
  let rafId: ReturnType<typeof requestAnimationFrame> | null = null;

  const onMove = (e: MouseEvent) => {
    const rect   = el.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = e.clientX - cx;
    const dy     = e.clientY - cy;
    const dist   = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.max(rect.width, rect.height) * radiusMultiplier;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      el.style.transform = dist < radius
        ? `translate(${dx * strength * (1 - dist / radius)}px, ${dy * strength * (1 - dist / radius)}px)`
        : '';
    });
  };

  const onLeave = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    el.style.transform = '';
  };

  document.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);

  return () => {
    document.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  };
}
