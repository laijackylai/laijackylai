import { useEffect } from 'react';

type Dot = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
};

type Layer = {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dots: Dot[];
  width: number;
  height: number;
};

const RADIUS = 240;
const MAX_PUSH = 5;
const DOT_SPACING = 18;

type Props = {
  routeKey?: string;
};

const InteractiveNoise: React.FC<Props> = ({ routeKey = '' }) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');

    if (reduceMotion.matches || coarsePointer.matches) {
      return undefined;
    }

    const containers = Array.from(document.querySelectorAll<HTMLElement>('.noise-bg'));

    if (containers.length === 0) {
      return undefined;
    }

    const layers: Layer[] = [];
    const resizeObservers: ResizeObserver[] = [];
    let animationFrame: number | null = null;
    let pointer = { x: -9999, y: -9999 };
    let easedPointer = { x: -9999, y: -9999 };

    const generateDots = (width: number, height: number) => {
      const dots: Dot[] = [];

      for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
        for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
          dots.push({
            x,
            y,
            radius: 0.55,
            alpha: 0.2,
          });
        }
      }

      return dots;
    };

    const resizeLayer = (layer: Layer) => {
      const rect = layer.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.ceil(rect.width);
      const height = Math.ceil(rect.height);

      layer.width = width;
      layer.height = height;
      layer.canvas.width = Math.ceil(width * dpr);
      layer.canvas.height = Math.ceil(height * dpr);
      layer.canvas.style.width = `${width}px`;
      layer.canvas.style.height = `${height}px`;
      layer.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      layer.dots = generateDots(width, height);
    };

    const drawLayer = (layer: Layer) => {
      const { context, dots, width, height } = layer;
      const rect = layer.container.getBoundingClientRect();
      const cursorX = easedPointer.x - rect.left;
      const cursorY = easedPointer.y - rect.top;

      context.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        const dx = dot.x - cursorX;
        const dy = dot.y - cursorY;
        const distance = Math.hypot(dx, dy);
        let x = dot.x;
        let y = dot.y;

        if (distance < RADIUS && distance > 0.001) {
          const force = Math.pow(1 - distance / RADIUS, 2);
          const push = force * MAX_PUSH;

          x += (dx / distance) * push;
          y += (dy / distance) * push;
        }

        context.beginPath();
        context.fillStyle = `rgba(0, 0, 0, ${dot.alpha})`;
        context.arc(x, y, dot.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const draw = () => {
      easedPointer = {
        x: easedPointer.x + (pointer.x - easedPointer.x) * 0.12,
        y: easedPointer.y + (pointer.y - easedPointer.y) * 0.12,
      };

      layers.forEach(drawLayer);

      animationFrame = window.requestAnimationFrame(draw);
    };

    containers.forEach((container) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      canvas.className = 'interactive-noise-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      container.classList.add('noise-bg--interactive');
      container.appendChild(canvas);

      const layer: Layer = {
        container,
        canvas,
        context,
        dots: [],
        width: 0,
        height: 0,
      };

      layers.push(layer);
      resizeLayer(layer);
      drawLayer(layer);

      const observer = new ResizeObserver(() => {
        resizeLayer(layer);
        drawLayer(layer);
      });

      observer.observe(container);
      resizeObservers.push(observer);
    });

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };

    const handlePointerLeave = () => {
      pointer = { x: -9999, y: -9999 };
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      resizeObservers.forEach((observer) => observer.disconnect());
      layers.forEach((layer) => {
        layer.container.classList.remove('noise-bg--interactive');
        layer.canvas.remove();
      });
    };
  }, [routeKey]);

  return null;
};

export default InteractiveNoise;
